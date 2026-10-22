export interface AdminModuleConfig {
  container: HTMLElement;
  title: string;
  apiEndpoint: string;
  fields: AdminField[];
  searchFields?: string[];
  filters?: AdminFilter[];
  sortable?: boolean;
  reorderable?: boolean;
  onCreate?: (data: any) => Promise<any>;
  onUpdate?: (id: string, data: any) => Promise<any>;
  onDelete?: (id: string) => Promise<void>;
}

export interface AdminField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'image' | 'date' | 'datetime' | 'hidden';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: (value: any) => string | null;
  readonly?: boolean;
  gridCol?: number;
}

export interface AdminFilter {
  key: string;
  label: string;
  type: 'select' | 'checkbox';
  options: { value: string; label: string }[];
}

export interface AdminModule {
  destroy(): void;
}

export abstract class BaseAdminModule implements AdminModule {
  protected container: HTMLElement;
  protected title: string;
  protected apiEndpoint: string;
  protected fields: AdminField[];
  protected searchFields: string[];
  protected filters: AdminFilter[];
  protected sortable: boolean;
  protected reorderable: boolean;
  protected currentPage = 1;
  protected pageSize = 20;
  protected search = '';
  protected sortBy = 'display_order';
  protected sortOrder: 'asc' | 'desc' = 'asc';
  protected activeFilters: Record<string, string> = {};
  protected items: any[] = [];
  protected totalCount = 0;
  protected totalPages = 0;
  protected isLoading = false;
  protected error: string | null = null;
  protected editingId: string | null = null;
  protected showForm = false;
  protected onCreate?: (data: any) => Promise<any>;
  protected onUpdate?: (id: string, data: any) => Promise<any>;
  protected onDelete?: (id: string) => Promise<void>;
  private boundEvents: Set<string> = new Set();
  private boundFormEvents: Set<string> = new Set();

  constructor(config: AdminModuleConfig) {
    this.container = config.container;
    this.title = config.title;
    this.apiEndpoint = config.apiEndpoint;
    this.fields = config.fields;
    this.searchFields = config.searchFields || [];
    this.filters = config.filters || [];
    this.sortable = config.sortable !== false;
    this.reorderable = config.reorderable !== false;
    this.onCreate = config.onCreate;
    this.onUpdate = config.onUpdate;
    this.onDelete = config.onDelete;
  }
  isMobile(): boolean {
  return window.matchMedia('(max-width: 768px)').matches;
}


unbindEvents() {
  this.container.querySelectorAll('.js-admin-bound').forEach((el) => {
    const listener = el._adminEventListener;

    if (listener) {
      el.removeEventListener('click', listener);
      delete el._adminEventListener;
    }
  });
}

unbindFormEvents() {
  this.container.querySelectorAll('.js-admin-bound').forEach((el) => {
    const listener = el._adminFormListener;

    if (listener) {
      el.removeEventListener('change', listener);
      delete el._adminFormListener;
    }
  });
}


  bindEvents(handlers: {selector: string; handler: EventListener}[] = []) {
    this.unbindEvents();

    for (const {selector, handler} of handlers) {
      const elements = this.container.querySelectorAll(selector);
      for (const el of elements) {
        el._adminEventListener = handler;
        el.addEventListener('click', handler);
        el.classList.add('js-admin-bound');
      }
    }
  }

  bindFormEvents(handlers: {selector: string; handler: EventListener}[] = []) {
    this.unbindFormEvents();

    for (const {selector, handler} of handlers) {
      const elements = this.container.querySelectorAll(selector);
      for (const el of elements) {
        el._adminFormListener = handler;
        el.addEventListener('change', handler);
        el.classList.add('js-admin-bound');
      }
    }
  }

  abstract init(): Promise<void>;
  abstract render(): void;
  abstract bindEvents(): void;

