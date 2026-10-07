import { BaseAdminModule } from '@/lib/admin-module';

const SECTION_KEYS = [
  { key: 'hero', label: 'Hero Section', description: 'Main hero banner with CTAs' },
  { key: 'highlights', label: 'Highlights Strip', description: 'Key stats/accolades bar' },
  { key: 'about_preview', label: 'About Preview', description: 'About section on homepage' },
  { key: 'training_preview', label: 'Training Preview', description: 'Training ranges on homepage' },
  { key: 'coaches_preview', label: 'Coaches Preview', description: 'Featured coaches on homepage' },
  { key: 'achievements_preview', label: 'Achievements Preview', description: 'Featured achievements on homepage' },
  { key: 'facilities_preview', label: 'Facilities Preview', description: 'Featured facilities on homepage' },
  { key: 'gallery_preview', label: 'Gallery Preview', description: 'Gallery preview on homepage' },
  { key: 'reviews', label: 'Reviews Section', description: 'Testimonials on homepage' },
  { key: 'motivational', label: 'Motivational Section', description: 'Motivational quotes section' },
  { key: 'final_cta', label: 'Final CTA', description: 'Final call-to-action section' },
  { key: 'about', label: 'About Page', description: 'Full about page' },
  { key: 'training', label: 'Training Page', description: 'Full training page' },
  { key: 'coaches', label: 'Coaches Page', description: 'Full coaches page' },
  { key: 'facilities', label: 'Facilities Page', description: 'Full facilities page' },
  { key: 'achievements', label: 'Achievements Page', description: 'Full achievements page' },
  { key: 'gallery', label: 'Gallery Page', description: 'Full gallery page' },
  { key: 'reviews', label: 'Reviews Page', description: 'Full reviews page' },
  { key: 'pay_play', label: 'Pay & Play Page', description: 'Full Pay & Play page' },
];

export class AdminSiteSectionsModule extends BaseAdminModule {
  constructor(container) {
    super({
      container,
      title: 'Site Section Visibility',
      apiEndpoint: 'site_section_settings',
      fields: [
        { key: 'section_key', label: 'Section Key', type: 'select', required: true, options: SECTION_KEYS.map(s => ({ value: s.key, label: `${s.label} (${s.key})` })) },
        { key: 'section_name', label: 'Display Name', type: 'text' },
        { key: 'is_visible', label: 'Visible on Website', type: 'checkbox' },
        { key: 'display_order', label: 'Display Order', type: 'number' },
      ],
      searchFields: ['section_key', 'section_name'],
      filters: [
        { key: 'is_visible', label: 'Visibility', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Visible' }, { value: 'false', label: 'Hidden' }] },
      ],
      sortable: true,
      reorderable: true,
    });
  }

  async init() { await this.loadData(); this.render(); this.bindEvents(); }

  render() { this.container.innerHTML = `<div class="admin-module"><div class="admin-module__header"><h2 class="admin-module__title">${this.title}</h2><p class="admin-module__subtitle">Control which sections are visible on the public website</p></div>${this.showForm ? this.getFormHtml() : this.getListHtml()}</div>`; }

  getListHtml() { return `<div class="admin-module__toolbar"><input type="search" class="admin-search" placeholder="Search sections..." value="${this.search}" aria-label="Search" /><button class="btn btn--primary" data-action="create"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Section</button></div>${this.getTableHtml()}`; }

  getTableHtml() { return `${this.isLoading ? `<div class="admin-module__loading"><div class="admin-spinner"></div></div>` : `<div class="admin-table-container"><table class="admin-table"><thead><tr><th data-sort="section_key">Section</th><th data-sort="section_name">Name</th><th data-sort="is_visible">Visible</th><th data-sort="display_order">Order</th><th>Actions</th></tr></thead><tbody class="admin-table__body ${this.reorderable ? 'admin-table__body--reorderable' : ''}">${this.items.length > 0 ? this.items.map(item => { const sectionInfo = SECTION_KEYS.find(s => s.key === item.section_key); return `<tr data-id="${item.id}" data-order="${item.display_order}"><td><strong>${sectionInfo?.label || item.section_key}</strong><br><small>${sectionInfo?.description || ''}</small></td><td>${item.section_name || '-'}</td><td><label class="admin-toggle"><input type="checkbox" class="admin-toggle__input" data-action="toggle-visibility" data-id="${item.id}" ${item.is_visible ? 'checked' : ''}><span class="admin-toggle__slider"></span></label></td><td><input type="number" class="admin-order-input" value="${item.display_order}" data-action="update-order" data-id="${item.id}" style="width: 60px;"></td><td><div class="admin-actions"><button class="admin-action-btn" data-action="edit" data-id="${item.id}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button></div></td></tr>`).join('') : `<tr><td colspan="5" class="admin-table__empty">No sections configured</td></tr>`}</tbody></table></div>${this.totalPages > 1 ? this.getPaginationHtml() : ''}`; }

  getFormHtml() { const item = this.editingId ? this.items.find(i => i.id === this.editingId) : null; const isEdit = !!this.editingId; return `<div class="admin-form-container"><div class="admin-form__header"><h3 class="admin-form__title">${isEdit ? 'Edit' : 'Add'} Section</h3><button class="btn btn--secondary" data-action="cancel">Cancel</button></div><form class="admin-form" id="admin-form" novalidate><div class="admin-form__grid">${this.fields.map(field => `<div class="admin-form__field" style="grid-column: span ${field.gridCol || 1};"><label for="${field.key}">${field.label}${field.required ? ' <span class="required-indicator">*</span>' : ''}</label>${field.type === 'select' ? `<select name="${field.key}" id="${field.key}" ${field.required ? 'required' : ''}><option value="">Select section</option>${SECTION_KEYS.map(s => `<option value="${s.key}" ${item?.section_key === s.key ? 'selected' : ''}>${s.label}</option>`).join('')}</select>` : field.type === 'checkbox' ? `<label class="admin-checkbox"><input type="checkbox" name="${field.key}" id="${field.key}" ${item?.[field.key] ? 'checked' : ''}><span class="admin-checkbox__checkmark"></span> ${field.label}</label>` : `<input type="${field.type}" name="${field.key}" id="${field.key}" value="${item?.[field.key] || ''}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>`}</div>`).join('')}</div><div class="admin-form__actions"><button type="button" class="btn btn--secondary" data-action="cancel">Cancel</button><button type="submit" class="btn btn--primary">${isEdit ? 'Update' : 'Create'}</button></div></form></div>`; }

  getPaginationHtml() { return `<div class="admin-pagination"><button class="btn btn--secondary btn--sm" data-action="prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button><span class="admin-pagination__info">Page ${this.currentPage} of ${this.totalPages} (${this.totalCount} total)</span><button class="btn btn--secondary btn--sm" data-action="next-page" ${this.currentPage === this.totalPages ? 'disabled' : ''}>Next</button></div>`; }
}

export function createAdminSections(container: HTMLElement) { return new AdminSiteSectionsModule(container); }