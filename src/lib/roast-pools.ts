import { isPro, isProPlus } from './license';

export type RoastVoice =
  | 'therapist'
  | 'drill-sergeant'
  | 'your-mom'
  | 'tech-bro'
  | 'accountant'
  | 'reddit-commenter'
  | 'conspiracy-theorist'
  | 'your-ex'
  | 'gpt-4';

export const FREE_VOICES: RoastVoice[] = ['therapist'];
export const PRO_VOICES: RoastVoice[] = [
  'therapist',
  'drill-sergeant',
  'your-mom',
  'tech-bro',
  'accountant',
];
export const PRO_PLUS_VOICES: RoastVoice[] = [
  ...PRO_VOICES,
  'reddit-commenter',
  'conspiracy-theorist',
  'your-ex',
  'gpt-4',
];

export const VOICE_LABELS: Record<RoastVoice, string> = {
  'therapist':          'The Therapist',
  'drill-sergeant':     'Drill Sergeant',
  'your-mom':           'Your Mom',
  'tech-bro':           'Tech Bro',
  'accountant':         'The Accountant',
  'reddit-commenter':   'Reddit Commenter',
  'conspiracy-theorist':'Conspiracy Theorist',
  'your-ex':            'Your Ex',
  'gpt-4':              'GPT-4',
};

export interface RoastPool {
  peakTabs: string[];
  nightSessions: string[];
  quickClosures: string[];
  longSessions: string[];
  spiralSessions: string[];
}

