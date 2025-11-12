
export interface Article {
  id: number;
  title: string;
  url: string;
  source_name: string;
  topic: string;
  published_at: string; 
  generic_news: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Journal {
  id: number;
  name: string;
  rss: string;
  url: string;
  users: User[];
  articles: Article[];
}