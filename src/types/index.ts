export interface PostImage {
  thumb: string;
  full: string;
}

export interface Post {
  id: string;
  type: 'single' | 'carousel';
  images: PostImage[];
  caption: string;
  likes: number;
  timestamp: string;
}