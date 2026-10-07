import { BaseAdminModule } from '@/lib/admin-module';

export class AdminContactModule extends BaseAdminModule {
  constructor(container) {
    super({
      container,
      title: 'Contact Settings',
      apiEndpoint: 'contact_settings',
      fields: [
        { key: 'setting_key', label: 'Setting Key', type: 'text', required: true, placeholder: 'address' },
        { key: 'setting_value', label: 'Value', type: 'textarea', required: true },
        { key: 'setting_type', label: 'Type', type: 'select', options: [{ value: 'text', label: 'Text' }, { value: 'phone', label: 'Phone' }, { value: 'email', label: 'Email' }, { value: 'hours', label: 'Opening Hours' }, { value: 'map', label: 'Map Location' }, { value: 'social', label: 'Social Links' }] },
        { key: 'is_public', label: 'Public (show on website)', type: 'checkbox' },
      ],
      searchFields: ['setting_key', 'setting_value'],
      filters: [
        { key: 'is_public', label: 'Public', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Public' }, { value: 'false', label: 'Private' }] },
      ],
      sortable: true,
      reorderable: true,
    });
  }

  async init() { await this.loadData(); this.render(); this.bindEvents(); }

  render() { this.container.innerHTML = `<div class="admin-module"><div class="admin-module__header"><h2 class="admin-module__title">${this.title}</h2><p class="admin-module__subtitle">Manage contact information</p></div>${this.showForm ? this.getFormHtml() : this.getListHtml()}</div>`; }

  getListHtml() { return `<div class="admin-module__toolbar"><input type="search" class="admin-search" placeholder="Search settings..." value="${this.search}" aria-label="Search" /><button class="btn btn--primary" data-action="create"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Setting</button></div>${this.getTableHtml()}`; }

  getTableHtml() { return `${this.isLoading ? `<div class="admin-module__loading"><div class="admin-spinner"></div></div>` : `<div class="admin-table-container"><table class="admin-table"><thead><tr><th data-sort="setting_key">Key</th><th>Value</th><th data-sort="setting_type">Type</th><th data-sort="is_public">Public</th><th data-sort="display_order">Order</th><th>Actions</th></tr></thead><tbody class="admin-table__body ${this.reorderable ? 'admin-table__body--reorderable' : ''}">${this.items.length > 0 ? this.items.map(item => `<tr data-id="${item.id}" data-order="${item.display_order}"><td><strong>${item.setting_key}</strong></td><td>${item.setting_value ? item.setting_value.substring(0, 60) + '...' : '-'}</td><td>${item.setting_type}</td><td><label class="admin-toggle"><input type="checkbox" class="admin-toggle__input" data-action="toggle-visibility" data-id="${item.id}" ${item.is_public ? 'checked' : ''}><span class="admin-toggle__slider"></span></label></td><td><input type="number" class="admin-order-input" value="${item.display_order}" data-action="update-order" data-id="${item.id}" style="width: 60px;"></td><td><div class="admin-actions"><button class="admin-action-btn" data-action="edit" data-id="${item.id}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="admin-action-btn admin-action-btn--danger" data-action="delete" data-id="${item.id}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></div></td></tr>`).join('') : `<tr><td colspan="6" class="admin-table__empty">No settings found</td></tr>`}</tbody></table></div>${this.totalPages > 1 ? this.getPaginationHtml() : ''}`; }

  getFormHtml() { const item = this.editingId ? this.items.find(i => i.id === this.editingId) : null; const isEdit = !!this.editingId; return `<div class="admin-form-container"><div class="admin-form__header"><h3 class="admin-form__title">${isEdit ? 'Edit' : 'Add'} Setting</h3><button class="btn btn--secondary" data-action="cancel">Cancel</button></div><form class="admin-form" id="admin-form" novalidate><div class="admin-form__grid">${this.fields.map(field => `<div class="admin-form__field" style="grid-column: span ${field.gridCol || 1};"><label for="${field.key}">${field.label}${field.required ? ' <span class="required-indicator">*</span>' : ''}</label>${field.type === 'select' ? `<select name="${field.key}" id="${field.key}" ${field.required ? 'required' : ''}><option value="text" ${item?.setting_type === 'text' ? 'selected' : ''}>Text</option><option value="phone" ${item?.setting_type === 'phone' ? 'selected' : ''}>Phone</option><option value="email" ${item?.setting_type === 'email' ? 'selected' : ''}>Email</option><option value="hours" ${item?.setting_type === 'hours' ? 'selected' : ''}>Opening Hours</option><option value="map" ${item?.setting_type === 'map' ? 'selected' : ''}>Map Location</option><option value="social" ${item?.setting_type === 'social' ? 'selected' : ''}>Social Links</option></select>` : field.type === 'checkbox' ? `<label class="admin-checkbox"><input type="checkbox" name="${field.key}" id="${field.key}" ${item?.[field.key] ? 'checked' : ''}><span class="admin-checkbox__checkmark"></span> ${field.label}</label>` : field.type === 'textarea' ? `<textarea name="${field.key}" id="${field.key}" rows="3" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>${item?.[field.key] || ''}</textarea>` : `<input type="${field.type}" name="${field.key}" id="${field.key}" value="${item?.[field.key] || ''}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>`}</div>`).join('')}</div><div class="admin-form__actions"><button type="button" class="btn btn--secondary" data-action="cancel">Cancel</button><button type="submit" class="btn btn--primary">${isEdit ? 'Update' : 'Create'}</button></div></form></div>`; }

  getPaginationHtml() { return `<div class="admin-pagination"><button class="btn btn--secondary btn--sm" data-action="prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button><span class="admin-pagination__info">Page ${this.currentPage} of ${this.totalPages} (${this.totalCount} total)</span><button class="btn btn--secondary btn--sm" data-action="next-page" ${this.currentPage === this.totalPages ? 'disabled' : ''}>Next</button></div>`; }
}

export function createAdminContact(container: HTMLElement) { return new AdminContactModule(container); }