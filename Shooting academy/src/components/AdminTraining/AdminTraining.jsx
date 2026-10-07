import { BaseAdminModule } from '@/lib/admin-module';

export class AdminTrainingModule extends BaseAdminModule {
  constructor(container) {
    super({
      container,
      title: 'Training Ranges',
      apiEndpoint: 'training_ranges',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'slug', label: 'Slug (URL)', type: 'text', required: true, placeholder: '10m-range' },
        { key: 'distance', label: 'Distance', type: 'text', required: true, placeholder: '10m' },
        { key: 'discipline', label: 'Discipline', type: 'select', options: [
          { value: 'air_rifle', label: 'Air Rifle' },
          { value: 'air_pistol', label: 'Air Pistol' },
          { value: 'small_bore_rifle', label: 'Small Bore Rifle' },
          { value: 'pistol', label: 'Pistol' },
          { value: 'all', label: 'All' },
        ]},
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'short_description', label: 'Short Description', type: 'textarea' },
        { key: 'image_url', label: 'Image URL', type: 'text', placeholder: 'https://...' },
        { key: 'image_alt', label: 'Image Alt Text', type: 'text' },
        { key: 'capacity', label: 'Capacity', type: 'number' },
        { key: 'is_visible', label: 'Visible', type: 'checkbox' },
        { key: 'display_order', label: 'Display Order', type: 'number' },
      ],
      searchFields: ['name', 'distance', 'discipline'],
      filters: [
        { key: 'is_visible', label: 'Visibility', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Visible' }, { value: 'false', label: 'Hidden' }] },
        { key: 'discipline', label: 'Discipline', type: 'select', options: [{ value: '', label: 'All' }, { value: 'air_rifle', label: 'Air Rifle' }, { value: 'air_pistol', label: 'Air Pistol' }, { value: 'small_bore_rifle', label: 'Small Bore Rifle' }, { value: 'pistol', label: 'Pistol' }, { value: 'all', label: 'All' }] },
      ],
      sortable: true,
      reorderable: true,
    });
  }

  async init() {
    await this.loadData();
    this.render();
    this.bindEvents();
  }

  getListHtml() {
    return `
      <div class="admin-module">
        <div class="admin-module__header">
          <h2 class="admin-module__title">${this.title}</h2>
          <p class="admin-module__subtitle">Manage training ranges</p>
        </div>
        ${this.showForm ? this.getFormHtml() : `
          <div class="admin-module__toolbar">
            <div class="admin-module__search">
              <input type="search" class="admin-search" placeholder="Search ranges..." value="${this.search}" aria-label="Search" />
            </div>
            <div class="admin-module__filters">
              ${this.filters.map(filter => `
                <select class="admin-filter" data-filter="${filter.key}" aria-label="${filter.label}">
                  <option value="">${filter.label}</option>
                  ${filter.options.map(opt => `<option value="${opt.value}" ${this.activeFilters[filter.key] === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                </select>
              `).join('')}
            </div>
            <button class="btn btn--primary" data-action="create">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Range
            </button>
          </div>
          ${this.getTableHtml()}
        `}
      </div>
    `;
  }

  getTableHtml() {
    return `
      ${this.isLoading ? `<div class="admin-module__loading"><div class="admin-spinner"></div></div>` : `
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th data-sort="name">Name</th>
                <th data-sort="distance">Distance</th>
                <th data-sort="discipline">Discipline</th>
                <th data-sort="is_visible">Visible</th>
                <th data-sort="display_order">Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody class="admin-table__body ${this.reorderable ? 'admin-table__body--reorderable' : ''}">
              ${this.items.length > 0 ? this.items.map(item => `
                <tr data-id="${item.id}" data-order="${item.display_order}">
                  <td><strong>${item.name}</strong></td>
                  <td>${item.distance}</td>
                  <td>${item.discipline || '-'}</td>
                  <td><label class="admin-toggle"><input type="checkbox" class="admin-toggle__input" data-action="toggle-visibility" data-id="${item.id}" ${item.is_visible ? 'checked' : ''}><span class="admin-toggle__slider"></span></label></td>
                  <td><input type="number" class="admin-order-input" value="${item.display_order}" data-action="update-order" data-id="${item.id}" style="width: 60px;"></td>
                  <td><div class="admin-actions"><button class="admin-action-btn" data-action="edit" data-id="${item.id}" title="Edit"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="admin-action-btn admin-action-btn--danger" data-action="delete" data-id="${item.id}" title="Delete"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></div></td>
                </tr>
              `).join('') : `<tr><td colspan="6" class="admin-table__empty">No ranges found</td></tr>`}
            </tbody>
          </table>
        </div>
        ${this.totalPages > 1 ? this.getPaginationHtml() : ''}
      `}
    `;
  }

  getFormHtml() {
    const item = this.editingId ? this.items.find(i => i.id === this.editingId) : null;
    const isEdit = !!this.editingId;
    return `
      <div class="admin-form-container">
        <div class="admin-form__header"><h3 class="admin-form__title">${isEdit ? 'Edit' : 'Add'} Range</h3><button class="btn btn--secondary" data-action="cancel">Cancel</button></div>
        <form class="admin-form" id="admin-form" novalidate>
          <div class="admin-form__grid">
            ${this.fields.map(field => `
              <div class="admin-form__field" style="grid-column: span ${field.gridCol || 1};">
                <label for="${field.key}">${field.label}${field.required ? ' <span class="required-indicator">*</span>' : ''}</label>
                ${field.type === 'select' ? `
                  <select name="${field.key}" id="${field.key}" ${field.required ? 'required' : ''}>
                    <option value="">Select</option>
                    ${field.options.map(opt => `<option value="${opt.value}" ${item?.[field.key] === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                  </select>
                ` : field.type === 'checkbox' ? `
                  <label class="admin-checkbox"><input type="checkbox" name="${field.key}" id="${field.key}" ${item?.[field.key] ? 'checked' : ''}><span class="admin-checkbox__checkmark"></span> ${field.label}</label>
                ` : field.type === 'textarea' ? `
                  <textarea name="${field.key}" id="${field.key}" rows="3" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>${item?.[field.key] || ''}</textarea>
                ` : `
                  <input type="${field.type}" name="${field.key}" id="${field.key}" value="${item?.[field.key] || ''}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} ${field.readonly ? 'readonly' : ''}>
                `}
              </div>
            `).join('')}
          </div>
          <div class="admin-form__actions"><button type="button" class="btn btn--secondary" data-action="cancel">Cancel</button><button type="submit" class="btn btn--primary">${isEdit ? 'Update' : 'Create'}</button></div>
        </form>
      </div>
    `;
  }

  getPaginationHtml() {
    return `<div class="admin-pagination"><button class="btn btn--secondary btn--sm" data-action="prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button><span class="admin-pagination__info">Page ${this.currentPage} of ${this.totalPages} (${this.totalCount} total)</span><button class="btn btn--secondary btn--sm" data-action="next-page" ${this.currentPage === this.totalPages ? 'disabled' : ''}>Next</button></div>`;
  }
}

export function createAdminTraining(container) {
  return new AdminTrainingModule(container);
}