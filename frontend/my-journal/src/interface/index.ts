
export interface Article {
  id: number;
  title: string;
  url: string;
  published_at: string;
  topic: string | null;
  summary: string | null; 
  author: string | null; 
  image_url: string | null; 
  downloaded_at: string; 
  generic_news: boolean | null; 
  user_id: number | null; 
  journal_id: number;

  
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string | null; 
  last_name: string | null; 
  created_at: string; 
  is_active: boolean;
  is_admin: boolean;
  articles: Article[]; 
  journals: Journal[];
  newsletter_opt_in?: boolean;
}


export interface Journal {
  id: number;
  name: string;
  rss: string;
  url: string;
  users: User[];
  articles: Article[];
}