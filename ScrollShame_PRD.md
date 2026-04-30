**PRODUCT REQUIREMENTS DOCUMENT**

**ScrollShame**

*Your browser knows you doomscrolled at 2am.*

| Version | Status | Author | Date |
| :---- | :---- | :---- | :---- |
| 1.0 | Draft | Bharath | April 2026 |

# **1\. Product Overview**

| ONE-LINE PITCH ScrollShame is a Chrome extension that tracks your tab hoarding, scroll frenzy, and late-night browser spirals — then delivers a brutally deadpan weekly report you'll want to screenshot and post. |
| :---- |

ScrollShame sits in the category of "apps that are embarrassingly honest about your habits." Like SlapMac turned MacBook hardware into a reaction toy, ScrollShame turns your most shameful browser behavior into shareable content.

The weekly "digital therapy report" is the core viral mechanic. It is both the product and the social object.

## **1.1  The problem**

People have no honest mirror for their browser behavior. They vaguely know they open too many tabs and scroll at night — but they have no number, no story, no receipt. ScrollShame gives them the receipt.

## **1.2  The insight**

Shame is shareable when it's funny. A deadpan roast of your own behavior — "You opened 47 tabs and closed them all in shame. Classic." — is something people post because it makes them look self-aware, not pathetic. The same data that could feel accusatory becomes a badge of chaotic honor.

## **1.3  Success metrics (MVP)**

| Metric | 30-day target | 90-day target |
| :---- | :---- | :---- |
| Chrome Web Store installs | 500 | 3,000 |
| Weekly active users | 200 | 1,500 |
| Report share rate | \>20% | \>30% |
| Paid unlock conversions | 50 | 400 |
| Revenue (one-time sales) | $150 | $1,200 |

# **2\. Target User**

## **2.1  Primary ICP**

Remote workers, indie hackers, developers, and knowledge workers aged 22–38 who:

* Live in their browser for 8–12 hours a day

* Maintain a persistent tab graveyard of 20–80+ open tabs

* Post relatable tech/productivity humor on X, LinkedIn, or Instagram

* Have a self-deprecating relationship with their own productivity habits

* Buy $3–$8 impulse tools without overthinking it

## **2.2  Secondary ICP**

Productivity content creators (YouTube, newsletter, TikTok) who use their own workflows as content material. ScrollShame gives them a recurring data source.

## **2.3  Anti-ICP (do not target)**

* Privacy-paranoid users (will not install any extension that tracks browsing)

* Corporate IT environments (extension store is often blocked)

* Users who want to genuinely fix their habits (this is not a habit tracker)

# **3\. Core Features**

## **3.1  Behavior tracking (silent, local)**

All data is stored locally. Nothing leaves the browser. This is both a privacy choice and a marketing message.

| Signal | What is tracked | Roast trigger |
| :---- | :---- | :---- |
| Tab count | Peak tab count per session, average across week | \>30 tabs |
| Scroll velocity | px/sec, classified as calm / anxious / spiraling | \>800px/sec |
| Late-night usage | Sessions between 11pm–4am | Any session |
| Tab churn | Tabs opened and closed within 60 seconds | \>10/hour |
| Session length | Continuous focused-window time | \>4 hrs straight |
| Backspace rage | Rapid repeated backspace in text inputs | \>5x in 2 sec |

## **3.2  The weekly shame report**

Generated every Monday morning. The report is the hero feature — it's designed to be a screenshot, not a dashboard.

* A full-bleed card layout optimized for 9:16 (mobile screenshot ratio)

* Headline stat: the most embarrassing number from the week

* Three supporting roast lines — deadpan, specific, slightly mean

* A "shame score" from 0–100 with a custom title (e.g., "Mild Chaos Agent", "Full Send Mode", "Please Sleep")

* A one-tap share button that copies the image to clipboard

* Leaderboard opt-in: submit your score to the anonymous weekly global board

**Sample report card copy:**

| SAMPLE — WEEK OF APRIL 21 Peak tabs: 61  |  Scroll score: Spiraling  |  Night sessions: 4"You opened 61 tabs, closed 58 of them without reading them, and called that research. You browsed at 1:47am on a Tuesday. For what. You know what you did."Shame Score: 74 / 100  —  Certified Tab Hoarder |
| :---- |

## **3.3  Roast pack system (monetization lever)**

