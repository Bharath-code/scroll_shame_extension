# Plan: Free→Paid Monetization Funnel

> Source: Business model design - $1.99 Pro tier with free base

## Architectural Decisions

- **License Storage**: `chrome.storage.local` with key `license-status`
- **Feature Flags**: Runtime check via `isFeatureEnabled(feature)` helper
- **Analytics**: Custom events to `chrome.storage.local` for funnel tracking
- **Payment**: Polar.sh hosted checkout (no custom backend needed)

---

## Phase 1: Foundation (License & Feature System)

**Goal**: Infrastructure for tiered access - no user-visible changes yet

### What to build

- `src/lib/license.ts` - License state management
  - `LicenseStatus` type: `{ tier: 'free' | 'pro', purchasedAt?: string, licenseKey?: string }`
  - `getLicenseStatus(): Promise<LicenseStatus>`
  - `setLicenseStatus(status: LicenseStatus): Promise<void>`
  - `isPro(): Promise<boolean>`

- `src/lib/feature-flags.ts` - Feature gate definitions
  - `FeatureFlags` type mapping all features to tier access
  - `canAccess(feature: FeatureName): Promise<boolean>`

- Update `storage.ts` to include license methods

### Acceptance criteria

- [ ] License state persists across browser restarts
- [ ] `isPro()` correctly returns tier status
- [ ] All feature gates can check access before rendering

---

## Phase 2: Free Tier Delivery (v1.0 - MVP)

**Goal**: Ship fully functional free extension to Chrome Web Store

### What to build

**Feature Matrix Implementation:**

| Feature | Free Access |
|---------|-------------|
| Tab tracking | ✓ (unlimited) |
| Scroll velocity | ✓ (unlimited) |
| Late-night detection | ✓ (unlimited) |
| Weekly report | ✓ (unlimited) |
| Roast voice | Therapist only |
| Export | With watermark |
| Historical data | 7 days |

**Changes to existing files:**

- `src/report/main.tsx` - Add watermark overlay for free exports
- `src/lib/roast-pools.ts` - Add `FREE_ROAST_VOICES` export (therapist only)
- `public/manifest.json` - Version bump to 1.0.0

**Chrome Web Store prep:**

- Create listing with screenshots
- Write compelling description
- Set category: Productivity

### Acceptance criteria

- [ ] Free users see only Therapist roast voice
- [ ] Exported images have subtle watermark
- [ ] Report shows only last 7 days data
- [ ] Extension installs and tracks without errors

---

## Phase 3: Upgrade UI - Upgrade Hooks

**Goal**: Add contextual upgrade prompts without being aggressive

### What to build

**UpgradeTrigger 1: First Report (Day 7)**

- Trigger: After user views 3rd weekly report
- Logic: Track `reportViews` count in storage
- Placement: Bottom of report card, above footer

**UpgradeTrigger 2: Share Attempt**

- Trigger: User clicks "Copy Receipt"
- Logic: Check `isPro()` - if false, show watermark + upgrade CTA
- Placement: Toast notification after copy

**UpgradeTrigger 3: Settings Page**

- Trigger: User opens options page
- Logic: Show "Upgrade to Pro" banner at top
- Placement: Options page header

**UI Components:**

- `src/components/UpgradeCTA.tsx` - Reusable upgrade banner
  - Props: `placement: 'report' | 'popup' | 'options'`, `variant: 'subtle' | 'prominent'`
  - Design: Non-intrusive, dark theme matching aesthetic

- Update `src/report/main.tsx` - Insert upgrade CTA after 3 views
- Update `src/popup/main.tsx` - Add upgrade link
- Update `src/options/main.tsx` - Add upgrade banner

### Acceptance criteria

- [ ] Upgrade CTA appears after 3 report views (not before)
- [ ] Share toast includes upgrade prompt
- [ ] Options page shows upgrade banner
- [ ] CTA is dismissible (don't ask again for 30 days)

---

## Phase 4: Payment Integration

**Goal**: Enable $1.99 purchase flow via Polar.sh

### What to build

**Checkout Flow:**

1. User clicks upgrade → Opens Polar.sh checkout URL in new tab
2. Polar.sh handles payment, shows success page
3. User returns to extension → Extension detects purchase
4. License upgraded to Pro

**Implementation:**

- `src/lib/payment.ts`
  - `getCheckoutUrl(): string` - Returns Polar.sh product URL
  - `verifyLicense(licenseKey: string): Promise<boolean>` - Validate key
  - `handlePurchaseCallback(): Promise<void>` - Process return from checkout

- Update `manifest.json` - Add `externally_connectable` for Polar.sh communication

**Post-purchase flow:**

- Store license status as `pro` with timestamp
- Refresh feature access in all open views
- Show "Thanks for upgrading!" toast on next report open

### Acceptance criteria

- [ ] Clicking upgrade opens Polar.sh checkout
- [ ] Successful payment updates license to Pro
- [ ] Pro features unlock immediately after purchase
- [ ] Receipt shows on Polar.sh success page

---

## Phase 5: Analytics & Validation

**Goal**: Measure funnel performance and iterate

### What to build

**Funnel Events:**

```typescript
type FunnelEvent =
  | { type: 'install', source: string }
  | { type: 'report_view', weekNumber: number }
  | { type: 'report_share_attempt' }
  | { type: 'upgrade_cta_seen', placement: string }
  | { type: 'upgrade_cta_clicked' }
  | { type: 'purchase_completed' }
  | { type: 'purchase_failed' };
```

**Storage:**
- `chrome.storage.local` key: `analytics-events`
- Batch upload to analytics endpoint (optional, can be manual export for v1)

**Metrics Dashboard (internal):**

- Export function for license to review funnel
- Not visible to users - developer tool only

### Acceptance criteria

- [ ] All funnel events logged to storage
- [ ] Can export event log as JSON
- [ ] Can calculate: install→report view %, report view→upgrade %, upgrade→purchase %

---

## Phase 6: Edge Cases & Polish

**Goal**: Handle failure states gracefully

### What to build

- **Failed payment**: Show retry option, don't change license state
- **Corrupted storage**: Reset to free tier, log error
- **License key invalid**: Prompt to re-purchase, don't lock out
- **Extension update migration**: Preserve license on version update

**UX Polish:**

- Upgrade CTAs remember "dismissed" for 30 days
- Smooth transitions when features unlock after purchase
- Loading states during license verification

### Acceptance criteria

- [ ] Payment failure doesn't break extension
- [ ] Users can re-trigger upgrade flow if dismissed
- [ ] Pro features work immediately after purchase, no refresh required

---

## Implementation Order

```
Phase 1 (Foundation)     ████
Phase 2 (Free v1.0)      ████████
Phase 3 (Upgrade UI)     ████████████
Phase 4 (Payment)        ████████████████
Phase 5 (Analytics)      ██████████████████
Phase 6 (Polish)         ████████████████████
```

**Recommended sequence:**
1. Phase 1 → 2 (ship free to validate)
2. Phase 3 → 4 (add payment after validation)
3. Phase 5 → 6 (measure and polish)

---

## Key Files to Create/Modify

| Phase | Files |
|-------|-------|
| 1 | `src/lib/license.ts` (new), `src/lib/feature-flags.ts` (new), `src/lib/storage.ts` (update) |
| 2 | `src/report/main.tsx` (watermark), `public/manifest.json` (version) |
| 3 | `src/components/UpgradeCTA.tsx` (new), update popup/options/report |
| 4 | `src/lib/payment.ts` (new), update manifest |
| 5 | `src/lib/analytics.ts` (new) |
| 6 | Error handling throughout |