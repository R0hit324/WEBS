// Admin Audit Logging Client
//
// Provides a simple interface for admin modules to log actions to the
// admin_audit_log table via the `log_admin_action` RPC.
// All calls are fire-and-forget (non-blocking) with silent failure
// to never interrupt the primary admin workflow.
//
// Usage (inside any admin module):
//   import { logAdminAction } from '@/lib/admin-audit';
//   await logAdminAction('create', 'gallery_images', newId, null, newData);
//   await logAdminAction('update', 'gallery_images', id, oldData, newData);
//   await logAdminAction('delete', 'gallery_images', id, oldData, null);
//   await logAdminAction('toggle_visibility', 'gallery_images', id, {is_visible: false}, {is_visible: true});
//   await logAdminAction('upload_image', 'gallery_images', id, null, {storage_path: '...'});

import { getAdminSession } from './admin-auth';
import { getSupabaseConfig } from './supabase';

type AdminAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'toggle_visibility'
  | 'toggle_featured'
  | 'reorder'
  | 'upload_image'
  | 'delete_image';

interface LogAdminActionParams {
  action: AdminAction;
  tableName: string;
  recordId?: string | null;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
}

/**
 * Log an admin action to the audit trail.
 *
 * Fire-and-forget: returns a Promise that resolves to the request_id
 * on success, or null on failure (network, auth, permissions).
 * Never throws — failures are logged to console only.
 */
export async function logAdminAction({
  action,
  tableName,
  recordId = null,
  oldData = null,
  newData = null,
  metadata = {},
}: LogAdminActionParams): Promise<string | null> {
  try {
    // Get current admin session (includes JWT for RLS)
    const session = await getAdminSession();
    if (!session?.access_token) {
      console.warn('[AdminAudit] No active admin session; skipping audit log');
      return null;
    }

    const config = getSupabaseConfig();
    if (!config.url || !config.anonKey) {
      console.warn('[AdminAudit] Supabase not configured; skipping audit log');
      return null;
    }

    // Enrich metadata with request context
    const enrichedMetadata = {
      ...metadata,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(`${config.url}/rest/v1/rpc/log_admin_action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.anonKey,
        'Authorization': `Bearer ${session.access_token}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        p_action: action,
        p_table_name: tableName,
        p_record_id: recordId,
        p_old_data: oldData,
        p_new_data: newData,
        p_metadata: enrichedMetadata,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.warn(`[AdminAudit] RPC failed (${response.status}):`, errorText.slice(0, 200));
      return null;
    }

    const result = await response.json();
    // RPC returns the request_id (uuid)
    return result as string;
  } catch (err) {
    // Silent failure — audit logging must never break the main flow
    console.warn('[AdminAudit] Unexpected error:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

/**
 * Convenience helpers for common patterns.
 * These infer the table name from the module's TABLES constant.
 */
export function createAuditHelpers(tableName: string) {
  return {
    logCreate: (recordId: string, newData: Record<string, unknown>, meta?: Record<string, unknown>) =>
      logAdminAction({ action: 'create', tableName, recordId, oldData: null, newData, metadata: meta }),

    logUpdate: (recordId: string, oldData: Record<string, unknown>, newData: Record<string, unknown>, meta?: Record<string, unknown>) =>
      logAdminAction({ action: 'update', tableName, recordId, oldData, newData, metadata: meta }),

    logDelete: (recordId: string, oldData: Record<string, unknown>, meta?: Record<string, unknown>) =>
      logAdminAction({ action: 'delete', tableName, recordId, oldData, newData: null, metadata: meta }),

    logToggleVisibility: (recordId: string, oldValue: boolean, newValue: boolean, meta?: Record<string, unknown>) =>
      logAdminAction({
        action: 'toggle_visibility',
        tableName,
        recordId,
        oldData: { is_visible: oldValue },
        newData: { is_visible: newValue },
        metadata: meta,
      }),

    logToggleFeatured: (recordId: string, oldValue: boolean, newValue: boolean, meta?: Record<string, unknown>) =>
      logAdminAction({
        action: 'toggle_featured',
        tableName,
        recordId,
        oldData: { is_featured: oldValue },
        newData: { is_featured: newValue },
        metadata: meta,
      }),

    logReorder: (items: { id: string; display_order: number }[], meta?: Record<string, unknown>) =>
      logAdminAction({
        action: 'reorder',
        tableName,
        recordId: null,
        oldData: null,
        newData: { items },
        metadata: meta,
      }),

    logUploadImage: (recordId: string, storagePath: string, meta?: Record<string, unknown>) =>
      logAdminAction({
        action: 'upload_image',
        tableName,
        recordId,
        oldData: null,
        newData: { storage_path: storagePath },
        metadata: meta,
      }),

    logDeleteImage: (recordId: string, storagePath: string, meta?: Record<string, unknown>) =>
      logAdminAction({
        action: 'delete_image',
        tableName,
        recordId,
        oldData: { storage_path: storagePath },
        newData: null,
        metadata: meta,
      }),
  };
}

/**
 * Decorator to auto-log CRUD operations on a BaseAdminModule subclass.
 * Usage:
 *   class MyModule extends BaseAdminModule {
 *     @auditLogged(TABLES.MY_TABLE)
 *     async handleCreate(data) { ... }
 *     @auditLogged(TABLES.MY_TABLE)
 *     async handleUpdate(id, data) { ... }
 *   }
 * Note: Requires the method to return the created/updated record or ID.
 */
export function auditLogged(tableName: string) {
  return function (_target: unknown, _propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (this: any, ...args: unknown[]) {
      const helpers = createAuditHelpers(tableName);
      const methodName = originalMethod.name;

      // Capture old data for update/delete
      let oldData: Record<string, unknown> | null = null;
      if (methodName === 'handleUpdate' || methodName === 'handleDelete') {
        const recordId = args[0] as string;
        if (recordId) {
          try {
            const { adminGet } = await import('@/lib/admin-api');
            oldData = await adminGet(tableName, recordId);
          } catch {
            // ignore fetch errors; oldData stays null
          }
        }
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Log based on method name
      try {
        if (methodName === 'handleCreate' && result?.id) {
          await helpers.logCreate(result.id, result);
        } else if (methodName === 'handleUpdate' && args[0]) {
          await helpers.logUpdate(args[0] as string, oldData, result);
        } else if (methodName === 'handleDelete' && args[0]) {
          await helpers.logDelete(args[0] as string, oldData);
        }
      } catch {
        // Ignore audit errors
      }

      return result;
    };
    return descriptor;
  };
}