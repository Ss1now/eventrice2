import type { College, ConnectionPost, DMThread, Host, PartyEvent, ServiceNeed } from "@/lib/types";
import { clamp } from "@/lib/utils";

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export const colleges: College[] = [
  "Baker","Will Rice","Hanszen","Jones","Martel","McMurtry","Sid Richardson","Brown","Duncan","Lovett"
];

export function computeEventScore(avgStars: number, avgVibe: number, avgSafety: number, nRatings: number) {
  // 0..100 event quality
  const weighted = (avgStars * 0.5 + avgVibe * 0.3 + avgSafety * 0.2); // 1..5 scale
  const base = ((weighted - 1) / 4) * 100;
  // confidence factor: more ratings => more reliable
  const confidence = 1 - Math.exp(-nRatings / 8); // asymptote -> 1
  return clamp(base * (0.65 + 0.35 * confidence), 0, 100);
}

export function computeHostScore(eventsHosted: PartyEvent[]) {
  // Host score favors consistency + volume, but prevents spam:
  // HostScore = 0.7 * avg(EventScore) + 0.3 * VolumeBonus
  // VolumeBonus = 100*(1-exp(-events/6))
  const eventScores = eventsHosted.map((e) => {
    const n = e.ratings.length;
    if (n === 0) return 70; // neutral if no ratings yet
    const avg = (arr: number[]) => arr.reduce((a,b)=>a+b,0) / Math.max(1, arr.length);
    const stars = avg(e.ratings.map(r=>r.stars));
    const vibe = avg(e.ratings.map(r=>r.vibe));
    const safety = avg(e.ratings.map(r=>r.safety));
    return computeEventScore(stars, vibe, safety, n);
  });
  const avgEvent = eventScores.reduce((a,b)=>a+b,0) / Math.max(1, eventScores.length);
  const volumeBonus = 100 * (1 - Math.exp(-eventsHosted.length / 6));
  return clamp(0.7 * avgEvent + 0.3 * volumeBonus, 0, 100);
}

export function computeCollegeScore(events: PartyEvent[], hosts: Host[], college: College) {
  // College score reflects party culture + reliability:
  // - Total events weight
  // - Avg host score (hosts in college)
  // - Avg event score (events hosted by college)
  const collegeHosts = hosts.filter(h => h.college === college);
  const hostAvg = collegeHosts.reduce((a,h)=>a+h.hostScore,0) / Math.max(1, collegeHosts.length);

  const collegeEvents = events.filter(e => {
    const host = hosts.find(h => h.id === e.hostId);
    return host?.college === college;
  });

  const avg = (arr: number[]) => arr.reduce((a,b)=>a+b,0) / Math.max(1, arr.length);
  const eventScores = collegeEvents.map(e => {
    const n = e.ratings.length;
    if (n === 0) return 70;
    const stars = avg(e.ratings.map(r=>r.stars));
    const vibe = avg(e.ratings.map(r=>r.vibe));
    const safety = avg(e.ratings.map(r=>r.safety));
    return computeEventScore(stars, vibe, safety, n);
  });
  const eventAvg = avg(eventScores);

  const volume = collegeEvents.length;
  const volumeScore = 100 * (1 - Math.exp(-volume / 10));

  return clamp(0.45 * eventAvg + 0.35 * hostAvg + 0.20 * volumeScore, 0, 100);
}

const commonServices: ServiceNeed[] = ["DJ","Photographer","Bartender","Door/Check-in","Cleanup","Security","Caregiver/Designated Driver"];

export const demoHosts: Host[] = [
  { id: "u_howard", name: "Howard Zhao", college: "Jones", verified: true, instagram: "@howard", hostScore: 0 },
  { id: "u_maya", name: "Maya L.", college: "Brown", verified: true, instagram: "@maya", hostScore: 0 },
  { id: "u_eli", name: "Eli K.", college: "Martel", verified: false, instagram: "@elik", hostScore: 0 },
  { id: "u_sam", name: "Sam P.", college: "Will Rice", verified: true, instagram: "@samp", hostScore: 0 }
];

const now = new Date();
const hours = (n: number) => n * 60 * 60 * 1000;
const days = (n: number) => n * 24 * 60 * 60 * 1000;

