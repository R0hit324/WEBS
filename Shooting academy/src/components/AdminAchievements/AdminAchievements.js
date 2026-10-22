import { BaseAdminModule } from '@/lib/admin-module';
import { uploadImage, deleteImage } from '@/lib/admin-api';
import { STORAGE_BUCKETS } from '@/lib/supabase';

export class AdminAchievementsModule extends BaseAdminModule {
  constructor(container) {
    super({
      container,
      title: 'Achievements',
      apiEndpoint: 'achievements',
      fields: [
        { key: 'athlete_name', label: 'Athlete Name', type: 'text', required: true },
        { key: 'slug', label: 'Slug (URL)', type: 'text', required: true, placeholder: 'aman-choudhary-gold' },
        {
          key: 'medal',
          label: 'Medal',
          type: 'select',
          required: true,
          options: [
            { value: 'gold', label: 'Gold' },
            { value: 'silver', label: 'Silver' },
            { value: 'bronze', label: 'Bronze' },
            { value: 'participation', label: 'Participation' },
          ],
        },
        { key: 'competition', label: 'Competition', type: 'text', placeholder: 'National Championships' },
        { key: 'event', label: 'Event', type: 'text', placeholder: '10m Air Rifle' },
        { key: 'position', label: 'Position', type: 'text', placeholder: '1st' },
        { key: 'year', label: 'Year', type: 'number', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'photo_url', label: 'Athlete Photo', type: 'image' },
        { key: 'photo_alt', label: 'Photo Alt Text', type: 'text' },
        { key: 'is_visible', label: 'Visible', type: 'checkbox' },
        { key: 'is_featured', label: 'Featured', type: 'checkbox' },
        { key: 'display_order', label: 'Display Order', type: 'number' },
      ],
      searchFields: ['athlete_name', 'competition', 'event'],
      filters: [],
      sortable: true,
      reorderable: true,
    });

    this.uploading = false;
  }

  async init() {
    await this.loadData();
    this.render();
    this.bindEvents();
  }

  async loadData() {
    await super.loadData();
    if (!this.showForm) {
      this.bindEvents();
    }
  }


bindEvents() {
  if (this.showForm) {
    this.bindFormEvents();
    return;
  }

  super.bindEvents([
    {
      selector: '[data-action]',
      handler: async (event) => {
        event.preventDefault();

        const button = event.currentTarget;
        const action = button.dataset.action;
        const id = button.dataset.id;

        switch (action) {
          case 'create':
            this.showCreateForm();
            break;

          case 'edit': {
  console.log('Edit clicked, ID:', id);

  const item = this.items.find(
    entry => String(entry.id) === String(id)
  );

  if (!item) {
    console.error('Achievement not found:', id);
    break;
  }

  console.log('Achievement found:', item);
  this.showEditForm(item);
  break;
}

case 'delete': {
  if (!id) {
    console.error('Delete failed: missing achievement ID');
    break;
  }

  try {
    await this.handleDelete(id);
  } catch (error) {
    console.error('Achievement deletion failed:', error);
    alert(error?.message || 'Failed to delete achievement.');
  }

  break;
}

          case 'cancel':
  event.preventDefault();
  this.showForm = false;
  this.editingId = null;
  this.render();
  this.bindEvents();
  break;

          case 'prev-page':
            this.currentPage = Math.max(1, this.currentPage - 1);
            this.loadData();
            break;

          case 'next-page':
            this.currentPage += 1;
            this.loadData();
            break;
        }
      }
    }
  ]);

    this.container.querySelectorAll('.admin-toggle__input').forEach((element) => {
      element.addEventListener('change', async (event) => {
        const input = event.currentTarget;

        if (!input.dataset.id) return;

        if (input.dataset.action === 'toggle-visibility') {
          await this.handleToggleVisibility(input.dataset.id, input.checked);
        } else if (input.dataset.action === 'toggle-featured') {
          await this.handleToggleFeatured(input.dataset.id, input.checked);
        }
      });
    });

    this.container.querySelectorAll('.admin-order-input').forEach((element) => {
      element.addEventListener('change', async (event) => {
        const input = event.currentTarget;
        const id = input.dataset.id;
        const displayOrder = Number(input.value);

        if (id && Number.isFinite(displayOrder)) {
          await this.handleReorder(
            this.items.map((item) => ({
              id: item.id,
              display_order:
                String(item.id) === String(id)
                  ? displayOrder
                  : item.display_order,
            }))
          );
        }
      });
    });
}



