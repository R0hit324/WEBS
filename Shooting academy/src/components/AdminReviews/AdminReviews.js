import { BaseAdminModule } from '@/lib/admin-module';

export class AdminReviewsModule extends BaseAdminModule {
  constructor(container) {
    super({
      container,
      title: 'Reviews',
      apiEndpoint: 'reviews',
      fields: [
        { key: 'author_name', label: 'Author Name', type: 'text', required: true },
        { key: 'author_role', label: 'Author Role', type: 'text', placeholder: 'Student / Parent' },
        { key: 'rating', label: 'Rating', type: 'number', required: true, placeholder: '5' },
        { key: 'review_text', label: 'Review Text', type: 'textarea', required: true },
        { key: 'review_date', label: 'Review Date', type: 'date' },
        { key: 'photo_url', label: 'Photo URL', type: 'text', placeholder: 'https://...' },
        { key: 'photo_alt', label: 'Photo Alt Text', type: 'text' },
        { key: 'is_visible', label: 'Visible', type: 'checkbox' },
        { key: 'is_featured', label: 'Featured', type: 'checkbox' },
        { key: 'display_order', label: 'Display Order', type: 'number' },
      ],
      searchFields: ['author_name', 'review_text'],
      filters: [
        { key: 'is_visible', label: 'Visibility', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Visible' }, { value: 'false', label: 'Hidden' }] },
        { key: 'is_featured', label: 'Featured', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Featured' }, { value: 'false', label: 'Not Featured' }] },
        { key: 'rating', label: 'Rating', type: 'select', options: [{ value: '', label: 'All' }, { value: '5', label: '5 Stars' }, { value: '4', label: '4 Stars' }, { value: '3', label: '3 Stars' }, { value: '2', label: '2 Stars' }, { value: '1', label: '1 Star' }] },
        { key: 'is_pending', label: 'Moderation Status', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Pending' }, { value: 'false', label: 'Approved' }] },
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
          <p class="admin-module__subtitle">Manage reviews/testimonials</p>
        </div>
        ${this.showForm ? this.getFormHtml() : this.getListHtml()}
      </div>
    `;
  }

  async loadData() {
    // Translate is_pending filter to is_visible filter for API compatibility
    const filters = { ...this.activeFilters };
    if (filters.is_pending !== undefined) {
      // Pending means is_visible = false
      if (filters.is_pending === 'true') {
        filters.is_visible = 'false';
      } else if (filters.is_pending === 'false') {
        filters.is_visible = 'true';
      }
      delete filters.is_pending;
    }

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
        filters: filters,
      });
      this.items = Array.isArray(response.data) ? response.data : [];
      this.totalCount = response.count;
      this.totalPages = response.totalPages;
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      this.isLoading = false;
      this.render();
    }
  }


bindEvents() {
  if (this._reviewsEventsBound) return;
  this._reviewsEventsBound = true;

  this._clickHandler = (e) => {
    const button = e.target.closest('button[data-action]');
    if (!button || !this.container.contains(button)) return;

    const action = button.dataset.action;
    const id = button.dataset.id;

    switch (action) {
      case 'manage': {
        e.preventDefault();

        if (this.activeFilters.is_pending === 'true') {
          delete this.activeFilters.is_pending;
        } else {
          this.activeFilters.is_pending = 'true';
        }

        this.currentPage = 1;
        this.loadData().then(() => this.bindEvents());
        break;
      }

      case 'edit': {
        e.preventDefault();
        const item = this.items.find(item => String(item.id) === String(id));
        if (item) this.showEditForm(item);
        break;
      }

      case 'delete':
        e.preventDefault();
        this.handleDelete(id);
        break;

      case 'cancel':
        e.preventDefault();
        this.closeForm();
        break;

      case 'prev-page':
        e.preventDefault();
        if (this.currentPage > 1) {
          this.currentPage--;
          this.loadData().then(() => this.bindEvents());
        }
        break;

      case 'next-page':
        e.preventDefault();
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
          this.loadData().then(() => this.bindEvents());
        }
        break;
    }
  };

  this._changeHandler = (e) => {
    const el = e.target;
    const action = el.dataset?.action;
    const id = el.dataset?.id;

    if (action === 'toggle-visibility') {
      this.handleToggleVisibility(id, el.checked);
    } else if (action === 'toggle-featured') {
      this.handleToggleFeatured(id, el.checked);
    } else if (action === 'update-order') {
      this.handleReorder([{
        id,
        display_order: parseInt(el.value, 10)
      }]);
    } else if (el.matches('.admin-filter')) {
      const key = el.dataset.filter;
      if (el.value) this.activeFilters[key] = el.value;
      else delete this.activeFilters[key];

      this.currentPage = 1;
      this.loadData().then(() => this.bindEvents());
    }
  };

  this._inputHandler = (e) => {
    if (!e.target.matches('.admin-search')) return;

    this.search = e.target.value;
    this.currentPage = 1;
    this.loadData().then(() => this.bindEvents());
  };

  this.container.addEventListener('click', this._clickHandler);
  this.container.addEventListener('change', this._changeHandler);
  this.container.addEventListener('input', this._inputHandler);
}

destroy() {
  if (this._reviewsEventsBound && this.container) {
    this.container.removeEventListener('click', this._clickHandler);
    this.container.removeEventListener('change', this._changeHandler);
    this.container.removeEventListener('input', this._inputHandler);
  }
  this._reviewsEventsBound = false;
  this._clickHandler = null;
  this._changeHandler = null;
  this._inputHandler = null;
  super.destroy();
}


  // Override: Block admin creation of reviews
  showCreateForm() {
    alert('Reviews must be submitted by visitors through the public form. Use the admin module to moderate existing reviews.');
  }

  getMobileCardBadgeHtml(item) {
    const rating = item.rating || 0;
    const stars = '\u2605'.repeat(rating) + '\u2606'.repeat(5 - rating);
    return `<span class="admin-rating">${stars}</span>`;
  }

  getMobileCardMetaItems(item) {
    const preview = item.review_text
      ? (item.review_text.length > 80 ? item.review_text.substring(0, 80) + '\u2026' : item.review_text)
      : '-';
    return [
      { label: 'Review', value: preview },
      { label: 'Date', value: item.review_date || '-' },
    ];
  }

  // Override: Block admin creation of reviews
  async handleCreate(data) {
    alert('Reviews must be submitted by visitors through the public form. Cannot create reviews from admin panel.');
  }

  getListHtml() {
    if (this.isMobile()) {
      return `<div class="admin-module__toolbar"><input type="search" class="admin-search" placeholder="Search reviews..." value="${this.search}" aria-label="Search" />${this.filters.map(f => `<select class="admin-filter" data-filter="${f.key}"><option value="">${f.label}</option>${f.options.map(opt => `<option value="${opt.value}" ${this.activeFilters[f.key] === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}</select>`).join('')}<button class="btn btn--primary" data-action="manage"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 4H15.5l.001-.001a5.5 5.5 0 1 0-11 0 .001-.001 0 0 0 0 0V5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v6c0 .6-.2 1.1-.5 1.5L19 14v-9zM5 12c0 .6.2 1.1.5 1.5L5 14v-2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2z"/></svg> Manage Reviews</button></div>${this.getMobileCardHtml()}`;
    }
    return `<div class="admin-module__toolbar"><input type="search" class="admin-search" placeholder="Search reviews..." value="${this.search}" aria-label="Search" />${this.filters.map(f => `<select class="admin-filter" data-filter="${f.key}"><option value="">${f.label}</option>${f.options.map(opt => `<option value="${opt.value}" ${this.activeFilters[f.key] === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}</select>`).join('')}<button class="btn btn--primary" data-action="manage"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 4H15.5l.001-.001a5.5 5.5 0 1 0-11 0 .001-.001 0 0 0 0 0V5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v6c0 .6-.2 1.1-.5 1.5L19 14v-9zM5 12c0 .6.2 1.1.5 1.5L5 14v-2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2z"/></svg> Manage Reviews</button></div>${this.getTableHtml()}`;
  }

  getTableHtml() {
    const renderStars = function(r) { return 'â˜…'.repeat(r) + 'â˜†'.repeat(5 - r); };
    if (this.isLoading) {
      return `<div class="admin-module__loading"><div class="admin-spinner"></div></div>`;
    }

    const rows = this.items.length > 0 ? this.items.map(item => `
      <tr data-id="${item.id}" data-order="${item.display_order}">
        <td><strong>${item.author_name}</strong>${item.author_role ? `<br><small>${item.author_role}</small>` : ''}</td>
        <td><span class="admin-rating">${renderStars(item.rating || 0)}</span></td>
        <td>${item.review_text ? item.review_text.substring(0, 60) + '...' : '-'}</td>
        <td><label class="admin-toggle"><input type="checkbox" class="admin-toggle__input" data-action="toggle-visibility" data-id="${item.id}" ${item.is_visible ? 'checked' : ''}><span class="admin-toggle__slider"></span></label></td>
        <td><label class="admin-toggle"><input type="checkbox" class="admin-toggle__input" data-action="toggle-featured" data-id="${item.id}" ${item.is_featured ? 'checked' : ''}><span class="admin-toggle__slider"></span></label></td>
        <td><input type="number" class="admin-order-input" value="${item.display_order}" data-action="update-order" data-id="${item.id}" style="width: 60px;"></td>
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
    `).join('') : `<tr><td colspan="7" class="admin-table__empty">No reviews found</td></tr>`;

    return `<div class="admin-table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th data-sort="author_name">Author</th>
            <th data-sort="rating">Rating</th>
            <th>Preview</th>
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
    </div>${this.totalPages > 1 ? this.getPaginationHtml() : ''}`;
  }

  getFormHtml() {
    const item = this.editingId ? this.items.find(i => i.id === this.editingId) : null;
    const isEdit = !!this.editingId;
    return `<div class="admin-form-container"><div class="admin-form__header"><h3 class="admin-form__title">${isEdit ? 'Edit' : 'Add'} Review</h3><button class="btn btn--secondary" data-action="cancel">Cancel</button></div><form class="admin-form" id="admin-form" novalidate><div class="admin-form__grid">${this.fields.map(field => `<div class="admin-form__field" style="grid-column: span ${field.gridCol || 1};"><label for="${field.key}">${field.label}${field.required ? ' <span class="required-indicator">*</span>' : ''}</label>${field.type === 'checkbox' ? `<label class="admin-checkbox"><input type="checkbox" name="${field.key}" id="${field.key}" ${item?.[field.key] ? 'checked' : ''}><span class="admin-checkbox__checkmark"></span> ${field.label}</label>` : field.type === 'textarea' ? `<textarea name="${field.key}" id="${field.key}" rows="4" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>${item?.[field.key] || ''}</textarea>` : `<input type="${field.type}" name="${field.key}" id="${field.key}" value="${item?.[field.key] || ''}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>`}</div>`).join('')}</div><div class="admin-form__actions"><button type="button" class="btn btn--secondary" data-action="cancel">Cancel</button><button type="submit" class="btn btn--primary">${isEdit ? 'Update' : 'Create'}</button></div></form></div>`;
  }

  getPaginationHtml() {
    return `<div class="admin-pagination"><button class="btn btn--secondary btn--sm" data-action="prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button><span class="admin-pagination__info">Page ${this.currentPage} of ${this.totalPages} (${this.totalCount} total)</span><button class="btn btn--secondary btn--sm" data-action="next-page" ${this.currentPage === this.totalPages ? 'disabled' : ''}>Next</button></div>`;
  }
}

export function createAdminReviews(container) { return new AdminReviewsModule(container); }