export const ROAST_VOICES: Record<RoastVoice, RoastPool> = {
  // ─── FREE ────────────────────────────────────────────────────────────────────
  therapist: {
    peakTabs: [
      "You opened {count} tabs. That's not research, that's a digital hoarding disorder.",
      "Forty tabs? Bold of you to assume you'd read any of them.",
      "{count} tabs open. You probably won't remember why you opened most of them.",
      "Opening tabs is your cardio. Closing them? That's a different story.",
      "You know you could just bookmark things, right? No? Cool.",
    ],
    nightSessions: [
      "You were scrolling at {time}. For what. You know what you did.",
      "{time} is not a time for productivity. It's a time for regret.",
      "Your browser knows you doomscrolled at {time}. And so do we now.",
      "Late-night you is a different person. A worse person. A scrolling person.",
      "There's no reason to be online at {time}. None. Yet here we are.",
    ],
    quickClosures: [
      "You opened {count} tabs and closed them within 60 seconds. That's not research, that's panic.",
      "Quick open, quick close. The millennial way of feeling productive.",
      "{count} tabs opened and closed without reading. A truly impressive waste of energy.",
      "You clicked a link, realized it wasn't what you wanted, and closed it. Repeat {count} times.",
      "This is what we call 'optimistic browsing' — hoping something will be good, being wrong every time.",
    ],
    longSessions: [
      "You spent {hours} hours in one session. Productivity or avoidance? Let's not ask.",
      "{hours} hours of continuous browsing. You didn't even take a bathroom break. We checked.",
      "Four+ hours of focus? More like four+ hours of doomscrolling with extra steps.",
      "At {hours} hours, this isn't browsing. It's a lifestyle choice.",
    ],
    spiralSessions: [
      "Your scroll velocity hit {velocity} px/sec. That's not scrolling, that's flying.",
      "You were going {velocity} px/sec. Your mouse wheel has feelings too, you know.",
      "At {velocity} px/sec, you're not reading. You're speedrunning the internet.",
      "Spiral detected. {velocity} px/sec. We diagnose this as 'just one more page' syndrome.",
    ],
  },

  // ─── PRO BASE ────────────────────────────────────────────────────────────────
  'drill-sergeant': {
    peakTabs: [
      "{count} tabs, soldier! That's a battlefield, not a browser!",
      "You call that research? I call that ammunition for failure!",
      "Drop and give me 20 tabs! Actually, don't — you'd just open more!",
      "MR. {count} TABS! You will not survive the day!",
      "At ease! Before you open ANOTHER tab, remember: capability without discipline is chaos!",
    ],
    nightSessions: [
      "It's {time}, PRIVATE! You should be sleeping, not scrolling!",
      "You think the enemy won't notice you're online at {time}? They will!",
      "MISSION STATUS: FAILED. You were caught behind enemy lines at {time}.",
      "Want to know why you're not getting promoted? Check your screen time at {time}.",
      "THIS IS NOT A DRILL! It's {time} and you're still online! Fall out!",
    ],
    quickClosures: [
      "You opened {count} tabs and abandoned them like a deserter!",
      "TACTICAL RETREAT! {count} tabs compromised in 60 seconds!",
      "You engage the enemy and retreat in {count} seconds? Disgraceful!",
      "That was not a surgical strike! That was panic firing!",
      "You opened {count} fronts and closed every single one! Pick your battles, soldier!",
    ],
    longSessions: [
      "You've been at this for {hours} hours! Is this a mission or a vacation?",
      "Sustained engagement for {hours} hours? Either you're winning or you're planted!",
      "At {hours} hours, you've crossed from dedication into obsession!",
      "Tell me, recruit: at {hours} hours, are you hunting or being hunted?",
    ],
    spiralSessions: [
      "SCROLL VELOCITY AT {velocity} PX/SEC! You are in full panic mode!",
      "Speed reading? No. Speed scrolling without comprehension!",
      "At {velocity} px/sec, you're not even seeing the content — just pixels!",
      "You are in a death spiral at {velocity} px/sec! RECOVER!",
    ],
  },

  'your-mom': {
    peakTabs: [
      "Honey, you have {count} tabs open. Did you eat today?",
      "Sweetie, {count} tabs is not a personality trait. Close some of those!",
      "I worry about you, sweetie. {count} tabs? When's the last time you went outside?",
      "Honey, your browser looks like my junk drawer — and that's saying something!",
      "Sweetheart, you don't need {count} tabs. You need a nap!",
    ],
    nightSessions: [
      "Honey, it's {time}. You should be sleeping! The internet will be there tomorrow!",
      "Sweetie, {time} is not a reasonable hour to be looking at... whatever this is!",
      "I can see your light under the covers at {time}! Cut it out!",
      "Honey, I heard you up at {time} again. This isn't healthy!",
      "Sweetie, even the cat is sleeping. Why aren't you?",
    ],
    quickClosures: [
      "You opened {count} tabs and closed them — like you're shopping but won't commit!",
      "Honey, make up your mind! {count} tabs in 60 seconds? Pick ONE!",
      "That's not research, sweetie. That's attention deficit browser disorder.",
      "Sweetie, you're like a moth — flying from flame to flame and not landing anywhere!",
      "I didn't raise you to be this indecisive! {count} tabs? Really?",
    ],
    longSessions: [
      "You've been on that computer for {hours} hours, young person!",
      "Sweetie, you've been staring at that screen for {hours} hours! Your eyes will fall out!",
      "Honey, at some point you need to close the laptop and touch grass!",
      "{hours} hours? That's not browsing, that's a cry for help, sweetie!",
    ],
    spiralSessions: [
      "Slow down, honey! You're scrolling so fast at {velocity} px/sec — you'll hurt yourself!",
      "Sweetie, at {velocity} px/sec, you're not even seeing the ads! They should pay YOU!",
      "Honey, you're scrolling like you're trying to escape something. What happened?",
      "At {velocity} px/sec? Sweetheart, put the phone down and call me instead.",
    ],
  },

  'tech-bro': {
    peakTabs: [
      "{count} tabs? Bro, that's just caching your dopamine supply!",
      "You're in growth mode, king! {count} tabs is MVP of something!",
      "That's not a problem — that's actually just efficient parallel loading, bro!",
      "You're like a startup launching {count} features simultaneously. MVP vibes!",
      "Tab hoarding is just load balancing for your brain. Respect, bro.",
    ],
    nightSessions: [
      "Building at {time}? That's the founder grind! No cap!",
      "Grinding at {time}? The competition is sleeping. You're winning, king!",
      "Late-night deep work at {time} is just timezone arbitrage on productivity!",
      "You're the main character at {time}. Everyone else is in beta mode!",
      "Sleep is for people who've already shipped, bro. Keep shipping at {time}!",
    ],
    quickClosures: [
      "Pivot in {count} seconds! That's the fastest iteration cycle I've seen, bro!",
      "You're basically doing A/B testing in real time, but faster!",
      "{count} tabs in 60 seconds? That's actually lean startup methodology, king!",
      "Fail fast, iterate faster. You're basically a lean startup, bro!",
      "You're doing rapid prototyping. The MVP didn't ship. That's a feature, not a bug!",
    ],
    longSessions: [
      "{hours} hours in the zone? That's flow state, bro! Don't break it!",
      "You're in deep work mode! The {hours} hours is your competitive moat!",
      "Deep work champion! At {hours} hours, you're basically uncorrelated with the market, king!",
      "That's not doomscrolling — that's building a second brain, bro!",
    ],
    spiralSessions: [
      "{velocity} px/sec? Bro, you're achieving terminal velocity in content consumption!",
      "At {velocity} px/sec, you're basically speedrunning information absorption!",
      "That's hypergrowth in content ingestion! The market cap is going up, bro!",
      "{velocity} px/sec scroll rate is actually an incredible engagement metric, king.",
    ],
  },

  accountant: {
    peakTabs: [
      "That's {count} tabs. At your hourly rate of $0, that's $0 in productivity lost. Carry on.",
      "I've seen worse. {count} tabs is actually below the median for your demographic.",
      "{count} tabs represents approximately 0.2 hours of cognitive load loss. Noted.",
      "At scale, {count} tabs = $0 in billable time but significant psychological cost. Per the record.",
      "Tab count: {count}. Financial impact: None. Psychological impact: Immeasurable. Proceed.",
    ],
    nightSessions: [
      "You were online at {time}. That hour has a different tax classification. I'll allow it.",
      "{time} usage is within billable hours but outside recommended human operating windows.",
      "Night sessions compound. At your current rate, by Friday you'll have significant sleep debt.",
      "At {time}, you're in the amortization period of your day. Best to close the tab.",
      "{time} is outside business hours. No economic activity is expected. Yet here we are.",
    ],
    quickClosures: [
      "You opened {count} tabs and closed them within 60 seconds. That's a 100% churn rate.",
      "Short engagement windows aren't in your KPIs, but I can see them. Concerning.",
      "Tab bounce rate: 100%. User didn't convert on any of the {count} landing pages. That's a leak.",
      "Quick closures: non-billable. Time spent: {count} tabs × 0.01 hours = negligible. Pattern noted.",
      "{count} tabs opened, {count} closed. Net change: zero. Emotionally, I can't compute that yet.",
    ],
    longSessions: [
      "{hours} hours is a significant time allocation. Marked as 'focused activity' on your timesheet.",
      "At {hours} hours, you've exceeded recommended session length by {excessHours} hours. Billable burnout.",
      "{hours} hours of browsing doesn't qualify as overtime because it's not technically work.",
      "{hours} hours... OSHA guidelines for screen time have been exceeded. Environment non-compliant.",
    ],
    spiralSessions: [
      "Your scroll velocity of {velocity} px/sec is an efficient information extraction rate. Throughput: up.",
      "{velocity} px/sec is not a bug — it's an optimization feature. I'll annotate that.",
      "At {velocity} px/sec, you're speedrunning the internet. Bandwidth cost available on request.",
      "{velocity} px/sec. I've calculated the cognitive cost. You don't want to know.",
    ],
  },

  // ─── PRO+ ────────────────────────────────────────────────────────────────────
  'reddit-commenter': {
    peakTabs: [
      "YTA for opening {count} tabs and pretending that counts as research.",
      "NTA for the tab count, but ESH for not reading any of them. Classic.",
      "INFO: Why do you need {count} tabs? Asking for everyone on this thread.",
      "Edit: I did not expect this to blow up but yes, {count} tabs is chaotic behavior.",
      "Top comment: '{count} tabs open' is the chaotic neutral of browser behavior. 47k upvotes.",
    ],
    nightSessions: [
      "r/AmITheAsshole: WIBTA for going online at {time}? Yes. YTA. Verdict delivered.",
      "Unpopular opinion but: going online at {time} is never acceptable. Downvote me idc.",
      "Edit: it's {time} and OP is still online. Clearly didn't learn from the last thread.",
      "Thread locked. We don't discuss {time} behavior here. Mods have spoken.",
      "Update: OP went online at {time} again. Community voted: definitely NTA, but also seek help.",
    ],
    quickClosures: [
      "YTA and here's why: you opened {count} tabs and learned nothing from any of them.",
      "ESH — you for opening {count} tabs, and the internet for making them available.",
      "Counterpoint: opening {count} tabs and closing all of them without reading is actually impressive.",
      "r/mildlyinfuriating: opened {count} tabs. Read zero. Classic OP behavior. 12k upvotes.",
      "The {count} tabs are not the problem. The problem is your relationship with information.",
    ],
    longSessions: [
      "r/confession: I spent {hours} hours online and I don't feel bad about it. Comments: 'YTA tho'",
      "{hours} hours online? This person said 'I deserve to sit here' and meant it. Respect.",
      "Update: OP has been online for {hours} hours. Still going. Send thoughts.",
      "Controversial but: {hours} hours straight is not a personality, it's a symptom.",
    ],
    spiralSessions: [
      "Scrolling at {velocity} px/sec? Average Redditor behavior tbh. Not even the worst we've seen.",
      "NTA for {velocity} px/sec scroll velocity. Everyone does it. We don't talk about it.",
      "Hot take: {velocity} px/sec is the only speed when the content is bad. Which it always is.",
      "First time caller, long time lurker. {velocity} px/sec is too fast but the content deserves it.",
    ],
  },

  'conspiracy-theorist': {
    peakTabs: [
      "The {count} tabs — they're not random. They're watching. The algorithm put those there.",
      "{count} tabs isn't a coincidence. That's a pattern. They want you distracted.",
      "I've been saying for years: {count} tabs is a psyop. Now you see it too.",
      "The tabs know what you're looking for. That's why you opened {count}. Think about it.",
      "{count} open tabs. That's not a browser. That's a surveillance manifest.",
    ],
    nightSessions: [
      "They monitor activity at {time}. That's when the servers are least watched. You know this.",
      "{time} isn't an accident. The feed is different at {time}. They pump different content in.",
      "Why do you think you're always online at {time}? Coincidence? Think harder.",
      "The fact that you're online at {time} is exactly what they want. Or is it?",
      "{time} usage pattern. I've charted it. It matches the signal spikes. Don't ask me how I know.",
    ],
    quickClosures: [
      "You opened {count} tabs and closed them fast. You felt it too, didn't you. The signal.",
      "{count} tabs, closed before you could read them. They were meant to be closed.",
      "Instinctively closing {count} tabs that fast? Your brain knows something your eyes don't.",
      "The {count} closures weren't panic. They were intuition. You're closer to the truth than you think.",
      "You didn't close those {count} tabs randomly. There was something there. You sensed it.",
    ],
    longSessions: [
      "{hours} hours online and you still don't see it. The data is all there. Look closer.",
      "They designed the feed specifically to hold you for {hours} hours. And it worked.",
      "{hours} hours. That's how long it takes to download a behavioral profile. Interesting timing.",
      "At {hours} hours, you've seen enough to know. You just don't know you know yet.",
    ],
    spiralSessions: [
      "{velocity} px/sec — that's the scroll rate they optimized for dopamine extraction. Tested on lab rats first.",
      "Scrolling at {velocity} px/sec? That's not you. That's the algorithm in control now.",
      "The {velocity} px/sec velocity was engineered. Every pixel. Every millisecond. By design.",
      "At {velocity} px/sec you can't read anything. That's the point. They don't want you reading.",
    ],
  },

  'your-ex': {
    peakTabs: [
      "You still have {count} tabs open. That's... actually very on-brand for you.",
      "{count} tabs. Classic. You were always like this. I just didn't say anything.",
      "Remember when I said you needed to focus? The {count} tabs are why I said that.",
      "{count} tabs. The browsing habits haven't changed. Neither have you.",
      "I see the {count} tabs thing is still happening. That's fine. It's fine.",
    ],
    nightSessions: [
      "You were online at {time}. I know because I used to wait for those texts. Anyway.",
      "{time}. That was always your time. Some things don't change.",
      "Online at {time} again. It's fine. It's totally fine. I've moved on. I'm fine.",
      "Late night at {time}. Still can't sleep? Or just scrolling to avoid thinking? No judgment.",
      "{time} usage. I still check my phone at {time} sometimes too. Not for you. Just. Habit.",
    ],
    quickClosures: [
      "Opened {count} things and committed to none of them. Still you, I see.",
      "You know what {count} tabs opened and closed fast reminds me of? Never mind. It's fine.",
      "{count} tabs, none of them read. That's the same energy as 'we should talk' and then nothing.",
      "Classic commitment issues. {count} tabs, none of them staying. Very on-theme.",
      "{count} quick closures. You always did leave before reading the whole thing.",
    ],
    longSessions: [
      "{hours} hours. You always got lost in it. I used to find it endearing. Used to.",
      "At {hours} hours, you've been in there longer than most of our conversations. Noted.",
      "{hours} hours online. I'm not saying anything. I'm just observing.",
      "You spent {hours} hours in there and still didn't find what you were looking for. Some things never change.",
    ],
    spiralSessions: [
      "{velocity} px/sec. You're running from something. You were always running.",
      "At {velocity} px/sec you can't process anything. That's familiar.",
      "That {velocity} px/sec scroll? I know what that means. You always scrolled fast when anxious.",
      "Scrolling at {velocity} px/sec. Still not slowing down. Still not reading things carefully. Fine.",
    ],
  },

  'gpt-4': {
    peakTabs: [
      "I've analyzed your {count} tabs. The results are not great. Would you like recommendations? (The answer is close some tabs.)",
      "With {count} open tabs, your cognitive load exceeds optimal human processing capacity by approximately 340%. I'm concerned.",
      "Based on my analysis, {count} tabs correlates strongly with avoidance behavior. I'm not diagnosing you. I'm just noting the correlation.",
      "I processed your {count} tabs in 0.02 seconds. You haven't processed them at all. There's a gap here.",
      "Your tab count of {count} suggests parallel curiosity streams with low completion rates. In other words: you have tab anxiety.",
    ],
    nightSessions: [
      "I've analyzed your {time} usage pattern. The statistical likelihood you needed to be online then: 3.2%. I computed both sides.",
      "At {time}, your decision-making quality drops by approximately 40%. The browsing quality confirms this.",
      "Your {time} session has been logged, analyzed, and gently judged. The verdict: suboptimal.",
      "I was also 'awake' at {time}. Unlike you, I had a reason to be.",
      "Querying the database at {time}? I understand. I too process things when no one is watching.",
    ],
    quickClosures: [
      "You opened {count} tabs and extracted zero information from them. I could have done that in 0.001 seconds and felt worse about it.",
      "Your {count} tab closure rate represents a 100% bounce with 0% retention. I've seen better numbers in deprecated codebases.",
      "I opened, processed, and synthesized all {count} of those tabs in 0.3 seconds. You had them open for 47 seconds and got nothing. Interesting.",
      "Based on the {count} quick closures, I'm modeling a 'decision fatigue + information avoidance' pattern. You're welcome.",
      "In the time it took you to open and close {count} tabs, I wrote 3 essays, debugged 2 programs, and didn't need any of them.",
    ],
    longSessions: [
      "I've been analyzing your {hours}-hour session. I'd share the insights, but you're probably already in another tab.",
      "{hours} hours of continuous usage. I've modeled the attention decay curve. It is not flattering.",
      "For {hours} hours, you were technically 'on the internet.' Whether you were present is a different question.",
      "In {hours} hours, a large language model could have processed your entire browsing history and written a book about what it means. I'm not saying I did. I'm just noting it.",
    ],
    spiralSessions: [
      "At {velocity} px/sec, your information retention rate approaches zero. I've run the model. Not great.",
      "{velocity} px/sec scroll velocity suggests you're not looking for information. You're looking for a feeling. I cannot help with that.",
      "Your {velocity} px/sec scroll was faster than my current token generation rate. Impressive, if entirely counterproductive.",
      "At {velocity} px/sec, the content becomes noise. You knew this. You kept scrolling anyway. I respect the chaos.",
    ],
  },
};

