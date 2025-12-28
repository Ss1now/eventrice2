export type College =
  | "Baker"
  | "Will Rice"
  | "Hanszen"
  | "Jones"
  | "Martel"
  | "McMurtry"
  | "Sid Richardson"
  | "Brown"
  | "Duncan"
  | "Lovett";

export type Host = {
  id: string;
  name: string;
  college: College;
  avatar?: string; // URL
  instagram?: string;
  phone?: string;
  verified: boolean;
  hostScore: number; // computed
};

export type ServiceNeed = "DJ" | "Photographer" | "Bartender" | "Door/Check-in" | "Cleanup" | "Security" | "Caregiver/Designated Driver";

export type ReservationMode = "Open" | "Reservation Required";

export type EventRating = {
  userId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  vibe: 1 | 2 | 3 | 4 | 5;
  safety: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt: string; // ISO
};

export type PartyEvent = {
  id: string;
  title: string;
  description?: string;
  location: string;
  startAt: string; // ISO
  endAt: string;   // ISO
  dressCode?: string;
  theme?: string;
  whatToBring?: string[];
  servicesHiring?: ServiceNeed[];
  reservationMode: ReservationMode;
  capacity?: number;
  reservedCount: number;
  hostId: string;
  createdAt: string;
  ratings: EventRating[];
};

export type ConnectionType =
  | "Find a +1"
  | "Study Buddy"
  | "Gym Partner"
  | "Ride Share"
  | "Band / Jam"
  | "Startup Co-founder"
  | "Roommate / Sublet"
  | "Club / Org Friends"
  | "Just vibe";

export type ConnectionPost = {
  id: string;
  title: string;
  type: ConnectionType;
  body: string;
  authorId: string;
  createdAt: string;
  interestedUserIds: string[];
};

export type DMThread = {
  id: string;
  userA: string;
  userB: string;
  messages: { id: string; from: string; text: string; createdAt: string }[];
};
