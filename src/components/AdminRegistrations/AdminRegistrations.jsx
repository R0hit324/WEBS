import { BaseAdminModule } from '@/lib/admin-module';

export class AdminRegistrationsModule extends BaseAdminModule {
  constructor(container) {
    super({
      container,
      title: 'Registrations',
      apiEndpoint: 'registrations',
      fields: [
        { key: 'full_name', label: 'Full Name', type: 'text', readonly: true },
        { key: 'age', label: 'Age', type: 'number', readonly: true },
        { key: 'phone', label: 'Phone', type: 'text', readonly: true },
        { key: 'email', label: 'Email', type: 'email', readonly: true },
        { key: 'city', label: 'City', type: 'text', readonly: true },
        { key: 'interested_range', label: 'Interested Range', type: 'text', readonly: true },
        { key: 'experience_level', label: 'Experience Level', type: 'text', readonly: true },
        { key: 'message', label: 'Message', type: 'textarea', readonly: true },
        { key: 'status', label: 'Status', type: 'select', options: [{ value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' }, { value: 'completed', label: 'Completed' }, { value: 'rejected', label: 'Rejected' }] },
        { key: 'admin_notes', label: 'Admin Notes', type: 'textarea' },
        { key: 'source', label: 'Source', type: 'text', readonly: true },
        { key: 'created_at', label: 'Submitted', type: 'datetime', readonly: true },
      ],
      searchFields: ['full_name', 'email', 'phone', 'city'],
      filters: [
        { key: 'status', label: 'Status', type: 'select', options: [{ value: '', label: 'All' }, { value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' }, { value: 'completed', label: 'Completed' }, { value: 'rejected', label: 'Rejected' }] },
      ],
      sortable: true,
      reorderable: false,
    });
  }

  async init() { await this.loadData(); this.render(); this.bindEvents(); }

  render() { this.container.innerHTML = `<div class="admin-module"><div class="admin-module__header"><h2 class="admin-module__title">${this.title}</h2><p class="admin-module__subtitle">Manage registration requests (read-only, status editable)</p></div>${this.showForm ? this.getFormHtml() : this.getListHtml()}</div>`; }

  getListHtml() { return `<div class="admin-module__toolbar"><input type="search" class="admin-search" placeholder="Search registrations..." value="${this.search}" aria-label="Search" /><select class="admin-filter" data-filter="status"><option value="">Status</option><option value="new" ${this.activeFilters.status === 'new' ? 'selected' : ''}>New</option><option value="contacted" ${this.activeFilters.status === 'contacted' ? 'selected' : ''}>Contacted</option><option value="completed" ${this.activeFilters.status === 'completed' ? 'selected' : ''}>Completed</option><option value="rejected" ${this.activeFilters.status === 'rejected' ? 'selected' : ''}>Rejected</option></select></div>${this.getTableHtml()}`; }

  getTableHtml() { return `${this.isLoading ? `<div class="admin-module__loading"><div class="admin-spinner"></div></div>` : `<div class="admin-table-container"><table class="admin-table"><thead><tr><th data-sort="created_at">Date</th><th data-sort="full_name">Name</th><th>Age</th><th data-sort="email">Email</th><th data-sort="phone">Phone</th><th data-sort="city">City</th><th data-sort="interested_range">Range</th><th data-sort="status">Status</th><th>Actions</th></tr></thead><tbody>${this.items.length > 0 ? this.items.map(item => `<tr data-id="${item.id}"><td>${new Date(item.created_at).toLocaleDateString()}</td><td><strong>${item.full_name}</strong></td><td>${item.age || '-'}</td><td>${item.email}</td><td>${item.phone}</td><td>${item.city || '-'}</td><td>${item.interested_range || '-'}</td><td><span class="admin-badge admin-badge--${item.status}">${item.status}</span></td><td><div class="admin-actions"><button class="admin-action-btn" data-action="edit" data-id="${item.id}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button></div></td></tr>`).join('') : `<tr><td colspan="9" class="admin-table__empty">No registrations found</td></tr>`}</tbody></table></div>${this.totalPages > 1 ? this.getPaginationHtml() : ''}`; }

  getFormHtml() { const item = this.editingId ? this.items.find(i => i.id === this.editingId) : null; const isEdit = !!this.editingId; return `<div class="admin-form-container"><div class="admin-form__header"><h3 class="admin-form__title">${isEdit ? 'Edit' : 'View'} Registration</h3><button class="btn btn--secondary" data-action="cancel">Cancel</button></div><form class="admin-form" id="admin-form" novalidate><div class="admin-form__grid">${this.fields.map(field => `<div class="admin-form__field" style="grid-column: span ${field.gridCol || 1};"><label for="${field.key}">${field.label}</label>${field.type === 'select' ? `<select name="${field.key}" id="${field.key}"><option value="new" ${item?.status === 'new' ? 'selected' : ''}>New</option><option value="contacted" ${item?.status === 'contacted' ? 'selected' : ''}>Contacted</option><option value="completed" ${item?.status === 'completed' ? 'selected' : ''}>Completed</option><option value="rejected" ${item?.status === 'rejected' ? 'selected' : ''}>Rejected</option></select>` : field.type === 'textarea' ? `<textarea name="${field.key}" id="${field.key}" rows="3" ${field.readonly ? 'readonly' : ''}>${item?.[field.key] || ''}</textarea>` : `<input type="${field.type}" name="${field.key}" id="${field.key}" value="${item?.[field.key] || ''}" ${field.readonly ? 'readonly' : ''}>`}</div>`).join('')}</div><div class="admin-form__actions"><button type="button" class="btn btn--secondary" data-action="cancel">Cancel</button><button type="submit" class="btn btn--primary">${isEdit ? 'Update Status' : 'Close'}</button></div></form></div>`; }

  getPaginationHtml() { return `<div class="admin-pagination"><button class="btn btn--secondary btn--sm" data-action="prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button><span class="admin-pagination__info">Page ${this.currentPage} of ${this.totalPages} (${this.totalCount} total)</span><button class="btn btn--secondary btn--sm" data-action="next-page" ${this.currentPage === this.totalPages ? 'disabled' : ''}>Next</button></div>`; }
}

export function createAdminRegistrations(container: HTMLElement) { return new AdminRegistrationsModule(container); }