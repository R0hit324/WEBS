import { BaseAdminModule } from '@/lib/admin-module';

export class AdminPayPlayBookingsModule extends BaseAdminModule {
  constructor(container) {
    super({
      container,
      title: 'Pay & Play Bookings',
      apiEndpoint: 'pay_play_bookings',
      fields: [
        { key: 'full_name', label: 'Full Name', type: 'text', readonly: true },
        { key: 'phone', label: 'Phone', type: 'text', readonly: true },
        { key: 'email', label: 'Email', type: 'email', readonly: true },
        { key: 'session_id', label: 'Session', type: 'text', readonly: true },
        { key: 'preferred_date', label: 'Preferred Date', type: 'date', readonly: true },
        { key: 'preferred_time', label: 'Preferred Time', type: 'text', readonly: true },
        { key: 'amount', label: 'Amount (₹)', type: 'number', readonly: true },
        { key: 'booking_status', label: 'Booking Status', type: 'select', options: [{ value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'cancelled', label: 'Cancelled' }, { value: 'completed', label: 'Completed' }] },
        { key: 'created_at', label: 'Submitted', type: 'datetime', readonly: true },
      ],
      searchFields: ['full_name', 'email', 'phone'],
      filters: [
        { key: 'booking_status', label: 'Booking Status', type: 'select', options: [{ value: '', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'cancelled', label: 'Cancelled' }, { value: 'completed', label: 'Completed' }] },
      ],
      sortable: true,
      reorderable: false,
    });
  }

  async init() {
    await this.loadData();
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `<div class="admin-module"><div class="admin-module__header"><h2 class="admin-module__title">${this.title}</h2><p class="admin-module__subtitle">Manage booking requests</p></div>${this.showForm ? this.getFormHtml() : this.getListHtml()}</div>`;
  }

  getListHtml() {
    return `<div class="admin-module__toolbar"><input type="search" class="admin-search" placeholder="Search bookings..." value="${this.search}" aria-label="Search" /><select class="admin-filter" data-filter="booking_status"><option value="">Booking Status</option><option value="pending" ${this.activeFilters.booking_status === 'pending' ? 'selected' : ''}>Pending</option><option value="confirmed" ${this.activeFilters.booking_status === 'confirmed' ? 'selected' : ''}>Confirmed</option><option value="cancelled" ${this.activeFilters.booking_status === 'cancelled' ? 'selected' : ''}>Cancelled</option><option value="completed" ${this.activeFilters.booking_status === 'completed' ? 'selected' : ''}>Completed</option></select></div>${this.getTableHtml()}`;
  }

  getTableHtml() {
    if (this.isLoading) {
      return `<div class="admin-module__loading"><div class="admin-spinner"></div></div>`;
    }

    const rows = this.items.length > 0 ? this.items.map(item => `
      <tr data-id="${item.id}">
        <td>${new Date(item.created_at).toLocaleDateString()}</td>
        <td><strong>${item.full_name}</strong></td>
        <td>${item.email}</td>
        <td>${item.session_id}</td>
        <td>${item.preferred_date} ${item.preferred_time}</td>
        <td>₹${item.amount}</td>
        <td><span class="admin-badge admin-badge--${item.booking_status}">${item.booking_status}</span></td>
        <td>
          <div class="admin-actions">
            <button class="admin-action-btn" data-action="edit" data-id="${item.id}" title="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="7" class="admin-table__empty">No bookings found</td></tr>`;

    return `<div class="admin-table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th data-sort="created_at">Date</th>
            <th data-sort="full_name">Name</th>
            <th>Email</th>
            <th>Session</th>
            <th>Date/Time</th>
            <th>Amount</th>
            <th>Booking</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>${this.totalPages > 1 ? this.getPaginationHtml() : ''}`;
  }

  getFormHtml() {
    const item = this.editingId ? this.items.find(i => i.id === this.editingId) : null;
    const isEdit = !!this.editingId;
    return `<div class="admin-form-container">
      <div class="admin-form__header"><h3 class="admin-form__title">${isEdit ? 'Edit' : 'View'} Booking</h3><button class="btn btn--secondary" data-action="cancel">Cancel</button></div>
      <form class="admin-form" id="admin-form" novalidate>
        <div class="admin-form__grid">
          ${this.fields.map(field => `
            <div class="admin-form__field" style="grid-column: span ${field.gridCol || 1};">
              <label for="${field.key}">${field.label}</label>
              ${field.type === 'select' ? `
                <select name="${field.key}" id="${field.key}">
                  <option value="pending" ${item?.booking_status === 'pending' ? 'selected' : ''}>Pending</option>
                  <option value="confirmed" ${item?.booking_status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                  <option value="cancelled" ${item?.booking_status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                  <option value="completed" ${item?.booking_status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
              ` : `
                <input type="${field.type}" name="${field.key}" id="${field.key}" value="${item?.[field.key] || ''}" ${field.readonly ? 'readonly' : ''}>
              `}
            </div>
          `).join('')}
        </div>
        <div class="admin-form__actions">
          <button type="button" class="btn btn--secondary" data-action="cancel">Cancel</button>
          <button type="submit" class="btn btn--primary">${isEdit ? 'Update Status' : 'Close'}</button>
        </div>
      </form>
    </div>`;
  }

  getPaginationHtml() {
    return `<div class="admin-pagination"><button class="btn btn--secondary btn--sm" data-action="prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button><span class="admin-pagination__info">Page ${this.currentPage} of ${this.totalPages} (${this.totalCount} total)</span><button class="btn btn--secondary btn--sm" data-action="next-page" ${this.currentPage === this.totalPages ? 'disabled' : ''}>Next</button></div>`;
  }
}

export function createAdminPayPlayBookings(container) { return new AdminPayPlayBookingsModule(container); }