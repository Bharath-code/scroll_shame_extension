import { isPro } from './license';

export type RoastVoice = 'therapist' | 'drill-sergeant' | 'your-mom' | 'tech-bro' | 'accountant';

export const FREE_VOICES: RoastVoice[] = ['therapist'];
export const PRO_VOICES: RoastVoice[] = ['therapist', 'drill-sergeant', 'your-mom', 'tech-bro', 'accountant'];

export interface RoastPool {
  peakTabs: string[];
  nightSessions: string[];
  quickClosures: string[];
  longSessions: string[];
  spiralSessions: string[];
}

export const ROAST_VOICES: Record<RoastVoice, RoastPool> = {
  therapist: {
    peakTabs: [
      "You opened {count} tabs. That's not research, that's a digital hoarding disorder.",
      "Forty tabs? Bold of you to assume you'd read any of them.",
      "{count} tabs open. You probably won't remember why you opened most of them.",
      "Opening tabs is your cardio. Closing them? That's a different story.",
      "You know you could just bookmark things, right? No? Cool."
    ],
    nightSessions: [
      "You were scrolling at {time}. For what. You know what you did.",
      "{time} is not a time for productivity. It's a time for regret.",
      "Your browser knows you doomscrolled at {time}. And so do we now.",
      "Late-night you is a different person. A worse person. A scrolling person.",
      "There's no reason to be online at {time}. None. Yet here we are."
    ],
    quickClosures: [
      "You opened {count} tabs and closed them within 60 seconds. That's not research, that's panic.",
      "Quick open, quick close. The millennial way of feeling productive.",
      "{count} tabs opened and closed without reading. A truly impressive waste of energy.",
      "You clicked a link, realized it wasn't what you wanted, and closed it. Repeat {count} times.",
      "This is what we call 'optimistic browsing' — hoping something will be good, being wrong every time."
    ],
    longSessions: [
      "You spent {hours} hours in one session. Productivity or avoidance? Let's not ask.",
      "{hours} hours of continuous browsing. You didn't even take a bathroom break. We checked.",
      "Four+ hours of focus? More like four+ hours of doomscrolling with extra steps.",
      "At {hours} hours, this isn't browsing. It's a lifestyle choice."
    ],
    spiralSessions: [
      "Your scroll velocity hit {velocity} px/sec. That's not scrolling, that's flying.",
      "You were going {velocity} px/sec. Your mouse wheel has feelings too, you know.",
      "At {velocity} px/sec, you're not reading. You're speedrunning the internet.",
      "Spiral detected. {velocity} px/sec. We diagnose this as 'just one more page' syndrome."
    ]
  },
  'drill-sergeant': {
    peakTabs: [
      "{count} tabs, soldier! That's a battlefield, not a browser!",
      "You call that research? I call that ammunition for failure!",
      "Drop and give me 20 tabs! Actually, don't — you'd just open more!",
      "MR. {count} TABS! You will not survive the day!",
      "At ease! Before you open ANOTHER tab, remember: capability without discipline equals chaos!"
    ],
    nightSessions: [
      "It's {time}, PRIVATE! You should be sleeping, not scrolling!",
      "You think the enemy won't notice you're online at {time}? They will!",
      "MISSION STATUS: FAILED. You were caught behind enemy lines at {time}.",
      "You want to know why you're not getting promoted? Check your screen time at {time}.",
      "THIS IS NOT A DRILL! It's {time} and you're still online! Fall out!"
    ],
    quickClosures: [
      "You opened {count} tabs and abandoned them like a deserter!",
      "TACTICAL RETREAT! {count} tabs compromised in 60 seconds!",
      "You engage the enemy and retreat in {count} seconds? Disgraceful!",
      "That was not a surgical strike! That was panic firing!",
      "You opened {count} fronts and closed every single one! Pick your battles, soldier!"
    ],
    longSessions: [
      "You've been at this for {hours} hours! Is this a mission or a vacation?",
      "Sustained engagement for {hours} hours? Either you're winning or you're just planted!",
      "At {hours} hours, you've crossed from dedication into obsession!",
      "Tell me, recruit: at {hours} hours, are you hunting or being hunted?"
    ],
    spiralSessions: [
      "SCROLL VELOCITY AT {velocity} PX/SEC! You are in full panic mode!",
      "Speed reading? No. Speed scrolling without comprehension!",
      "At {velocity} px/sec, you're not even seeing the content — just pixels!",
      "You are in a death spiral at {velocity} px/sec! RECOVER!"
    ]
  },
  'your-mom': {
    peakTabs: [
      "Honey, you have {count} tabs open. Did you eat today?",
      "Sweetie, {count} tabs is not a personality trait. Close some of those!",
      "I worry about you, sweetie. {count} tabs? When's the last time you went outside?",
      "Honey, your browser looks like my junk drawer — and that's saying something!",
      "Sweetheart, you don't need {count} tabs. You need a nap!"
    ],
    nightSessions: [
      "Honey, it's {time}. You should be sleeping! The internet will be there tomorrow!",
      "Sweetie, {time} is not a reasonable hour to be looking at... whatever this is!",
      "I can see your light under the covers at {time}! Cut it out!",
      "Honey, I heard you up at {time} on your phone again. This isn't healthy!",
      "Sweetie, even the cat is sleeping. Why aren't you?"
    ],
    quickClosures: [
      "You opened {count} tabs and closed them — like you're looking at boys but won't commit!",
      "Honey, make up your mind! {count} tabs in 60 seconds? Pick ONE!",
      "That's not research, sweetie. That's attention deficit browser disorder.",
      "Sweetie, you're like a moth — flying from flame to flame and not landing anywhere!",
      "I didn't raise you to be this indecisive! {count} tabs? Really?"
    ],
    longSessions: [
      "You've been on that computer for {hours} hours, young lady!",
      "Sweetie, you've been staring at that screen for {hours} hours! Your eyes will fall out!",
      "Honey, at some point you need to close the laptop and touch grass!",
      "{hours} hours? That's not browsing, that's a cry for help, sweetie!"
    ],
    spiralSessions: [
      "Slow down, honey! You're scrolling so fast {velocity} px/sec — you're going to hurt yourself!",
      "Sweetie, at {velocity} px/sec, you're not even seeing the ads! They should pay YOU!",
      "Honey, you're scrolling like you're trying to escape something! What happened?"
    ]
  },
  'tech-bro': {
    peakTabs: [
      "{count} tabs? Bro, that's just caching your dopamine supply!",
      "You're in growth mode, king! {count} tabs is MVP of something!",
      "That's not a problem — that's actually just efficient parallel loading, bro!",
      "You're like a startup launching {count} features simultaneously. MVP vibes!",
      "Tab hoarding is just load balancing for your brain. Respect, bro."
    ],
    nightSessions: [
      "Building at {time}? That's the founder grind! No cap!",
      "Grinding at {time}? The competition is sleeping. You're winning, king!",
      "Late-night coding/hustling at {time} is just timezone arbitrage on productivity!",
      "You're the main character at {time}. Everyone else is in beta mode!",
      "Sleep is for people who've already shipped, bro. Keep shipping at {time}!"
    ],
    quickClosures: [
      "Pivot in {count} seconds! That's the fastest iteration cycle I've seen, bro!",
      "You're basically doing A/B testing in real time, but faster!",
      "{count} tabs in 60 seconds? That's actually lean startup methodology, king!",
      "Fail fast, iterate faster. You're basically a lean startup, bro!",
      "You're doing rapid prototyping. The MVP didn't ship. That's feature, not bug!"
    ],
    longSessions: [
      "{hours} hours in the zone? That's flow state, bro! Don't break it!",
      "You're in deep work mode! The {hours} hours is your competitive advantage!",
      "Deep work champion! At {hours} hours, you're basically unaligned with the status quo, king!",
      "That's not doomscrolling — that's building a second brain, bro!"
    ],
    spiralSessions: [
      "{velocity} px/sec? Bro, you're achieving terminal velocity in content consumption!",
      "At {velocity} px/sec, you're basically speedrunning information absorption!",
      "That's hypergrowth in content ingestion! The market cap is going up, bro!"
    ]
  },
  accountant: {
    peakTabs: [
      "That's {count} tabs. At your hourly rate of $0, that's $0 in potential productivity lost. Not that much. Carry on.",
      "I've seen worse. {count} tabs is actually below the median for your demographic.",
      "Opening {count} tabs doesn't cost money, but the cognitive load is approximately 0.2 hours of productivity loss. I'll let you decide if that's worth it.",
      "At scale, {count} tabs represents approximately $0 in billable time, but emotional cost is immeasurable. Let the record show this.",
      "Tab count: {count}. Financial impact: None. Psychological impact: Significant but unquantifiable. Proceed."
    ],
    nightSessions: [
      "You were online at {time}. That hour has a different tax classification, so I'll allow it.",
      "{time} usage is technically within the billable hours but outside the recommended human operating window.",
      "Night sessions don't generate interest, but they do compound. At your current rate, by Friday you'll have significant sleep debt.",
      "At {time}, you're in the amortization period of your day. Best to close out the tab.",
      "{time} is outside business hours, so technically, no economic activity is expected. Yet here we are."
    ],
    quickClosures: [
      "You opened {count} tabs and closed them within 60 seconds. That's a 100% churn rate. Not great for retention.",
      "Short engagement windows aren't measured in your KPIs, but I can see them. {count} closures in 60 seconds is notable.",
      "Tab bounce rate: 100%. User didn't convert on any of the {count} landing pages. That's not a funnel, that's a leak.",
      "Quick closures are actually non-billable. Time spent: {count} tabs × 0.01 hours = negligible. But the pattern is concerning.",
      "{count} tabs opened, {count} tabs closed. Mathematically, net change: zero. Emotionally, I can't compute that yet."
    ],
    longSessions: [
      "{hours} hours is a significant time allocation. I'll mark this as 'focused activity' on your timesheet, but note the opportunity cost.",
      "At {hours} hours of continuous engagement, you've exceeded the recommended daily session length by about {hours - 4} hours. That's billable time to burnout.",
      "Continuous usage for {hours} hours doesn't qualify as overtime because it's not technically work. You can tell your manager that.",
      "{hours} hours... I'm required to note that this exceeds OSHA guidelines for screen time, but we're not in an OSHA-compliant environment."
    ],
    spiralSessions: [
      "Your scroll velocity of {velocity} px/sec is actually an efficient information extraction rate. At that speed, you're consuming approximately $0.03 worth of content per minute.",
      "{velocity} px/sec is not a bug — it's a feature, from an optimization perspective. Throughput is up.",
      "At {velocity} px/sec, you're basically speed-running the internet. I can calculate the bandwidth cost if you'd like."
    ]
  }
};