export const demoEvents: PartyEvent[] = [
  {
    id: "e_future_1",
    title: "Candlelit Rooftop: Winter Glow",
    description: "Minimal lights, maximal vibes. Bring a friend, bring a sweater.",
    location: "Jones College Rooftop",
    startAt: new Date(now.getTime() + days(2) + hours(2)).toISOString(),
    endAt: new Date(now.getTime() + days(2) + hours(5)).toISOString(),
    dressCode: "Cozy chic",
    theme: "Warm neutrals",
    whatToBring: ["ID", "A jacket", "Good energy"],
    servicesHiring: ["DJ","Door/Check-in"],
    reservationMode: "Reservation Required",
    capacity: 120,
    reservedCount: 64,
    hostId: "u_howard",
    createdAt: new Date(now.getTime() - hours(12)).toISOString(),
    ratings: []
  },
  {
    id: "e_ongoing_1",
    title: "What’s the Move: Study Break Pop-up",
    description: "Snacks + low-volume house beats. Come for 20 minutes or 2 hours.",
    location: "Fondren Library (side lounge)",
    startAt: new Date(now.getTime() - hours(1)).toISOString(),
    endAt: new Date(now.getTime() + hours(2)).toISOString(),
    dressCode: "Anything",
    theme: "Anti-stress",
    whatToBring: ["Water bottle"],
    servicesHiring: ["Cleanup"],
    reservationMode: "Open",
    capacity: 80,
    reservedCount: 0,
    hostId: "u_maya",
    createdAt: new Date(now.getTime() - days(1)).toISOString(),
    ratings: []
  },
  {
    id: "e_past_1",
    title: "Neon Kitchen: Late-night Dumpling Party",
    description: "We folded dumplings and made questionable playlists. 10/10 chaos.",
    location: "Brown College Kitchen",
    startAt: new Date(now.getTime() - days(3) - hours(3)).toISOString(),
    endAt: new Date(now.getTime() - days(3)).toISOString(),
    dressCode: "Neon accent",
    theme: "Glow snacks",
    whatToBring: ["$5 for ingredients (optional)"],
    servicesHiring: ["Photographer"],
    reservationMode: "Open",
    capacity: 60,
    reservedCount: 0,
    hostId: "u_maya",
    createdAt: new Date(now.getTime() - days(5)).toISOString(),
    ratings: [
      { userId: "u_howard", stars: 5, vibe: 5, safety: 4, comment: "Dumplings were elite.", createdAt: new Date(now.getTime() - days(3)).toISOString() },
      { userId: "u_sam", stars: 4, vibe: 5, safety: 5, comment: "Great crowd.", createdAt: new Date(now.getTime() - days(3)).toISOString() }
    ]
  },
  {
    id: "e_future_2",
    title: "Silent Disco (Headphones Provided)",
    description: "Three channels: pop, EDM, and \"guilty pleasure\".",
    location: "Martel Commons",
    startAt: new Date(now.getTime() + days(6) + hours(1)).toISOString(),
    endAt: new Date(now.getTime() + days(6) + hours(4)).toISOString(),
    dressCode: "Whatever moves",
    theme: "Pick your channel",
    whatToBring: ["ID"],
    servicesHiring: ["Security","Door/Check-in"],
    reservationMode: "Reservation Required",
    capacity: 200,
    reservedCount: 143,
    hostId: "u_eli",
    createdAt: new Date(now.getTime() - days(1)).toISOString(),
    ratings: []
  },
  {
    id: "e_past_2",
    title: "Vinyl & Cocoa Night",
    description: "Soft music, hot cocoa, and actually talking to humans.",
    location: "Will Rice Lounge",
    startAt: new Date(now.getTime() - days(9) - hours(2)).toISOString(),
    endAt: new Date(now.getTime() - days(9)).toISOString(),
    dressCode: "Comfy",
    theme: "Warm & calm",
    whatToBring: ["Mug (optional)"],
    servicesHiring: ["Cleanup"],
    reservationMode: "Open",
    capacity: 90,
    reservedCount: 0,
    hostId: "u_sam",
    createdAt: new Date(now.getTime() - days(12)).toISOString(),
    ratings: [
      { userId: "u_maya", stars: 5, vibe: 4, safety: 5, comment: "Perfect midterms reset.", createdAt: new Date(now.getTime() - days(9)).toISOString() }
    ]
  }
];

export const demoConnections: ConnectionPost[] = [
  {
    id: "c_1",
    title: "Need a +1 for Friday formal",
    type: "Find a +1",
    body: "I'm going to a formal Friday. Looking for someone chill — no pressure, just vibes and photos.",
    authorId: "u_howard",
    createdAt: new Date(now.getTime() - hours(3)).toISOString(),
    interestedUserIds: ["u_maya"]
  },
  {
    id: "c_2",
    title: "Morning gym partner (6:30am)",
    type: "Gym Partner",
    body: "Trying to stay consistent. We can keep it quiet and just hold each other accountable.",
    authorId: "u_sam",
    createdAt: new Date(now.getTime() - days(1)).toISOString(),
    interestedUserIds: []
  },
  {
    id: "c_3",
    title: "Ride share to HEB on Sunday",
    type: "Ride Share",
    body: "Splitting an Uber. 2-3 people max. We'll be efficient.",
    authorId: "u_maya",
    createdAt: new Date(now.getTime() - hours(10)).toISOString(),
    interestedUserIds: ["u_howard", "u_eli"]
  }
];

export const demoDMs: DMThread[] = [
  {
    id: "dm_1",
    userA: "u_howard",
    userB: "u_maya",
    messages: [
      { id: uid("m"), from: "u_maya", text: "Interested! What time are you thinking?", createdAt: new Date(now.getTime() - hours(2)).toISOString() },
      { id: uid("m"), from: "u_howard", text: "Probably around 9. Want to meet at the commons?", createdAt: new Date(now.getTime() - hours(2) + 1000*60*7).toISOString() }
    ]
  }
];

// Mutate hostScore based on events
export function deriveHostsWithScores(events: PartyEvent[], hosts: Host[]): Host[] {
  return hosts.map(h => {
    const hosted = events.filter(e => e.hostId === h.id);
    const hostScore = computeHostScore(hosted);
    return { ...h, hostScore };
  });
}

export function deriveReservedLabel(mode: "Open" | "Reservation Required", reservedCount: number, capacity?: number) {
  if (mode === "Open") return "Open — walk in";
  if (!capacity) return `${reservedCount} reserved`;
  return `${reservedCount}/${capacity} reserved`;
}

export function splitEventsByTime(events: PartyEvent[], now = new Date()) {
  const past: PartyEvent[] = [];
  const ongoing: PartyEvent[] = [];
  const future: PartyEvent[] = [];

  for (const e of events) {
    const start = new Date(e.startAt).getTime();
    const end = new Date(e.endAt).getTime();
    const t = now.getTime();

    if (t < start) future.push(e);
    else if (t >= start && t <= end) ongoing.push(e);
    else past.push(e);
  }

  // Sort
  future.sort((a,b)=> new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  ongoing.sort((a,b)=> new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  past.sort((a,b)=> new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

  return { past, ongoing, future };
}
