import { BaseAdminModule } from '@/lib/admin-module';

export class AdminPayPlayModule extends BaseAdminModule {
  constructor(container) {
    super({
      container,
      title: 'Pay & Play',
      apiEndpoint: 'pay_play_options',
      fields: [
        { key: 'name', label: 'Session Name', type: 'text', required: true },
        { key: 'slug', label: 'Slug (URL)', type: 'text', required: true, placeholder: '10m-air-rifle' },
        { key: 'heading', label: 'Page Heading', type: 'text', placeholder: 'Custom page heading' },
        { key: 'subheading', label: 'Subheading', type: 'text', placeholder: 'Custom page subheading' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'instructions', label: 'Instructions', type: 'textarea', placeholder: 'General instructions for participants' },
        { key: 'rules', label: 'Rules', type: 'textarea', placeholder: 'Rules and regulations' },
        { key: 'notices', label: 'Notices', type: 'textarea', placeholder: 'Important notices for participants' },
        { key: 'price_amount', label: 'Price (â‚¹)', type: 'number', required: true },
        { key: 'price_currency', label: 'Currency', type: 'text', readonly: true, placeholder: 'INR' },
        { key: 'duration_minutes', label: 'Duration (minutes)', type: 'number' },
        { key: 'start_time', label: 'Start Time', type: 'time' },
        { key: 'end_time', label: 'End Time', type: 'time' },
        { key: 'availability_status', label: 'Availability', type: 'select', required: true, options: [
          { value: 'available', label: 'Available' },
          { value: 'unavailable', label: 'Unavailable' },
          { value: 'temporarily_closed', label: 'Temporarily Closed' },
        ]},
        { key: 'includes', label: 'Includes (comma separated)', type: 'textarea' },
        { key: 'is_visible', label: 'Visible on Website', type: 'checkbox' },
        { key: 'display_order', label: 'Display Order', type: 'number' },
      ],
      searchFields: ['name'],
      filters: [
        { key: 'is_visible', label: 'Visibility', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Visible' }, { value: 'false', label: 'Hidden' }] },
        { key: 'availability_status', label: 'Availability', type: 'select', options: [{ value: '', label: 'All' }, { value: 'available', label: 'Available' }, { value: 'unavailable', label: 'Unavailable' }, { value: 'temporarily_closed', label: 'Temporarily Closed' }] },
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
    this.container.innerHTML = `<div class="admin-module"><div class="admin-module__header"><h2 class="admin-module__title">${this.title}</h2><p class="admin-module__subtitle">Manage Pay & Play sessions</p></div>${this.showForm ? this.getFormHtml() : this.getListHtml()}</div>`;
  }

  getListHtml() {
    const toolbar = `<div class="admin-module__toolbar"><input type="search" class="admin-search" placeholder="Search sessions..." value="${this.search}" aria-label="Search" /><button class="btn btn--primary" data-action="create"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Session</button></div>`;
    if (this.isMobile()) {
      return `${toolbar}${this.getMobileCardHtml()}`;
    }
    return `${toolbar}${this.getTableHtml()}`;
  }

  getTableHtml() {
    if (this.isLoading) {
      return `<div class="admin-module__loading"><div class="admin-spinner"></div></div>`;
    }

    const rows = this.items.length > 0 ? this.items.map(item => {
      const availabilityLabels = {
        available: 'Available',
        unavailable: 'Unavailable',
        temporarily_closed: 'Temporarily Closed'
      };
      const availabilityColors = {
        available: 'admin-badge--success',
        unavailable: 'admin-badge--danger',
        temporarily_closed: 'admin-badge--warning'
      };
      const availabilityLabel = availabilityLabels[item.availability_status] || item.availability_status;
      const availabilityColor = availabilityColors[item.availability_status] || 'admin-badge--secondary';

      return `
        <tr data-id="${item.id}" data-order="${item.display_order}">
          <td><strong>${item.name}</strong></td>
          <td>â‚¹${item.price_amount}</td>
          <td>${item.duration_minutes || '-'} min</td>
          <td>${item.start_time ? `${item.start_time} - ${item.end_time || ''}` : '-'}</td>
          <td><span class="admin-badge ${availabilityColor}">${availabilityLabel}</span></td>
          <td>
            <label class="admin-toggle">
              <input type="checkbox" class="admin-toggle__input" data-action="toggle-visibility" data-id="${item.id}" ${item.is_visible ? 'checked' : ''}>
              <span class="admin-toggle__slider"></span>
            </label>
          </td>
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
      `;
    }).join('') : `<tr><td colspan="8" class="admin-table__empty">No sessions found</td></tr>`;

    return `<div class="admin-table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th data-sort="name">Session</th>
            <th data-sort="price_amount">Price</th>
            <th data-sort="duration_minutes">Duration</th>
            <th data-sort="start_time">Time Slot</th>
            <th data-sort="availability_status">Availability</th>
            <th data-sort="is_visible">Visible</th>
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
    return `<div class="admin-form-container"><div class="admin-form__header"><h3 class="admin-form__title">${isEdit ? 'Edit' : 'Add'} Session</h3><button class="btn btn--secondary" data-action="cancel">Cancel</button></div><form class="admin-form" id="admin-form" novalidate><div class="admin-form__grid">${this.fields.map(field => `
      <div class="admin-form__field" style="grid-column: span ${field.gridCol || 1};">
        <label for="${field.key}">${field.label}${field.required ? ' <span class="required-indicator">*</span>' : ''}</label>
        ${field.type === 'select' ? `<select name="${field.key}" id="${field.key}" ${field.required ? 'required' : ''}><option value="">Select</option>${field.options.map(opt => `<option value="${opt.value}" ${item?.[field.key] === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}</select>` :
        field.type === 'textarea' ? `<textarea name="${field.key}" id="${field.key}" rows="3" placeholder="${field.placeholder || ''}">${item?.[field.key] || ''}</textarea>` :
        field.type === 'checkbox' ? `<label class="admin-checkbox"><input type="checkbox" name="${field.key}" id="${field.key}" ${item?.[field.key] ? 'checked' : ''}><span class="admin-checkbox__checkmark"></span> ${field.label}</label>` :
        `<input type="${field.type}" name="${field.key}" id="${field.key}" value="${item?.[field.key] || ''}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} ${field.readonly ? 'readonly' : ''}>`}
      </div>`).join('')}</div><div class="admin-form__actions"><button type="button" class="btn btn--secondary" data-action="cancel">Cancel</button><button type="submit" class="btn btn--primary">${isEdit ? 'Update' : 'Create'}</button></div></form></div>`;
  }


  getMobileCardBadgeHtml(item) {
    const availabilityLabels = {
      available: 'Available',
      unavailable: 'Unavailable',
      temporarily_closed: 'Temporarily Closed'
    };
    const availabilityColors = {
      available: 'admin-badge--success',
      unavailable: 'admin-badge--danger',
      temporarily_closed: 'admin-badge--warning'
    };
    const availabilityLabel = availabilityLabels[item.availability_status] || item.availability_status;
    const availabilityColor = availabilityColors[item.availability_status] || 'admin-badge--secondary';
    return `<span class="admin-badge ${availabilityColor}">${availabilityLabel}</span>`;
  }

  getMobileCardSubtitle(item) {
    return '';
  }

  getMobileCardMetaItems(item) {
    const timeSlot = item.start_time
      ? `${item.start_time}${item.end_time ? ` - ${item.end_time}` : ''}`
      : '-';
    return [
      { label: 'Price', value: `\u20B9${item.price_amount}` },
      { label: 'Duration', value: item.duration_minutes ? `${item.duration_minutes} min` : '-' },
      { label: 'Time Slot', value: timeSlot },
    ];
  }

  getPaginationHtml() {
    return `<div class="admin-pagination">
      <button class="btn btn--secondary btn--sm" data-action="prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button>
      <span class="admin-pagination__info">Page ${this.currentPage} of ${this.totalPages} (${this.totalCount} total)</span>
      <button class="btn btn--secondary btn--sm" data-action="next-page" ${this.currentPage === this.totalPages ? 'disabled' : ''}>Next</button>
    </div>`;
  }

  bindEvents() {
    this.container.querySelectorAll('[data-action]').forEach((element) => {
      element.addEventListener('click', async (event) => {
        const target = event.currentTarget;
        const action = target.dataset.action;
        const id = target.dataset.id;

        switch (action) {
          case 'create':
            this.showCreateForm();
            this.bindEvents();
            break;

          case 'edit': {
            const item = this.items.find(
              (entry) => String(entry.id) === String(id)
            );

            if (!item) {
              alert('Session not found. Please refresh the page.');
              return;
            }

            this.showEditForm(item);
            this.bindEvents();
            break;
          }

          case 'delete':
            if (id) {
              await this.handleDelete(id);
              this.bindEvents();
            }
            break;

          case 'cancel':
            this.closeForm();
            this.bindEvents();
            break;

          case 'prev-page':
            if (this.currentPage > 1) {
              this.currentPage--;
              await this.loadData();
              this.bindEvents();
            }
            break;

          case 'next-page':
            if (this.currentPage < this.totalPages) {
              this.currentPage++;
              await this.loadData();
              this.bindEvents();
            }
            break;
        }
      });
    });

    this.container
      .querySelectorAll('[data-action="toggle-visibility"]')
      .forEach((element) => {
        element.addEventListener('change', async (event) => {
          const input = event.currentTarget;
          if (input.dataset.id) {
            await this.handleToggleVisibility(input.dataset.id, input.checked);
            this.bindEvents();
          }
        });
      });

    this.container
      .querySelectorAll('[data-action="update-order"]')
      .forEach((element) => {
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
            this.bindEvents();
          }
        });
      });

    const searchInput = this.container.querySelector('.admin-search');

    if (searchInput) {
      searchInput.addEventListener('input', async (event) => {
        this.search = event.currentTarget.value;
        this.currentPage = 1;
        await this.loadData();
        this.bindEvents();
      });
    }
  }

  bindFormEvents() {
    const form = this.container.querySelector('#admin-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const data = this.getFormData();
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

      this.bindEvents();
    });
  }
}

export function createAdminPayPlay(container) {
  return new AdminPayPlayModule(container);
}
