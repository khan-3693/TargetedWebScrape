export interface AnalysisPoint {
  point: string;
  searchQuery?: string;
  references: Array<{
    url: string;
    title: string;
  }>;
}

export interface SocialMediaPost {
  id: string;
  content: string;
  category: 'comedic' | 'serious';
}

export interface SocialMediaPosts {
  comedic: SocialMediaPost[];
  serious: SocialMediaPost[];
}

export interface Scrape {
  id: string;
  url: string;
  keyword: string | null;
  status: 'pending' | 'completed' | 'failed';
  content: string | null;
  scraped_content: string | null;
  title: string | null;
  url_summary: string | null;
  origin_analysis: string | null;
  trends_analysis: string | null;
  social_media_posts: string | null;
  reference_links: any;
  error: string | null;
  created_at: string;
  completed_at: string | null;
  user_id: string | null;
}
