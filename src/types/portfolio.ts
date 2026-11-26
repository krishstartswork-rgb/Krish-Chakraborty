export type RoutePath =
  | '/'
  | '/work'
  | `/work/${string}`
  | '/about'
  | '/experiments'
  | '/contact'
  | '/resume';

export type ProjectCategory =
  | 'All'
  | 'Brand & Growth'
  | 'Entrepreneurship'
  | 'Other Projects'
  | 'Content & Experiments';

export type CharacterMode = 'strategist' | 'creative' | 'campaigns' | 'founder';

export interface AssetSlotSpec {
  slotId: string;
  title: string;
  subtitle: string;
  aspect: '16:9' | '4:3' | '1:1' | '3:4';
  section: string;
  mediumTag?: string;
}

export interface CampaignTrack {
  id: string;
  label: string;
  medium: string;
  brief: string;
  insight: string;
  idea: string;
  execution: string;
  output: string;
  slot: AssetSlotSpec;
}

export interface AgencyPhase {
  phase: string;
  title: string;
  summary: string;
  realityCheck: string;
}

export interface WorkflowStep {
  step: string;
  role: string;
  detail: string;
}

export interface ProjectTestimonial {
  author: string;
  role: string;
  shortQuote: string;
  fullParagraphs: string[];
}

export interface ProjectItem {
  id: string;
  number: string;
  slug: string;
  name: string;
  category: string;
  filterGroup: Exclude<ProjectCategory, 'All'>;
  title: string;
  role?: string;
  period: string;
  summary: string;
  wittyNote?: string;
  testimonial?: ProjectTestimonial;
  coverSlot: AssetSlotSpec;
  verifiedHighlights?: string[];
  responsibilities?: string[];
  pillars?: string[];
  gallerySlots: AssetSlotSpec[];
  digitalVsTraditional?: {
    digital: { label: string; items: string[]; slot: AssetSlotSpec }[];
    traditional: { label: string; items: string[]; slot: AssetSlotSpec }[];
  };
  campaignTracks?: CampaignTrack[];
  agencyTimeline?: AgencyPhase[];
  teamWorkflow?: WorkflowStep[];
}

export interface TimelineEntry {
  period: string;
  title: string;
  organization: string;
  summary: string;
  tag: string;
}

export interface LeadershipRole {
  id: string;
  role: string;
  organization: string;
  focus: string;
  slot: AssetSlotSpec;
}

export interface AwardItem {
  id: string;
  rank: string;
  event: string;
  institution: string;
  scope?: string;
  note?: string;
  slot: AssetSlotSpec;
}

export interface EducationItem {
  institution: string;
  degree: string;
  period: string;
  detail: string;
}

export interface CapabilityGroup {
  title: string;
  items: string[];
}