  getMobileCardBadgeHtml(item) {
    const medalColors = {
      gold: '#f59e0b',
      silver: '#9ca3af',
      bronze: '#cd7f32',
      participation: '#6b7280',
    };

    return `<span class="admin-medal" style="background:${medalColors[item.medal] || '#6b7280'}">${item.medal || ''}</span>`;
  }

  getMobileCardSubtitle(item) {
    return '';
  }

  getMobileCardMetaItems(item) {
    return [
      { label: 'Competition', value: item.competition || '-' },
      { label: 'Event', value: item.event || '-' },
      { label: 'Year', value: item.year ?? '-' },
    ];
  }

  getFilters() {
    const years = [...new Set(
      this.items.map(item => item.year).filter(Boolean)
    )].sort((a, b) => b - a);

    return [
      {
        key: 'is_visible',
        label: 'Visibility',
        type: 'select',
        options: [
          { value: '', label: 'All' },
          { value: 'true', label: 'Visible' },
          { value: 'false', label: 'Hidden' },
        ],
      },
      {
        key: 'is_featured',
        label: 'Featured',
        type: 'select',
        options: [
          { value: '', label: 'All' },
          { value: 'true', label: 'Featured' },
          { value: 'false', label: 'Not Featured' },
        ],
      },
      {
        key: 'medal',
        label: 'Medal',
        type: 'select',
        options: [
          { value: '', label: 'All' },
          { value: 'gold', label: 'Gold' },
          { value: 'silver', label: 'Silver' },
          { value: 'bronze', label: 'Bronze' },
          { value: 'participation', label: 'Participation' },
        ],
      },
      {
        key: 'year',
        label: 'Year',
        type: 'select',
        options: [
          { value: '', label: 'All' },
          ...years.map(year => ({
            value: String(year),
            label: String(year),
          })),
        ],
      },
    ];
  }

  render() {
    this.filters = this.getFilters();

    this.container.innerHTML = `
      <div class="admin-module">
        <div class="admin-module__header">
          <h2 class="admin-module__title">${this.title}</h2>
          <p class="admin-module__subtitle">Manage achievements and medalists</p>
        </div>
        ${this.showForm ? this.getFormHtml() : this.getListHtml()}
      </div>
    `;
  }

  getListHtml() {
    if (this.isMobile()) {
      return `
      <div class="admin-module__toolbar">
        <input type="search" class="admin-search" placeholder="Search achievements..." value="${this.search || ''}" aria-label="Search achievements" />
        ${this.filters.map(filter => `<select class="admin-filter" data-filter="${filter.key}">${filter.options.map(option => `<option value="${option.value}" ${this.activeFilters?.[filter.key] === option.value ? 'selected' : ''}>${option.label}</option>`).join('')}</select>`).join('')}
        <button class="btn btn--primary" data-action="create">Add Achievement</button>
      </div>${this.getMobileCardHtml()}`;
    }
    const medalColors = {
      gold: '#f59e0b',
      silver: '#9ca3af',
      bronze: '#cd7f32',
      participation: '#6b7280',
    };

    if (this.isLoading) {
      return `
        <div class="admin-module__loading">
          <div class="admin-spinner"></div>
        </div>
      `;
    }

    const rows = this.items.length
      ? this.items.map(item => `
          <tr data-id="${item.id}" data-order="${item.display_order ?? 0}">
            <td><strong>${item.athlete_name || ''}</strong></td>
            <td>
              <span class="admin-medal"
                style="background:${medalColors[item.medal] || '#6b7280'}">
                ${item.medal || ''}
              </span>
            </td>
            <td>${item.competition || '-'}</td>
            <td>${item.event || '-'}</td>
            <td>${item.year ?? '-'}</td>
            <td>
              <label class="admin-toggle">
                <input
                  type="checkbox"
                  class="admin-toggle__input"
                  data-action="toggle-visibility"
                  data-id="${item.id}"
                  ${item.is_visible ? 'checked' : ''}
                >
                <span class="admin-toggle__slider"></span>
              </label>
            </td>
            <td>
              <input
                type="number"
                class="admin-order-input"
                value="${item.display_order ?? 0}"
                data-action="update-order"
                data-id="${item.id}"
                style="width:60px"
              >
            </td>
            <td>
              <div class="admin-actions">
                <button
                  class="admin-action-btn"
                  data-action="edit"
                  data-id="${item.id}"
                  title="Edit"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button
                  class="admin-action-btn admin-action-btn--danger"
                  data-action="delete"
                  data-id="${item.id}"
                  title="Delete"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </td>
          </tr>
        `).join('')
      : `
          <tr>
            <td colspan="8" class="admin-table__empty">
              No achievements found
            </td>
          </tr>
        `;

    return `
      <div class="admin-module__toolbar">
        <input
          type="search"
          class="admin-search"
          placeholder="Search achievements..."
          value="${this.search || ''}"
          aria-label="Search achievements"
        >

        ${this.filters.map(filter => `
          <select class="admin-filter" data-filter="${filter.key}">
            ${filter.options.map(option => `
              <option
                value="${option.value}"
                ${this.activeFilters?.[filter.key] === option.value ? 'selected' : ''}
              >${option.label}</option>
            `).join('')}
          </select>
        `).join('')}

        <button class="btn btn--primary" data-action="create">
          Add Achievement
        </button>
      </div>

      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th data-sort="athlete_name">Athlete</th>
              <th data-sort="medal">Medal</th>
              <th data-sort="competition">Competition</th>
              <th data-sort="event">Event</th>
              <th data-sort="year">Year</th>
              <th data-sort="is_visible">Visible</th>
              <th data-sort="display_order">Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody class="admin-table__body">
            ${rows}
          </tbody>
        </table>
      </div>

      ${this.totalPages > 1 ? this.getPaginationHtml() : ''}
    `;
  }

