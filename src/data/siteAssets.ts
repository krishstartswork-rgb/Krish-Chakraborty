import siteAssetsData from './siteAssetsData.json';

export interface StaticSlotMedia {
  /** Permanent public path inside public/, e.g. '/assets/portfolio/altdrx-cover.jpg' */
  imageUrl?: string;
  /** External project/post URL displayed underneath the card */
  linkUrl?: string;
  /** Optional short label for the link bar */
  linkLabel?: string;
}

export interface SiteExperimentsConfig {
  notesTitle: string;
  notesText: string;
  hasCustomNotes: boolean;
  reelVideoUrl: string;
  reelExternalUrl: string;
}

/**
 * Permanent, deploy-safe media manifest for all portfolio image & link slots.
 * Files placed in `public/assets/portfolio/` are served at `/assets/portfolio/...`
 * on Vercel and visible to every visitor including incognito browsers.
 */
export const SITE_MEDIA_ASSETS: Record<string, StaticSlotMedia> =
  siteAssetsData.assets as Record<string, StaticSlotMedia>;

export const SITE_EXPERIMENTS_CONFIG: SiteExperimentsConfig =
  siteAssetsData.experiments as SiteExperimentsConfig;