export function getRandomRoast(pool: string[]): string {
  if (pool.length === 0) return '';
  return pool[Math.floor(Math.random() * pool.length)];
}

export function formatRoast(template: string, stats: {
  peakTabs?: number;
  quickClosures?: number;
  time?: string;
  hours?: number;
  velocity?: number;
}): string {
  return template
    .replace('{count}', String(stats.peakTabs || stats.quickClosures || 0))
    .replace('{time}', stats.time || '1:47am')
    .replace('{hours}', String(stats.hours || 6))
    .replace('{velocity}', String(stats.velocity || 1200));
}

export async function getAllowedVoice(savedVoiceSetting?: string): Promise<RoastVoice> {
  const pro = await isPro();
  const allowedVoices = pro ? PRO_VOICES : FREE_VOICES;

  // Check user's saved preference if provided
  if (savedVoiceSetting && allowedVoices.includes(savedVoiceSetting as RoastVoice)) {
    return savedVoiceSetting as RoastVoice;
  }

  // Fallback to random voice from allowed voices
  return allowedVoices[Math.floor(Math.random() * allowedVoices.length)];
}

export async function getAllowedVoices(): Promise<RoastVoice[]> {
  const pro = await isPro();
  return pro ? PRO_VOICES : FREE_VOICES;
}