The free tier includes one roast voice: "The Therapist" — calm, clinical, deeply concerned.

Paid roast packs ($1.99 each or $3.99 for all):

* The Drill Sergeant — aggressive, disappointed, military metaphors

* Your Mom — warm but devastating, starts every line with 'Honey,'

* Tech Bro — congratulates you on your "productivity chaos" as a growth mindset

* The Accountant — translates your scroll habits into billable hours lost

## **3.4  Leaderboard (virality engine)**

Optional, anonymous. Users can opt in to submit their weekly shame score. A public leaderboard at scrollshame.com shows the top 10 most chaotic users globally each week. Names are anonymous usernames auto-generated on opt-in.

The leaderboard is updated every Monday and gets its own Product Hunt / Reddit post each week.

# **4\. Monetization**

## **4.1  Pricing model**

| Tier | What you get | Price |
| :---- | :---- | :---- |
| Free | Weekly report, Therapist roast pack, basic stats | $0 |
| Roast Pack | Unlock any one additional roast voice | $1.99 one-time |
| Shame Bundle | All roast packs, export to CSV, leaderboard badge | $3.99 one-time |

## **4.2  Revenue model rationale**

The one-time model (no subscription) is intentional. It matches the impulse-buy psychology of the SlapMac playbook. Nobody budgets for a shame tracker. They buy it in a moment of recognition — "this is literally me" — and that moment does not survive a monthly commitment screen.

The free tier with the share mechanic is the acquisition funnel. Viral reports bring users in. The roast pack upsell hits at the moment of highest delight — right after reading the free report.

## **4.3  Billing infrastructure**

* Polar.sh for payment processing (aligned with your existing stack)

* License key embedded in Chrome storage after purchase

* No backend auth required — license validation is client-side with a simple key check

# **5\. Viral Loop Design**

## **5.1  The share mechanic**

The weekly report card is designed as a social object first, a product second. Design constraints:

* Card renders at 1080x1920 (phone screenshot dimensions) in a popup

* One-click copy-to-clipboard as an image

* "scrollshame.com" watermark in the bottom corner (subtle, not obnoxious)

* No "Made with" banner — the URL does the same job without the cringe

## **5.2  Creator discount (SlapMac play)**

Post a screenshot of your report on X/Instagram/TikTok/LinkedIn tagging \#ScrollShame. Get a DM with a free Shame Bundle unlock code. This drives the initial wave of UGC and surfaces the product to new audiences with zero ad spend.

## **5.3  Weekly leaderboard content loop**

Every Monday:

1. Leaderboard resets and updates with new top shamers

2. Automated post on @ScrollShame X account with winner callouts

3. Email digest goes to all opted-in users showing their rank vs global average

4. 3–5% of users share this email screenshot — free weekly impressions

## **5.4  Seeded launch strategy**

* Post own week-1 report on X and relevant subreddits (r/productivity, r/webdev, r/IndieHackers)

* DM 10 developer influencers with a free bundle key and one sentence pitch

* Product Hunt launch on a Tuesday (highest weekday traffic, avoid Monday rush)

* "Make a reel, get the bundle free" campaign from day 1

# **6\. Technical Architecture**

## **6.1  Extension structure**

| File / Component | Responsibility |
| :---- | :---- |
| content.js | Injected into all pages. Tracks scroll velocity, backspace events, active time. |
| background.js | Service worker. Tracks tab count via chrome.tabs API. Aggregates daily stats into chrome.storage.local. |
| popup.html | Extension popup showing current week stats and quick shame score preview. |
| report.html | Full-screen report card. Renders the weekly report, handles share/copy flow. |
| options.html | Settings: notification time, opt-out of specific trackers, roast pack selector, license key input. |

## **6.2  Data storage**

* All behavioral data stored in chrome.storage.local — never transmitted

* Weekly aggregates retained for 12 weeks, then pruned

* License key stored in chrome.storage.sync (syncs across devices)

* Leaderboard submission: single POST to Cloudflare Worker — only sends score \+ anonymous ID, no domain data

## **6.3  Report card rendering**

The share card is rendered as an HTML canvas inside report.html. html2canvas (or native OffscreenCanvas) converts the styled DOM card to a PNG blob. This avoids any server-side rendering dependency and keeps everything local.

## **6.4  Stack**

* Extension: vanilla JS \+ TypeScript, Manifest V3

* Report card: HTML canvas, Tailwind (bundled via CDN-free build)

