/**
 * Disclaimer Component
 * Persistent unobtrusive banner displayed on Doctor and Nurse dashboards only.
 */

export function renderDisclaimerBanner() {
  return `
    <aside class="disclaimer-banner" role="alert" aria-label="Clinical Decision Support Notice">
      <div class="disclaimer-inner">
        <div class="disclaimer-left">
          <span class="disclaimer-tag">Decision Support</span>
          <span>
            <strong>Decision support only — not a diagnosis.</strong> 
            Clinical judgement always overrides this ranking.
          </span>
        </div>
        <span style="font-size:0.75rem; color:var(--text-muted);">General OPD Module • Synthetic Mock Data</span>
      </div>
    </aside>
  `;
}
