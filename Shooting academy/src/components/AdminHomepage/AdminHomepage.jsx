import { BaseAdminModule } from '@/lib/admin-module';

const HOMEPAGE_SECTIONS = [
  { key: 'hero', label: 'Hero Section', order: 1 },
  { key: 'highlights', label: 'Highlights Strip', order: 2 },
  { key: 'about_preview', label: 'About Preview', order: 3 },
  { key: 'training_preview', label: 'Training Preview', order: 4 },
  { key: 'coaches_preview', label: 'Coaches Preview', order: 5 },
  { key: 'achievements_preview', label: 'Achievements Preview', order: 6 },
  { key: 'facilities_preview', label: 'Facilities Preview', order: 7 },
  { key: 'gallery_preview', label: 'Gallery Preview', order: 8 },
  { key: 'reviews', label: 'Reviews Section', order: 9 },
  { key: 'motivational', label: 'Motivational Section', order: 10 },
  { key: 'final_cta', label: 'Final CTA', order: 11 },
];

const sectionFields = [
  { key: 'section_key', label: 'Section Key', type: 'hidden' },
  { key: 'section_name', label: 'Display Name', type: 'text', required: true },
];

export class AdminHomepageModule extends BaseAdminModule {
  constructor(container) {
    super({
      container,
      title: 'Homepage Content',
      apiEndpoint: 'academy_content',
      fields: [
        { key: 'section_key', label: 'Section Key', type: 'hidden' },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'subtitle', label: 'Subtitle', type: 'text' },
        { key: 'is_visible', label: 'Visible', type: 'checkbox' },
        { key: 'is_featured', label: 'Featured', type: 'checkbox' },
        { key: 'display_order', label: 'Display Order', type: 'number' },
      ],
      searchFields: ['section_key', 'title'],
      filters: [
        { key: 'is_visible', label: 'Visibility', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Visible' }, { value: 'false', label: 'Hidden' }] },
        { key: 'is_featured', label: 'Featured', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Featured' }, { value: 'false', label: 'Not Featured' }] },
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

  render() {
    this.container.innerHTML = `
      <div class="admin-module">
        <div class="admin-module__header">
          <h2 class="admin-module__title">${this.title}</h2>
          <p class="admin-module__subtitle">Manage homepage sections content</p>
        </div>
        ${this.showForm ? this.getFormHtml() : this.getListHtml()}
      </div>
    `;
  }

  getListHtml() {
    const tableContent = this.isLoading
      ? `<div class="admin-module__loading"><div class="admin-spinner"></div></div>`
      : (() => {
          const rows = this.items.length > 0 ? this.items.map(item => `
            <tr data-id="${item.id}" data-order="${item.display_order}">
              <td><strong>${this.getSectionLabel(item.section_key)}</strong></td>
              <td>${item.title || '-'}</td>
              <td>
                <label class="admin-toggle">
                  <input type="checkbox" class="admin-toggle__input" data-action="toggle-visibility" data-id="${item.id}" ${item.is_visible ? 'checked' : ''}>
                  <span class="admin-toggle__slider"></span>
                </label>
              </td>
              <td>
                <label class="admin-toggle">
                  <input type="checkbox" class="admin-toggle__input" data-action="toggle-featured" data-id="${item.id}" ${item.is_featured ? 'checked' : ''}>
                  <span class="admin-toggle__slider"></span>
                </label>
              </td>
              <td>
                <input type="number" class="admin-order-input" value="${item.display_order}" data-action="update-order" data-id="${item.id}" style="width: 60px;">
              </td>
              <td>
                <div class="admin-actions">
                  <button class="admin-action-btn" data-action="edit" data-id="${item.id}" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="admin-action-btn admin-action-btn--danger" data-action="delete" data-id="${item.id}" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          `).join('') : `<tr><td colspan="6" class="admin-table__empty">No sections found</td></tr>`;

          return `
            <div class="admin-table-container">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th data-sort="section_key">Section</th>
                    <th data-sort="title">Title</th>
                    <th data-sort="is_visible">Visible</th>
                    <th data-sort="is_featured">Featured</th>
                    <th data-sort="display_order">Order</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody class="admin-table__body ${this.reorderable ? 'admin-table__body--reorderable' : ''}">
                  ${rows}
                </tbody>
              </table>
            </div>${this.totalPages > 1 ? this.getPaginationHtml() : ''}
          `;
        })();

    return `
      <div class="admin-module__toolbar">
        <div class="admin-module__search">
          <input
            type="search"
            class="admin-search"
            placeholder="Search sections..."
            value="${this.search}"
            aria-label="Search"
          />
        </div>
        <div class="admin-module__filters">
          ${this.filters.map(filter => `
            <select class="admin-filter" data-filter="${filter.key}" aria-label="${filter.label}">
              <option value="">${filter.label}</option>
              ${filter.options.map(opt => `
                <option value="${opt.value}" ${this.activeFilters[filter.key] === opt.value ? 'selected' : ''}>${opt.label}</option>
              `).join('')}
            </select>
          `).join('')}
        </div>
        <button class="btn btn--primary" data-action="create">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Section
        </button>
      </div>
      ${tableContent}
    `;
  }

  getFormHtml() {
    const item = this.editingId ? this.items.find(i => i.id === this.editingId) : null;
    const isEdit = !!this.editingId;

    return `
      <div class="admin-form-container">
        <div class="admin-form__header">
          <h3 class="admin-form__title">${isEdit ? 'Edit' : 'Add'} Section Content</h3>
          <button class="btn btn--secondary" data-action="cancel">Cancel</button>
        </div>
        <form class="admin-form" id="admin-form" novalidate>
          <div class="admin-form__grid">
            ${this.fields.map(field => `
              <div class="admin-form__field" style="grid-column: span ${field.gridCol || 1};">
                <label for="${field.key}">${field.label}${field.required ? ' <span class="required-indicator">*</span>' : ''}</label>
                ${field.type === 'hidden' ? `
                  <input type="hidden" name="${field.key}" value="${item?.[field.key] || ''}">
                ` : field.type === 'select' ? `
                  <select name="${field.key}" id="${field.key}" ${field.required ? 'required' : ''}>
                    <option value="">Select section</option>
                    ${HOMEPAGE_SECTIONS.map(s => `
                      <option value="${s.key}" ${item?.[field.key] === s.key ? 'selected' : ''}>${s.label}</option>
                    `).join('')}
                  </select>
                ` : field.type === 'checkbox' ? `
                  <label class="admin-checkbox">
                    <input type="checkbox" name="${field.key}" id="${field.key}" ${item?.[field.key] ? 'checked' : ''}>
                    <span class="admin-checkbox__checkmark"></span>
                    ${field.label}
                  </label>
                ` : field.type === 'textarea' ? `
                  <textarea name="${field.key}" id="${field.key}" rows="4" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>${item?.[field.key] || ''}</textarea>
                ` : `
                  <input type="${field.type}" name="${field.key}" id="${field.key}" value="${item?.[field.key] || ''}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} ${field.readonly ? 'readonly' : ''}>
                `}
                ${field.required ? '<span class="admin-form__required">Required</span>' : ''}
              </div>
            `).join('')}
          </div>
          <div class="admin-form__actions">
            <button type="button" class="btn btn--secondary" data-action="cancel">Cancel</button>
            <button type="submit" class="btn btn--primary">${isEdit ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    `;
  }

  getSectionLabel(key) {
    const section = HOMEPAGE_SECTIONS.find(s => s.key === key);
    return section ? section.label : key;
  }

  getPaginationHtml() {
    return `<div class="admin-pagination"><button class="btn btn--secondary btn--sm" data-action="prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button><span class="admin-pagination__info">Page ${this.currentPage} of ${this.totalPages} (${this.totalCount} total)</span><button class="btn btn--secondary btn--sm" data-action="next-page" ${this.currentPage === this.totalPages ? 'disabled' : ''}>Next</button></div>`;
  }

  bindEvents() {
    if (this.showForm) {
      this.bindFormEvents();
      return;
    }

    // Search
    this.container.querySelector('.admin-search')?.addEventListener('input', (e) => {
      this.search = e.target.value;
      this.currentPage = 1;
      this.loadData();
    });

    // Filters
    this.container.querySelectorAll('.admin-filter').forEach(select => {
      select.addEventListener('change', (e) => {
        const key = e.target.dataset.filter;
        const value = e.target.value;
        if (value) this.activeFilters[key] = value;
        else delete this.activeFilters[key];
        this.currentPage = 1;
        this.loadData();
      });
    });

    // Sort
    this.container.querySelectorAll('[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const sortBy = th.dataset.sort;
        if (this.sortBy === sortBy) {
          this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortBy = sortBy;
          this.sortOrder = 'asc';
        }
        this.loadData();
      });
    });

    // Actions
    this.container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        const id = e.currentTarget.dataset.id;

        switch (action) {
          case 'create':
            this.showCreateForm();
            break;
          case 'edit':
            this.showEditForm(this.items.find(i => i.id === id));
            break;
          case 'delete':
            this.handleDelete(id);
            break;
          case 'toggle-visibility':
            const checkbox = e.target;
            this.handleToggleVisibility(id, checkbox.checked);
            break;
          case 'toggle-featured':
            const featCheckbox = e.target;
            this.handleToggleFeatured(id, featCheckbox.checked);
            break;
          case 'update-order':
            const orderInput = e.target;
            this.handleReorder([{ id: id, display_order: parseInt(orderInput.value) }]);
            break;
          case 'prev-page':
            if (this.currentPage > 1) {
              this.currentPage--;
              this.loadData();
            }
            break;
          case 'next-page':
            if (this.currentPage < this.totalPages) {
              this.currentPage++;
              this.loadData();
            }
            break;
        }
      });
    });
  }

  bindFormEvents() {
    const form = this.container.querySelector('#admin-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        const field = this.fields.find(f => f.key === key);
        if (field?.type === 'checkbox') {
          data[key] = formData.has(key);
        } else if (field?.type === 'number') {
          data[key] = value ? parseFloat(value) : null;
        } else {
          data[key] = value || null;
        }
      });

      const error = this.validateForm(data);
      if (error) {
        alert(error);
        return;
      }

      if (this.editingId) {
        await this.handleUpdate(this.editingId, data);
      } else {
        await this.handleCreate(data);
      }
    });

    form.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
      this.closeForm();
    });
  }
}

export function createAdminHomepage(container) { return new AdminHomepageModule(container); }