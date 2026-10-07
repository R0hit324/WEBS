import { BaseAdminModule } from '@/lib/admin-module';
import { uploadImage, deleteImage, STORAGE_BUCKETS } from '@/lib/admin-api';

export class AdminGalleryModule extends BaseAdminModule {
  private uploading = false;
  private uploadProgress = 0;

  constructor(container) {
    super({
      container,
      title: 'Gallery',
      apiEndpoint: 'gallery_images',
      fields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'caption', label: 'Caption', type: 'textarea' },
        { key: 'category', label: 'Category', type: 'select', required: true, options: [
          { value: 'academy', label: 'Academy' },
          { value: 'training', label: 'Training' },
          { value: 'competitions', label: 'Competitions' },
          { value: 'events', label: 'Events' },
          { value: 'facilities', label: 'Facilities' },
          { value: 'achievements', label: 'Achievements' },
        ]},
        { key: 'image_file', label: 'Image', type: 'image', required: true },
        { key: 'alt_text', label: 'Alt Text', type: 'text' },
        { key: 'is_visible', label: 'Visible', type: 'checkbox' },
        { key: 'is_featured', label: 'Featured', type: 'checkbox' },
        { key: 'display_order', label: 'Display Order', type: 'number' },
      ],
      searchFields: ['title', 'caption'],
      filters: [
        { key: 'is_visible', label: 'Visibility', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Visible' }, { value: 'false', label: 'Hidden' }] },
        { key: 'is_featured', label: 'Featured', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Featured' }, { value: 'false', label: 'Not Featured' }] },
        { key: 'category', label: 'Category', type: 'select', options: [{ value: '', label: 'All' }, { value: 'academy', label: 'Academy' }, { value: 'training', label: 'Training' }, { value: 'competitions', label: 'Competitions' }, { value: 'events', label: 'Events' }, { value: 'facilities', label: 'Facilities' }, { value: 'achievements', label: 'Achievements' }] },
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
    this.container.innerHTML = `<div class="admin-module"><div class="admin-module__header"><h2 class="admin-module__title">${this.title}</h2><p class="admin-module__subtitle">Manage gallery images</p></div>${this.showForm ? this.getFormHtml() : this.getListHtml()}</div>`;
  }

  getListHtml() {
    return `
      <div class="admin-module__toolbar">
        <input type="search" class="admin-search" placeholder="Search images..." value="${this.search}" aria-label="Search" />
        <select class="admin-filter" data-filter="is_visible"><option value="">Visibility</option><option value="true" ${this.activeFilters.is_visible === 'true' ? 'selected' : ''}>Visible</option><option value="false" ${this.activeFilters.is_visible === 'false' ? 'selected' : ''}>Hidden</option></select>
        <select class="admin-filter" data-filter="category"><option value="">Category</option><option value="academy" ${this.activeFilters.category === 'academy' ? 'selected' : ''}>Academy</option><option value="training" ${this.activeFilters.category === 'training' ? 'selected' : ''}>Training</option><option value="competitions" ${this.activeFilters.category === 'competitions' ? 'selected' : ''}>Competitions</option><option value="events" ${this.activeFilters.category === 'events' ? 'selected' : ''}>Events</option><option value="facilities" ${this.activeFilters.category === 'facilities' ? 'selected' : ''}>Facilities</option><option value="achievements" ${this.activeFilters.category === 'achievements' ? 'selected' : ''}>Achievements</option></select>
        <button class="btn btn--primary" data-action="create"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Upload Image</button>
      </div>${this.getTableHtml()}`;
  }

  getTableHtml() {
    return `${this.isLoading ? `<div class="admin-module__loading"><div class="admin-spinner"></div></div>` : `
      <div class="admin-table-container"><table class="admin-table"><thead><tr><th>Image</th><th data-sort="title">Title</th><th data-sort="category">Category</th><th data-sort="is_visible">Visible</th><th data-sort="is_featured">Featured</th><th data-sort="display_order">Order</th><th>Actions</th></tr></thead>
      <tbody class="admin-table__body ${this.reorderable ? 'admin-table__body--reorderable' : ''}">${this.items.length > 0 ? this.items.map(item => `
        <tr data-id="${item.id}" data-order="${item.display_order}"><td><img src="${item.image_url || ''}" alt="" style="width: 60px; height: 40px; object-fit: cover; border-radius: var(--radius-sm);"></td><td>${item.title || '-'}</td><td>${item.category}</td><td><label class="admin-toggle"><input type="checkbox" class="admin-toggle__input" data-action="toggle-visibility" data-id="${item.id}" ${item.is_visible ? 'checked' : ''}><span class="admin-toggle__slider"></span></label></td><td><label class="admin-toggle"><input type="checkbox" class="admin-toggle__input" data-action="toggle-featured" data-id="${item.id}" ${item.is_featured ? 'checked' : ''}><span class="admin-toggle__slider"></span></label></td><td><input type="number" class="admin-order-input" value="${item.display_order}" data-action="update-order" data-id="${item.id}" style="width: 60px;"></td><td><div class="admin-actions"><button class="admin-action-btn" data-action="edit" data-id="${item.id}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="admin-action-btn admin-action-btn--danger" data-action="delete" data-id="${item.id}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></div></td></tr>
      `).join('') : `<tr><td colspan="7" class="admin-table__empty">No images found</td></tr>`}</tbody></table></div>${this.totalPages > 1 ? this.getPaginationHtml() : ''}`;
  }

  getFormHtml() {
    const item = this.editingId ? this.items.find(i => i.id === this.editingId) : null;
    const isEdit = !!this.editingId;
    return `<div class="admin-form-container"><div class="admin-form__header"><h3 class="admin-form__title">${isEdit ? 'Edit' : 'Upload'} Image</h3><button class="btn btn--secondary" data-action="cancel">Cancel</button></div><form class="admin-form" id="admin-form" novalidate enctype="multipart/form-data"><div class="admin-form__grid">${this.fields.map(field => `
      <div class="admin-form__field" style="grid-column: span ${field.gridCol || 1};">
        <label for="${field.key}">${field.label}${field.required ? ' <span class="required-indicator">*</span>' : ''}</label>
        ${field.type === 'select' ? `<select name="${field.key}" id="${field.key}" ${field.required ? 'required' : ''}><option value="">Select category</option><option value="academy" ${item?.category === 'academy' ? 'selected' : ''}>Academy</option><option value="training" ${item?.category === 'training' ? 'selected' : ''}>Training</option><option value="competitions" ${item?.category === 'competitions' ? 'selected' : ''}>Competitions</option><option value="events" ${item?.category === 'events' ? 'selected' : ''}>Events</option><option value="facilities" ${item?.category === 'facilities' ? 'selected' : ''}>Facilities</option><option value="achievements" ${item?.category === 'achievements' ? 'selected' : ''}>Achievements</option></select>` :
        field.type === 'image' ? `<div class="admin-image-upload"><input type="file" name="${field.key}" id="${field.key}" accept="image/*" ${!isEdit && field.required ? 'required' : ''} style="display: none;"><button type="button" class="btn btn--secondary admin-image-upload__btn" data-action="pick-image">${item?.image_url ? 'Change Image' : 'Select Image'}</button>${item?.image_url ? `<img src="${item.image_url}" alt="Preview" class="admin-image-upload__preview">` : ''}<input type="hidden" name="image_url" value="${item?.image_url || ''}"><input type="hidden" name="storage_path" value="${item?.storage_path || ''}"></div>` :
        field.type === 'checkbox' ? `<label class="admin-checkbox"><input type="checkbox" name="${field.key}" id="${field.key}" ${item?.[field.key] ? 'checked' : ''}><span class="admin-checkbox__checkmark"></span> ${field.label}</label>` :
        field.type === 'textarea' ? `<textarea name="${field.key}" id="${field.key}" rows="3" placeholder="${field.placeholder || ''}">${item?.[field.key] || ''}</textarea>` :
        `<input type="${field.type}" name="${field.key}" id="${field.key}" value="${item?.[field.key] || ''}" placeholder="${field.placeholder || ''}" ${field.required && !isEdit ? 'required' : ''}>`}
      </div>`).join('')}</div><div class="admin-form__actions"><button type="button" class="btn btn--secondary" data-action="cancel">Cancel</button><button type="submit" class="btn btn--primary" ${this.uploading ? 'disabled' : ''}>${this.uploading ? `Uploading ${this.uploadProgress}%...` : (this.editingId ? 'Update' : 'Upload')}</button></div></form></div>`;
  }

  getPaginationHtml() { return `<div class="admin-pagination"><button class="btn btn--secondary btn--sm" data-action="prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button><span class="admin-pagination__info">Page ${this.currentPage} of ${this.totalPages} (${this.totalCount} total)</span><button class="btn btn--secondary btn--sm" data-action="next-page" ${this.currentPage === this.totalPages ? 'disabled' : ''}>Next</button></div>`; }

  async handleCreate(data: any) {
    if (data.image_file) {
      this.uploading = true;
      this.uploadProgress = 0;
      this.render();
      this.bindEvents();

      try {
        const timestamp = Date.now();
        const ext = data.image_file.name.split('.').pop();
        const path = `gallery/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

        await uploadImage(STORAGE_BUCKETS.GALLERY, data.image_file, path);

        data.image_url = `${(await import('@/lib/supabase')).getSupabaseConfig().url}/storage/v1/object/public/${STORAGE_BUCKETS.GALLERY}/${path}`;
        data.storage_path = path;
      } catch (err) {
        this.uploading = false;
        this.render();
        this.bindEvents();
        throw err;
      }
    }

    delete data.image_file;
    await super.handleCreate(data);
    this.uploading = false;
  }

  async handleUpdate(id: string, data: any) {
    if (data.image_file) {
      this.uploading = true;
      this.uploadProgress = 0;
      this.render();
      this.bindEvents();

      try {
        const timestamp = Date.now();
        const ext = data.image_file.name.split('.').pop();
        const path = `gallery/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

        await uploadImage(STORAGE_BUCKETS.GALLERY, data.image_file, path);

        data.image_url = `${(await import('@/lib/supabase')).getSupabaseConfig().url}/storage/v1/object/public/${STORAGE_BUCKETS.GALLERY}/${path}`;
        data.storage_path = path;
      } catch (err) {
        this.uploading = false;
        this.render();
        this.bindEvents();
        throw err;
      }
    }

    delete data.image_file;
    await super.handleUpdate(id, data);
    this.uploading = false;
  }

  async handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this image?')) return;
    const item = this.items.find(i => i.id === id);
    if (item?.storage_path) {
      try { await deleteImage(STORAGE_BUCKETS.GALLERY, item.storage_path); } catch {}
    }
    await super.handleDelete(id);
  }

  bindFormEvents() {
    super.bindFormEvents();

    this.container.querySelector('[data-action="pick-image"]')?.addEventListener('click', () => {
      this.container.querySelector('input[type="file"]')?.click();
    });

    this.container.querySelector('input[type="file"]')?.addEventListener('change', (e) => {
      const file = (e.target).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const preview = this.container.querySelector('.admin-image-upload__preview');
          if (preview) preview.setAttribute('src', reader.result as string);
          else {
            const img = document.createElement('img');
            img.src = reader.result as string;
            img.className = 'admin-image-upload__preview';
            img.style.cssText = 'max-width: 200px; max-height: 150px; object-fit: cover; border-radius: var(--radius-sm); margin-top: var(--spacing-2);';
            this.container.querySelector('.admin-image-upload')?.appendChild(img);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  getPaginationHtml() { return `<div class="admin-pagination"><button class="btn btn--secondary btn--sm" data-action="prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button><span class="admin-pagination__info">Page ${this.currentPage} of ${this.totalPages} (${this.totalCount} total)</span><button class="btn btn--secondary btn--sm" data-action="next-page" ${this.currentPage === this.totalPages ? 'disabled' : ''}>Next</button></div>`; }
}

export function createAdminGallery(container: HTMLElement) { return new AdminGalleryModule(container); }