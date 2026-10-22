import { BaseAdminModule } from '@/lib/admin-module';
import { uploadImage, deleteImage } from '@/lib/admin-api';
import { STORAGE_BUCKETS } from '@/lib/supabase';

export class AdminFacilitiesModule extends BaseAdminModule {
  constructor(container) {
    super({
      container,
      title: 'Facilities',
      apiEndpoint: 'facilities',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'slug', label: 'Slug (URL)', type: 'text', required: true, placeholder: 'indoor-range' },
        { key: 'category', label: 'Category', type: 'select', options: [
          { value: 'indoor', label: 'Indoor' },
          { value: 'outdoor', label: 'Outdoor' },
          { value: 'equipment', label: 'Equipment' },
          { value: 'amenity', label: 'Amenity' },
          { value: 'other', label: 'Other' },
        ]},
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'short_description', label: 'Short Description', type: 'textarea' },
        { key: 'image_url', label: 'Image URL', type: 'text', placeholder: 'https://...' },
        { key: 'image_alt', label: 'Image Alt Text', type: 'text' },
        { key: 'capacity', label: 'Capacity', type: 'number' },
        { key: 'is_visible', label: 'Visible', type: 'checkbox' },
        { key: 'is_featured', label: 'Featured', type: 'checkbox' },
        { key: 'display_order', label: 'Display Order', type: 'number' },
      ],
      searchFields: ['name', 'category'],
      filters: [
        { key: 'is_visible', label: 'Visibility', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Visible' }, { value: 'false', label: 'Hidden' }] },
        { key: 'is_featured', label: 'Featured', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Featured' }, { value: 'false', label: 'Not Featured' }] },
        { key: 'category', label: 'Category', type: 'select', options: [{ value: '', label: 'All' }, { value: 'indoor', label: 'Indoor' }, { value: 'outdoor', label: 'Outdoor' }, { value: 'equipment', label: 'Equipment' }, { value: 'amenity', label: 'Amenity' }, { value: 'other', label: 'Other' }] },
      ],
      sortable: true,
      reorderable: true,
    });
  }

  async init() { await this.loadData(); this.render(); this.bindEvents(); }

  bindEvents() {
    if (this.showForm) {
      this.bindFormEvents();
      return;
    }

    // Visibility filter
    this.bindEvents([
      { selector: '.admin-filter[data-filter="is_visible"]', handler: (e) => {
        const key = e.currentTarget.dataset.filter;
        const value = e.currentTarget.value;
        if (value) this.activeFilters[key] = value;
        else delete this.activeFilters[key];
        this.currentPage = 1;
        this.loadData();
      }},
      { selector: '.admin-filter[data-filter="is_featured"]', handler: (e) => {
        const key = e.currentTarget.dataset.filter;
        const value = e.currentTarget.value;
        if (value) this.activeFilters[key] = value;
        else delete this.activeFilters[key];
        this.currentPage = 1;
        this.loadData();
      }},
      { selector: '.admin-filter[data-filter="category"]', handler: (e) => {
        const key = e.currentTarget.dataset.filter;
        const value = e.currentTarget.value;
        if (value) this.activeFilters[key] = value;
        else delete this.activeFilters[key];
        this.currentPage = 1;
        this.loadData();
      }},
    ]);

    // Action buttons (edit, delete) on table rows + toggle-visibility + toggle-featured + update-order
    this.bindEvents([
      { selector: '[data-action]', handler: (e) => {
        const action = e.currentTarget.dataset.action;
        const id = e.currentTarget.dataset.id;

        switch (action) {
          case 'edit':
            this.showEditForm(this.items.find(i => i.id === id));
            break;
          case 'delete':
            this.handleDelete(id);
            break;
          case 'toggle-visibility':
            this.handleToggleVisibility(id, e.currentTarget.checked);
            break;
          case 'toggle-featured':
            this.handleToggleFeatured(id, e.currentTarget.checked);
            break;
          case 'update-order':
            this.handleReorder([{ id: id, display_order: parseInt(e.currentTarget.value) }]);
            break;
        }
      }},
    ]);
  }

  render() {
    this.container.innerHTML = `<div class="admin-module"><div class="admin-module__header"><h2 class="admin-module__title">${this.title}</h2><p class="admin-module__subtitle">Manage facilities</p></div>${this.showForm ? this.getFormHtml() : this.getListHtml()}</div>`;
  }

  getListHtml() {
    return `<div class="admin-module__toolbar"><input type="search" class="admin-search" placeholder="Search facilities..." value="${this.search}" aria-label="Search" />
        <select class="admin-filter" data-filter="is_visible"><option value="">Visibility</option><option value="true" ${this.activeFilters.is_visible === 'true' ? 'selected' : ''}>Visible</option><option value="false" ${this.activeFilters.is_visible === 'false' ? 'selected' : ''}>Hidden</option></select>
        <select class="admin-filter" data-filter="category"><option value="">Category</option><option value="indoor" ${this.activeFilters.category === 'indoor' ? 'selected' : ''}>Indoor</option><option value="outdoor" ${this.activeFilters.category === 'outdoor' ? 'selected' : ''}>Outdoor</option><option value="equipment" ${this.activeFilters.category === 'equipment' ? 'selected' : ''}>Equipment</option><option value="amenity" ${this.activeFilters.category === 'amenity' ? 'selected' : ''}>Amenity</option></select>
        <button class="btn btn--primary" data-action="create"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Facility</button>
      </div>${this.getTableHtml()}`;
  }

  getTableHtml() {
    return `${this.isLoading ? `<div class="admin-module__loading"><div class="admin-spinner"></div></div>` : `
      <div class="admin-table-container"><table class="admin-table"><thead><tr><th data-sort="name">Name</th><th data-sort="category">Category</th><th data-sort="is_visible">Visible</th><th data-sort="is_featured">Featured</th><th data-sort="display_order">Order</th><th>Actions</th></tr></thead>
      <tbody class="admin-table__body ${this.reorderable ? 'admin-table__body--reorderable' : ''}">${this.items.length > 0 ? this.items.map(item => `
        <tr data-id="${item.id}" data-order="${item.display_order}"><td><strong>${item.name}</strong></td><td>${item.category || '-'}</td><td><label class="admin-toggle"><input type="checkbox" class="admin-toggle__input" data-action="toggle-visibility" data-id="${item.id}" ${item.is_visible ? 'checked' : ''}><span class="admin-toggle__slider"></span></label></td><td><label class="admin-toggle"><input type="checkbox" class="admin-toggle__input" data-action="toggle-featured" data-id="${item.id}" ${item.is_featured ? 'checked' : ''}><span class="admin-toggle__slider"></span></label></td><td><input type="number" class="admin-order-input" value="${item.display_order}" data-action="update-order" data-id="${item.id}" style="width: 60px;"></td><td><div class="admin-actions"><button class="admin-action-btn" data-action="edit" data-id="${item.id}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="admin-action-btn admin-action-btn--danger" data-action="delete" data-id="${item.id}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></div></td></tr>
      `).join('') : `<tr><td colspan="6" class="admin-table__empty">No facilities found</td></tr>`}</tbody></table></div>${this.totalPages > 1 ? this.getPaginationHtml() : ''}`}`;
  }

  getFormHtml() { const item = this.editingId ? this.items.find(i => i.id === this.editingId) : null; const isEdit = !!this.editingId; return `<div class="admin-form-container"><div class="admin-form__header"><h3 class="admin-form__title">${isEdit ? 'Edit' : 'Add'} Facility</h3><button class="btn btn--secondary" data-action="cancel">Cancel</button></div><form class="admin-form" novalidate><div class="admin-form__grid">${this.fields.map(field => `<div class="admin-form__field"><label for="${field.key}">${field.label}${field.required ? ' <span class="required-indicator">*</span>' : ''}</label>${field.type === 'select' ? `<select name="${field.key}" id="${field.key}" ${field.required ? 'required' : ''}<option value="">Select</option>${field.options.map(opt => `<option value="${opt.value}" ${item?.[field.key] === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}</select>` : field.type === 'checkbox' ? `<label class="admin-checkbox"><input type="checkbox" name="${field.key}" id="${field.key}" ${item?.[field.key] ? 'checked' : ''}><span class="admin-checkbox__checkmark"></span> ${field.label}</label>` : field.type === 'textarea' ? `<textarea name="${field.key}" id="${field.key}" rows="3" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>${item?.[field.key] || ''}</textarea>` : `<input type="${field.type}" name="${field.key}" id="${field.key}" value="${item?.[field.key] || ''}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>`}</div>`).join('')}</div><div class="admin-form__actions"><button type="button" class="btn btn--secondary" data-action="cancel">Cancel</button><button type="submit" class="btn btn--primary">${isEdit ? 'Update' : 'Create'}</button></div></form></div>`; }

  getPaginationHtml() { return `<div class="admin-pagination"><button class="btn btn--secondary btn--sm" data-action="prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button><span class="admin-pagination__info">Page ${this.currentPage} of ${this.totalPages} (${this.totalCount} total)</span><button class="btn btn--secondary btn--sm" data-action="next-page" ${this.currentPage === this.totalPages ? 'disabled' : ''}>Next</button></div>`; }

  bindFormEvents() {
    super.bindFormEvents();

    const fileInput = this.container.querySelector('#image_file');
    const pickButton = this.container.querySelector('[data-action="pick-image"]');
    const preview = this.container.querySelector('#facility-image-preview');
    const filename = this.container.querySelector('#facility-image-name');

    pickButton?.addEventListener('click', () => fileInput?.click());

    fileInput?.addEventListener('change', event => {
      const file = event.target.files?.[0];
      if (!file) return;

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('Choose a JPG, PNG, WebP, or GIF image.');
        event.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be 5 MB or less.');
        event.target.value = '';
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        if (preview) {
          preview.src = reader.result;
          preview.style.display = 'block';
        }
        if (filename) filename.textContent = file.name;
      };

      reader.readAsDataURL(file);
    });
  }

  async uploadFacilityImage(file) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExtension = /^[a-z0-9]+$/.test(extension) ? extension : 'jpg';

    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExtension}`;

    return await uploadImage(STORAGE_BUCKETS.FACILITIES, file, path);
  }

  async handleCreate(data) {
    const file = data.image_file;
    delete data.image_file;

    if (file instanceof File && file.size > 0) {
      try {
        data.image_url = await this.uploadFacilityImage(file);
      } catch (error) {
        console.error('Facility image upload failed:', error);
        alert('Image upload failed. Check the Supabase facilities bucket and permissions.');
        throw error;
      }
    }

    await super.handleCreate(data);
  }

  async handleUpdate(id, data) {
    const file = data.image_file;
    delete data.image_file;

    if (file instanceof File && file.size > 0) {
      try {
        data.image_url = await this.uploadFacilityImage(file);
      } catch (error) {
        console.error('Facility image update failed:', error);
        alert('Image upload failed. Check the Supabase facilities bucket and permissions.');
        throw error;
      }
    }

    await super.handleUpdate(id, data);
  }


  getPaginationHtml() { return `<div class="admin-pagination"><button class="btn btn--secondary btn--sm" data-action="prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button><span class="admin-pagination__info">Page ${this.currentPage} of ${this.totalPages} (${this.totalCount} total)</span><button class="btn btn--secondary btn--sm" data-action="next-page" ${this.currentPage === this.totalPages ? 'disabled' : ''}>Next</button></div>`; }
}

export function createAdminFacilities(container) { return new AdminFacilitiesModule(container); }