  async loadData() {
    this.isLoading = true;
    this.error = null;
    this.render();
    try {
      const { adminList } = await import('@/lib/admin-api');
      const response = await adminList(this.apiEndpoint, {
        page: this.currentPage,
        pageSize: this.pageSize,
        search: this.search,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
        filters: this.activeFilters,
      });
      this.items = Array.isArray(response.data) ? response.data : [];
      this.totalCount = response.count;
      this.totalPages = response.totalPages;
    } catch (err) {
      console.error('Failed to load data:', err);
      this.error = err.message || 'Failed to load data';
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  async handleCreate(data: any) {
    try {
      if (this.onCreate) {
        await this.onCreate(data);
      } else {
        const { adminCreate } = await import('@/lib/admin-api');
        await adminCreate(this.apiEndpoint, data);
      }
      this.showForm = false;
      this.editingId = null;
      await this.loadData();
    } catch (err) {
      alert(err.message || 'Failed to create');
    }
  }

  async handleUpdate(id: string, data: any) {
    try {
      if (this.onUpdate) {
        await this.onUpdate(id, data);
      } else {
        const { adminUpdate } = await import('@/lib/admin-api');
        await adminUpdate(this.apiEndpoint, id, data);
      }
      this.showForm = false;
      this.editingId = null;
      await this.loadData();
    } catch (err) {
      alert(err.message || 'Failed to update');
    }
  }

  async handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      if (this.onDelete) {
        await this.onDelete(id);
      } else {
        const { adminDelete } = await import('@/lib/admin-api');
        await adminDelete(this.apiEndpoint, id);
      }
      await this.loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  }

  async handleToggleVisibility(id: string, isVisible: boolean) {
    try {
      const { adminToggleVisibility } = await import('@/lib/admin-api');
      await adminToggleVisibility(this.apiEndpoint, id, isVisible);
      await this.loadData();
    } catch (err) {
      alert(err.message || 'Failed to update visibility');
    }
  }

  async handleToggleFeatured(id: string, isFeatured: boolean) {
    try {
      const { adminToggleFeatured } = await import('@/lib/admin-api');
      await adminToggleFeatured(this.apiEndpoint, id, isFeatured);
      await this.loadData();
    } catch (err) {
      alert(err.message || 'Failed to update featured status');
    }
  }

  async handleReorder(items: { id: string; display_order: number }[]) {
    try {
      const { adminReorder } = await import('@/lib/admin-api');
      await adminReorder(this.apiEndpoint, items);
      await this.loadData();
    } catch (err) {
      alert(err.message || 'Failed to reorder');
    }
  }

  showCreateForm() {
    this.editingId = null;
    this.showForm = true;
    this.render();
    this.bindFormEvents();
  }

  showEditForm(item: any) {
    this.editingId = item.id;
    this.showForm = true;
    this.render();
    this.bindFormEvents();
    this.populateForm(item);
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.render();
  }

  populateForm(item: any) {
    this.fields.forEach(field => {
      const input = this.container.querySelector(`[name="${field.key}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (input && item[field.key] !== undefined) {
        if (field.type === 'checkbox') {
          input.checked = !!item[field.key];
        } else {
          input.value = item[field.key] || '';
        }
      }
    });
  }

  getFormData(): Record<string, any> {
    const data: Record<string, any> = {};
    this.fields.forEach(field => {
      const input = this.container.querySelector(`[name="${field.key}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (input) {
        if (field.type === 'checkbox') {
          data[field.key] = input.checked;
        } else if (field.type === 'number') {
          data[field.key] = input.value ? parseFloat(input.value) : null;
        } else {
          data[field.key] = input.value || null;
        }
      }
    });
    return data;
  }

  validateForm(data: Record<string, any>): string | null {
    for (const field of this.fields) {
      if (field.required && (!data[field.key] || (typeof data[field.key] === 'string' && !data[field.key].trim()))) {
        return `${field.label} is required`;
      }
      if (field.validation) {
        const error = field.validation(data[field.key]);
        if (error) return error;
      }
    }
    return null;
  }

  getTableColumns() {
    return this.fields
      .filter(f => f.type !== 'hidden' && f.type !== 'textarea' && f.type !== 'image')
      .slice(0, 6);
  }

  getTableRow(item: any) {
    return this.getTableColumns().map(field => {
      let value = item[field.key];
      if (value === null || value === undefined) return '-';
      if (field.type === 'checkbox') return value ? 'Yes' : 'No';
      if (field.type === 'image' && value) return `<img src="${value}" alt="" style="width: 40px; height: 40px; object-fit: cover; border-radius: var(--radius-sm);">`;
      if (typeof value === 'string' && value.length > 50) return value.substring(0, 50) + '...';
      return value;
    }).join('');
  }

  formatFieldValue(item: any, key: string): string {
    const field = this.fields.find(f => f.key === key);
    const value = item?.[key];
    if (value === null || value === undefined || value === '') return '-';
    if (field?.type === 'select') {
      const option = (field.options || []).find(opt => String(opt.value) === String(value));
      return option ? option.label : String(value);
    }
    return String(value);
  }

  getMobileCardTitle(item: any): string {
    const titleKeys = ['name', 'title', 'athlete_name', 'author_name', 'session_name', 'section_name', 'coach_name'];
    for (const key of titleKeys) {
      if (item?.[key]) return String(item[key]);
    }
    return 'Untitled';
  }

  getMobileCardSubtitle(item: any): string {
    const subtitleKeys = ['author_role', 'competition', 'role', 'designation', 'email', 'category', 'event'];
    for (const key of subtitleKeys) {
      if (item?.[key]) return String(item[key]);
    }
    return '';
  }

  getMobileCardBadgeHtml(item: any): string {
    return '';
  }

  getMobileCardMetaItems(item: any): { label: string; value: string }[] {
    const titleKeys = ['name', 'title', 'athlete_name', 'author_name', 'session_name', 'section_name', 'coach_name'];
    const subtitleKeys = ['author_role', 'competition', 'role', 'designation', 'email', 'category', 'event'];
    const skipTypes: string[] = ['textarea', 'image', 'checkbox', 'hidden', 'file'];
    const metaItems: { label: string; value: string }[] = [];
    for (const field of this.fields) {
      if (metaItems.length >= 3) break;
      if (skipTypes.includes(field.type)) continue;
      if (titleKeys.includes(field.key) || subtitleKeys.includes(field.key)) continue;
      const value = this.formatFieldValue(item, field.key);
      if (value === '-') continue;
      metaItems.push({ label: field.label, value });
    }
    return metaItems;
  }

  getMobileCardMetaHtml(item: any): string {
    const metaItems = this.getMobileCardMetaItems(item);
    if (metaItems.length === 0) return '';
    return `<div class="admin-card__meta">${metaItems.map(meta => `<span class="admin-card__meta-item"><strong>${meta.label}:</strong> ${meta.value}</span>`).join('')}</div>`;
  }

  getMobileCardTogglesHtml(item: any): string {
    let html = '';
    if ('is_visible' in item) {
      html += `<label class="admin-card__toggle"><span class="admin-card__toggle-label">Visible</span><label class="admin-toggle"><input type="checkbox" class="admin-toggle__input" data-action="toggle-visibility" data-id="${item.id}" ${item.is_visible ? 'checked' : ''}><span class="admin-toggle__slider"></span></label></label>`;
    }
    if ('is_featured' in item) {
      html += `<label class="admin-card__toggle"><span class="admin-card__toggle-label">Featured</span><label class="admin-toggle"><input type="checkbox" class="admin-toggle__input" data-action="toggle-featured" data-id="${item.id}" ${item.is_featured ? 'checked' : ''}><span class="admin-toggle__slider"></span></label></label>`;
    }
    return html;
  }

  getMobileCardOrderHtml(item: any): string {
    if (!this.reorderable || !('display_order' in item)) return '';
    return `<input type="number" class="admin-order-input" value="${item.display_order ?? 0}" data-action="update-order" data-id="${item.id}" aria-label="Display order">`;
  }

  getMobileCardActionsHtml(item: any): string {
    return `<div class="admin-card__actions">
      <button class="admin-action-btn" data-action="edit" data-id="${item.id}" title="Edit">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
      <button class="admin-action-btn admin-action-btn--danger" data-action="delete" data-id="${item.id}" title="Delete">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>`;
  }

  getMobileCardItemHtml(item: any): string {
    const subtitle = this.getMobileCardSubtitle(item);
    const badge = this.getMobileCardBadgeHtml(item);
    const meta = this.getMobileCardMetaHtml(item);
    const toggles = this.getMobileCardTogglesHtml(item);
    const order = this.getMobileCardOrderHtml(item);
    const actions = this.getMobileCardActionsHtml(item);

    return `
      <div class="admin-card" data-id="${item.id}">
        <div class="admin-card__body">
          <div class="admin-card__header">
            <h4 class="admin-card__title">${this.getMobileCardTitle(item)}</h4>
            ${badge}
          </div>
          ${subtitle ? `<p class="admin-card__subtitle">${subtitle}</p>` : ''}
          ${meta}
        </div>
        ${toggles || order ? `<div class="admin-card__controls">${toggles}${order}</div>` : ''}
        ${actions}
      </div>
    `;
  }

  getMobileCardHtml(): string {
    if (this.error) {
      return `<div class="admin-module__error">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        <h3>Failed to load data</h3>
        <p>${this.error}</p>
        <button class="btn btn--primary" data-action="retry">Retry</button>
      </div>`;
    }

    if (this.isLoading) {
      return `<div class="admin-module__loading"><div class="admin-spinner"></div></div>`;
    }

    if (this.items.length === 0) {
      return `<div class="admin-cards__empty">No items found</div>`;
    }

    return `<div class="admin-cards-grid">${this.items.map(item => this.getMobileCardItemHtml(item)).join('')}</div>${this.totalPages > 1 ? this.getPaginationHtml() : ''}`;
  }

  getPaginationHtml(): string {
    return `<div class="admin-pagination"><button class="btn btn--secondary btn--sm" data-action="prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button><span class="admin-pagination__info">Page ${this.currentPage} of ${this.totalPages} (${this.totalCount} total)</span><button class="btn btn--secondary btn--sm" data-action="next-page" ${this.currentPage === this.totalPages ? 'disabled' : ''}>Next</button></div>`;
  }

  destroy() {
    this.container.innerHTML = '';
  }

  // Default table rendering - can be overridden by subclasses
  protected getDefaultTableHtml(): string {
    if (this.error) {
      return `
        <div class="admin-module__error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <h3>Failed to load data</h3>
          <p>${this.error}</p>
          <button class="btn btn--primary" data-action="retry">Retry</button>
        </div>
      `;
    }

    if (this.isLoading) {
      return `<div class="admin-module__loading"><div class="admin-spinner"></div></div>`;
    }

    const columns = this.getTableColumns();
    const rows = this.items.length > 0 ? this.items.map(item => `
      <tr data-id="${item.id}" data-order="${item.display_order || 0}">
        ${columns.map(field => {
          let value = item[field.key];
          if (value === null || value === undefined) return '<td>-</td>';
          if (field.type === 'checkbox') return `<td>${value ? 'Yes' : 'No'}</td>`;
          if (field.type === 'image' && value) return `<td><img src="${value}" alt="" style="width: 40px; height: 40px; object-fit: cover; border-radius: var(--radius-sm);"></td>`;
          if (typeof value === 'string' && value.length > 50) return `<td>${value.substring(0, 50)}...</td>`;
          return `<td>${value}</td>`;
        }).join('')}
        <td>
          <div class="admin-actions">
            <button class="admin-action-btn" data-action="edit" data-id="${item.id}" title="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="admin-action-btn admin-action-btn--danger" data-action="delete" data-id="${item.id}" title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="${columns.length + 1}" class="admin-table__empty">No items found</td></tr>`;

    return `<div class="admin-table-container">
      <table class="admin-table">
        <thead>
          <tr>
            ${columns.map(field => `<th data-sort="${field.key}">${field.label}</th>`).join('')}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody class="admin-table__body ${this.reorderable ? 'admin-table__body--reorderable' : ''}">
          ${rows}
        </tbody>
      </table>
    </div>${this.totalPages > 1 ? this.getPaginationHtml() : ''}`;
  }
}