  getFormHtml() {
    const item = this.editingId
      ? this.items.find(entry => entry.id === this.editingId)
      : null;

    const isEdit = Boolean(this.editingId);

    return `
      <div class="admin-form-container">
        <div class="admin-form__header">
          <h3 class="admin-form__title">
            ${isEdit ? 'Edit' : 'Add'} Achievement
          </h3>
          <button type="button" class="btn btn--secondary" data-action="cancel">
            Cancel
          </button>
        </div>

        <form class="admin-form" id="admin-form" novalidate>
          <div class="admin-form__grid">
            ${this.fields.map(field => `
              <div class="admin-form__field"
                   style="grid-column:span ${field.gridCol || 1}">
                <label for="${field.key}">
                  ${field.label}
                  ${field.required ? '<span class="required-indicator">*</span>' : ''}
                </label>

                ${
                  field.type === 'select'
                    ? `
                      <select
                        name="${field.key}"
                        id="${field.key}"
                        ${field.required ? 'required' : ''}
                      >
                        <option value="">Select</option>
                        ${(field.options || []).map(option => `
                          <option
                            value="${option.value}"
                            ${item?.[field.key] === option.value ? 'selected' : ''}
                          >${option.label}</option>
                        `).join('')}
                      </select>
                    `
                    : field.type === 'image'
                      ? `
                        <div class="admin-image-upload">
                          <input
                            type="file"
                            name="image_file"
                            id="image_file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            style="display:none"
                          >

                          <button
                            type="button"
                            class="btn btn--secondary"
                            data-action="pick-image"
                          >${item?.photo_url ? 'Change Photo' : 'Select Photo'}</button>

                          ${item?.photo_url ? `
                            <img
                              src="${item.photo_url}"
                              alt="${item.photo_alt || 'Athlete photo preview'}"
                              class="admin-image-upload__preview"
                              style="display:block;max-width:200px;max-height:150px;object-fit:cover;margin-top:12px"
                            >
                          ` : ''}

                          <p class="admin-image-upload__filename"></p>
                          <small>Supported: JPEG, PNG, WebP, GIF. Maximum 5 MB.</small>

                          <input
                            type="hidden"
                            name="photo_url"
                            value="${item?.photo_url || ''}"
                          >
                        </div>
                      `
                      : field.type === 'checkbox'
                        ? `
                          <label class="admin-checkbox">
                            <input
                              type="checkbox"
                              name="${field.key}"
                              id="${field.key}"
                              ${item?.[field.key] ? 'checked' : ''}
                            >
                            <span class="admin-checkbox__checkmark"></span>
                            ${field.label}
                          </label>
                        `
                        : field.type === 'textarea'
                          ? `
                            <textarea
                              name="${field.key}"
                              id="${field.key}"
                              rows="3"
                              placeholder="${field.placeholder || ''}"
                              ${field.required ? 'required' : ''}
                            >${item?.[field.key] || ''}</textarea>
                          `
                          : `
                            <input
                              type="${field.type}"
                              name="${field.key}"
                              id="${field.key}"
                              value="${item?.[field.key] ?? ''}"
                              placeholder="${field.placeholder || ''}"
                              ${field.required ? 'required' : ''}
                            >
                          `
                }
              </div>
            `).join('')}
          </div>

          <div class="admin-form__actions">
            <button type="button" class="btn btn--secondary" data-action="cancel">
              Cancel
            </button>
            <button type="submit" class="btn btn--primary" ${this.uploading ? 'disabled' : ''}>
              ${this.uploading ? 'Uploading...' : (isEdit ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  bindFormEvents() {
  super.bindFormEvents();

  // Handle Cancel buttons while the form is open.
  this.container
    .querySelectorAll('[data-action="cancel"]')
    .forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();

        this.showForm = false;
        this.editingId = null;

        this.render();
        this.bindEvents();
      });
    });

  const form = this.container.querySelector('#admin-form');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = this.getFormData();
  const fileInput = form.querySelector('input[name="image_file"]');
  data.image_file = fileInput?.files?.[0] || null;

  const error = this.validateForm(data);

  if (error) {
    alert(error);
    return;
  }

  try {
    if (this.editingId) {
      await this.handleUpdate(this.editingId, data);
    } else {
      await this.handleCreate(data);
    }
  } catch (err) {
    console.error('Achievement save failed:', err);
    alert(err?.message || 'Failed to save achievement.');
  }
});
    const fileInput = this.container.querySelector('input[name="image_file"]');
    const pickButton = this.container.querySelector('[data-action="pick-image"]');

    pickButton?.addEventListener('click', () => fileInput?.click());

    fileInput?.addEventListener('change', event => {
      const file = event.target.files?.[0];
      if (!file) return;

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('Choose a JPEG, PNG, WebP, or GIF image.');
        fileInput.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be 5 MB or smaller.');
        fileInput.value = '';
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        let preview = this.container.querySelector(
          '.admin-image-upload__preview'
        );

        if (!preview) {
          preview = document.createElement('img');
          preview.className = 'admin-image-upload__preview';
          preview.alt = 'Athlete photo preview';
          preview.style.cssText =
            'display:block;max-width:200px;max-height:150px;object-fit:cover;margin-top:12px';

          this.container
            .querySelector('.admin-image-upload')
            ?.appendChild(preview);
        }

        preview.src = reader.result;

        const filename = this.container.querySelector(
          '.admin-image-upload__filename'
        );

        if (filename) filename.textContent = file.name;
      };

      reader.readAsDataURL(file);
    });
  }

  async uploadAchievementPhoto(file) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExtension = /^[a-z0-9]+$/.test(extension) ? extension : 'jpg';
    const path = `achievements/${Date.now()}-${Math.random()
      .toString(36).slice(2)}.${safeExtension}`;

    const photoUrl = await uploadImage(
      STORAGE_BUCKETS.ACHIEVEMENTS,
      file,
      path
    );

    return photoUrl;
  }

  async handleCreate(data) {
    const file = data.image_file;

    delete data.image_file;

    if (file instanceof File && file.size > 0) {
      this.uploading = true;

      try {
        data.photo_url = await this.uploadAchievementPhoto(file);
      } catch (error) {
        console.error('Achievement photo upload failed:', error);
        alert('Photo upload failed. Check the Supabase bucket and permissions.');
        throw error;
      } finally {
        this.uploading = false;
      }
    }

    await super.handleCreate(data);
  }

  async handleUpdate(id, data) {
    const file = data.image_file;

    delete data.image_file;

    if (file instanceof File && file.size > 0) {
      this.uploading = true;

      try {
        data.photo_url = await this.uploadAchievementPhoto(file);
      } catch (error) {
        console.error('Achievement photo update failed:', error);
        alert('Photo upload failed. Check the Supabase bucket and permissions.');
        throw error;
      } finally {
        this.uploading = false;
      }
    }

    await super.handleUpdate(id, data);
  }

  async handleDelete(id) {
    const item = this.items.find(
  entry => String(entry.id) === String(id)
);

    if (!confirm('Are you sure you want to delete this achievement?')) {
      return;
    }

    await super.handleDelete(id);

    // The database schema does not store the Storage path separately.
    // Do not guess the path from the public URL and risk deleting the wrong file.
    if (item?.photo_url) {
      console.info('Achievement deleted. Its Storage file may need manual cleanup.');
    }
  }

  getPaginationHtml() {
    return `
      <div class="admin-pagination">
        <button
          class="btn btn--secondary btn--sm"
          data-action="prev-page"
          ${this.currentPage === 1 ? 'disabled' : ''}
        >Previous</button>

        <span class="admin-pagination__info">
          Page ${this.currentPage} of ${this.totalPages}
          (${this.totalCount} total)
        </span>

        <button
          class="btn btn--secondary btn--sm"
          data-action="next-page"
          ${this.currentPage === this.totalPages ? 'disabled' : ''}
        >Next</button>
      </div>
    `;
  }
}

export function createAdminAchievements(container) {
  return new AdminAchievementsModule(container);
}
