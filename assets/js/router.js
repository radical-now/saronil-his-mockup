/* ==========================================================================
   SARONIL HMS - SPA VIEW ROUTER (router.js)
   ========================================================================== */

window.views = window.views || {}; // Global container for view renderers

const router = {
  currentPage: null,
  container: null,

  init() {
    this.container = document.getElementById('main-content');
    
    // Add click listener to the entire body to intercept navigation
    document.body.addEventListener('click', (e) => {
      const anchor = e.target.closest('.menu-item, .nav-link, a');
      if (!anchor) return;

      let href = anchor.getAttribute('href');
      // If it's a menu item click, check data-target
      if (anchor.classList.contains('menu-item')) {
        const target = anchor.dataset.target;
        if (target) {
          e.preventDefault();
          this.navigate(target);
          return;
        }
      }

      if (!href || href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) {
        return;
      }

      // Check if it is a local page navigation
      if (href.endsWith('.html') || href === '/' || href.startsWith('#')) {
        e.preventDefault();
        
        let path = href.replace('.html', '').replace('#', '');
        if (path === '/' || path === '') path = 'dashboard';
        
        this.navigate(path);
      }
    });

    // Hash change listener for browser back/forward and deep linking
    window.addEventListener('hashchange', () => this.handleRouting());
    
    // Initial routing
    this.handleRouting();
  },

  navigate(path) {
    window.location.hash = path;
  },

  parseHash() {
    const hash = window.location.hash.substring(1) || 'dashboard';
    const [pathPart, queryPart] = hash.split('?');
    
    // Parse query params
    const params = {};
    if (queryPart) {
      queryPart.split('&').forEach(param => {
        const [key, value] = param.split('=');
        params[key] = decodeURIComponent(value);
      });
    }

    // Parse sub-anchors (e.g. #emr-vitals)
    const parts = pathPart.split('-');
    const pageId = parts[0];
    const subAnchor = parts.slice(1).join('-');

    return { pageId, subAnchor, params };
  },

  handleRouting() {
    if (window.ignoreNextHashChange) {
      window.ignoreNextHashChange = false;
      return;
    }

    const { pageId, subAnchor, params } = this.parseHash();

    // Lock navigation if in active consultation
    if (window.activeConsultationStarted && window.activeConsultation) {
      const isSamePatient = (pageId === 'emr' && params.uhid === window.activeConsultation.uhid);
      if (!isSamePatient) {
        const targetHash = window.location.hash;
        window.ignoreNextHashChange = true;
        window.location.hash = `emr?uhid=${window.activeConsultation.uhid}`;
        
        if (typeof window.showConsultationExitModal === 'function') {
          window.showConsultationExitModal(targetHash);
        }
        return;
      }
    }
    
    // Verify view function exists, default to dashboard
    let targetPage = pageId;
    if (targetPage === 'atd') {
      window.location.hash = 'ipdAdmission?tab=atd';
      return;
    }
    if (!window.views[targetPage]) {
      console.warn(`View "${targetPage}" not found. Falling back to dashboard.`);
      targetPage = 'dashboard';
    }

    // Toggle active state in sidebar menu (with query parameter matching)
    document.querySelectorAll('.menu-item').forEach(item => {
      const fullHash = window.location.hash.substring(1) || 'dashboard';
      const baseTarget = item.dataset.target ? item.dataset.target.split('?')[0] : '';
      
      if (item.dataset.target === fullHash || (baseTarget === targetPage && !item.dataset.target.includes('?'))) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Auto-expand/collapse OPD group based on target page
    var subOpd = document.getElementById('submenu-opd');
    var arrowOpd = document.getElementById('arrow-opd');
    if (subOpd && arrowOpd) {
      if (targetPage === 'appointments' || targetPage === 'emr') {
        subOpd.style.display = 'flex';
        arrowOpd.style.transform = 'rotate(180deg)';
      } else {
        subOpd.style.display = 'none';
        arrowOpd.style.transform = 'rotate(0deg)';
      }
    }

    // Auto-expand/collapse IPD group based on target page
    var subIpd = document.getElementById('submenu-ipd');
    var arrowIpd = document.getElementById('arrow-ipd');
    if (subIpd && arrowIpd) {
      if (targetPage === 'ipdAdmission') {
        subIpd.style.display = 'flex';
        arrowIpd.style.transform = 'rotate(180deg)';
      } else {
        subIpd.style.display = 'none';
        arrowIpd.style.transform = 'rotate(0deg)';
      }
    }

    // Update active page titles / breadcrumbs
    const pageTitleEl = document.getElementById('active-page-title');
    if (pageTitleEl) {
      const formattedTitle = targetPage === 'customReports' ? 'Make Your Own Report'
        : targetPage === 'pantryKitchen' ? 'Pantry & Kitchen Management'
        : targetPage.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      pageTitleEl.textContent = targetPage === 'dashboard' ? 'Hospital Overview Dashboard' : (targetPage === 'daybed' ? 'Day Care' : formattedTitle);
      
      // Hide title on dashboard since heading is displayed above the KPI cards in the dashboard body
      if (targetPage === 'dashboard') {
        pageTitleEl.style.display = 'none';
      } else {
        pageTitleEl.style.display = 'block';
      }
    }

    // Toggle global back button visibility
    const backBtn = document.getElementById('global-back-btn');
    if (backBtn) {
      if (targetPage === 'dashboard') {
        backBtn.style.display = 'none';
      } else {
        backBtn.style.display = 'inline-flex';
      }
    }

    // Reset scroll/layout state left behind by modals or full-screen views.
    // Restoring the canonical `view-container` class guarantees the scroll
    // container is intact even if a view overwrote #main-content's className.
    document.body.style.overflow = '';
    if (this.container) {
      this.container.className = 'view-container';
      this.container.scrollTop = 0;
    }

    // Render the view
    this.currentPage = targetPage;
    this.container.innerHTML = `<div class="loading-view" style="padding: 3rem; text-align: center; color: var(--text-muted);">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite; margin-right: 8px; display: inline-block; vertical-align: middle;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor"></path>
      </svg>
      Loading module...
    </div>`;

    // Brief timeout to let the UI breathe and show smooth transition
    setTimeout(() => {
      try {
        if (window.activeConsultationStarted && targetPage === 'emr') {
          if (typeof window.setDistractionFreeMode === 'function') window.setDistractionFreeMode(true);
        } else {
          if (typeof window.setDistractionFreeMode === 'function') window.setDistractionFreeMode(false);
        }

        this.container.innerHTML = ''; // Clear container
        window.views[targetPage](this.container, subAnchor, params);
      } catch (err) {
        console.error(`Error rendering view "${targetPage}":`, err);
        this.container.innerHTML = `<div class="card" style="margin: 2rem; border-color: var(--color-danger);">
          <div class="card-header" style="background-color: var(--color-danger-bg); color: var(--color-danger);">
            <h4>Error Loading View</h4>
          </div>
          <div class="card-body">
            <p>An error occurred while attempting to render the <strong>${targetPage}</strong> module.</p>
            <pre style="background: #f1f5f9; padding: 1rem; border-radius: 4px; margin-top: 1rem; overflow-x: auto; color: var(--color-danger); font-size: 0.8rem;">${err.stack}</pre>
          </div>
        </div>`;
      }
    }, 100);
  }
};

// Listen on DOMContentLoaded to launch
document.addEventListener('DOMContentLoaded', () => {
  router.init();
  window.router = router;
});
