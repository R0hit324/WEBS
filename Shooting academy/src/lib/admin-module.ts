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
  protected editingId: string | null = null;
  protected showForm = false;
  protected onCreate?: (data: any) => Promise<any>;
  protected onUpdate?: (id: string, data: any) => Promise<any>;
  protected onDelete?: (id: string) => Promise<void>;

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

  abstract init(): Promise<void>;
  abstract render(): void;
  abstract bindEvents(): void;

  async loadData() {
    this.isLoading = true;
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
      this.items = response.data;
      this.totalCount = response.count;
      this.totalPages = response.totalPages;
    } catch (err) {
      console.error('Failed to load data:', err);
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

  destroy() {
    this.container.innerHTML = '';
  }
}