* Leaderboard backend: single Cloudflare Worker \+ D1 (aligned with your existing infra)

* Payments: Polar.sh

* Build: Bun \+ esbuild

## **6.5  Privacy architecture**

"Your data never leaves your browser" is a core marketing claim. The only outbound network call is the optional, explicitly opt-in leaderboard submission — and even that sends only a numeric score and a randomly generated anonymous ID.

# **7\. MVP Scope (7-Day Build)**

## **7.1  In scope**

* Tab count tracking via chrome.tabs API

* Scroll velocity classification (calm / anxious / spiraling)

* Late-night session detection (11pm–4am)

* Weekly report card with one roast pack (Therapist)

* Share card: copy to clipboard as PNG

* Popup with live week stats

* Polar.sh payment flow for Shame Bundle unlock

* Chrome Web Store listing

## **7.2  Out of scope for MVP**

* Leaderboard (Week 2–3)

* Additional roast packs (Week 2–3)

* CSV export

* Firefox / Edge support

* Email digest

## **7.3  7-day build schedule**

| Day | Goal |
| :---- | :---- |
| Day 1 | Manifest V3 scaffold, background.js tab tracking, chrome.storage schema, local dev setup |
| Day 2 | content.js scroll velocity \+ backspace detection, late-night flagging logic |
| Day 3 | Weekly aggregation logic, roast line generator (rule-based, no LLM needed for MVP) |
| Day 4 | Report card HTML/CSS design, shame score calculation, canvas PNG export |
| Day 5 | Popup UI, options page, Polar.sh integration \+ license key unlock flow |
| Day 6 | QA, edge cases (no data yet, first week, etc.), Chrome Web Store submission |
| Day 7 | Landing page (scrollshame.com), Product Hunt draft, launch assets, creator DMs |

# **8\. Competitive Landscape**

## **8.1  Direct competitors**

There are no direct competitors. No Chrome extension currently combines browser behavior tracking with deadpan roast comedy and a shareable report card. This is the gap.

## **8.2  Adjacent products**

| Product | What they do | Why they're not us |
| :---- | :---- | :---- |
| RescueTime | Productivity time tracking, serious analytics | No comedy, no share mechanic, $12/mo subscription |
| Workona | Tab management tool | Solves the problem; ScrollShame celebrates it |
| TabStats | Counts your tabs, no opinion about it | Data without personality — no virality |
| Wrapped (Spotify) | Annual behavior recap with social sharing | The exact model — but weekly and browser-focused |

## **8.3  Defensibility**

ScrollShame's moat is not technical — it's tonal. The deadpan roast voice, the specific line writing, and the visual design of the report card are the product. A competitor can clone the tracking logic in a weekend; they cannot clone a distinct comedic voice.

The leaderboard and the creator community that builds around it are the longer-term flywheel.

# **9\. Risks & Mitigations**

| Risk | Likelihood | Mitigation |
| :---- | :---- | :---- |
| Chrome Web Store review rejection | Medium — behavior tracking extensions face scrutiny | Explicit permissions disclosure, prominent privacy policy, local-only data claim front and center |
| Privacy backlash | Medium | Zero data leaves device (except opt-in leaderboard). Audit log available in options page. |
| One-week novelty, then uninstall | High | Weekly cadence by design — the product's value resets every Monday. Novelty is renewed. |
| Roast copy gets old fast | Medium | Roast pack DLC adds new voices. Community roast submissions as a future feature. |
| Low conversion from free to paid | Medium | Free tier is genuinely good. Upsell shown only after 2nd weekly report (after user is hooked). |

# **10\. Open Questions**

## **Before build starts**

* Should the roast lines be rule-based (deterministic, fast, free) or LLM-generated (more varied, costs $0.001/report)? Recommendation: start rule-based, add LLM as a paid tier feature later.

* Will Chrome Web Store approve an extension that explicitly tracks scroll behavior? Need to validate with a test submission.

* Does the share image need to be generated server-side for better quality, or is canvas sufficient?

## **Post-MVP**

* Add a "fix your habits" mode that competes with RescueTime — or stay firmly in the comedy lane?

* Firefox/Edge port: low effort, doubles addressable market.

* Annual "Wrapped" version: a full-year shame report in December — natural Product Hunt moment.

ScrollShame PRD  |  v1.0  |  Bharath  |  April 2026