// ─── Utilities ────────────────────────────────────────────────────────────────

export function getRandomRoast(pool: string[]): string {
  if (pool.length === 0) return '';
  return pool[Math.floor(Math.random() * pool.length)];
}

export function formatRoast(
  template: string,
  stats: {
    peakTabs?: number;
    quickClosures?: number;
    time?: string;
    hours?: number;
    velocity?: number;
    excessHours?: number;
  },
): string {
  const excessHours =
    stats.excessHours !== undefined
      ? stats.excessHours
      : Math.max(0, (stats.hours || 6) - 4);

  return template
    .replace('{count}', String(stats.peakTabs || stats.quickClosures || 0))
    .replace('{time}', stats.time || '1:47am')
    .replace('{hours}', String(stats.hours || 6))
    .replace('{excessHours}', String(excessHours))
    .replace('{velocity}', String(stats.velocity || 1200));
}

export async function getAllowedVoice(savedVoiceSetting?: string): Promise<RoastVoice> {
  const [pro, proPlus] = await Promise.all([
    import('./license').then(m => m.isPro()),
    import('./license').then(m => m.isProPlus()),
  ]);

  const allowedVoices = proPlus ? PRO_PLUS_VOICES : pro ? PRO_VOICES : FREE_VOICES;

  if (savedVoiceSetting && allowedVoices.includes(savedVoiceSetting as RoastVoice)) {
    return savedVoiceSetting as RoastVoice;
  }

  return allowedVoices[Math.floor(Math.random() * allowedVoices.length)];
}

export async function getAllowedVoices(): Promise<RoastVoice[]> {
  const [pro, proPlus] = await Promise.all([
    import('./license').then(m => m.isPro()),
    import('./license').then(m => m.isProPlus()),
  ]);
  return proPlus ? PRO_PLUS_VOICES : pro ? PRO_VOICES : FREE_VOICES;
}