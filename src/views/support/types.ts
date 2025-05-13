export interface Article {
    id: string;
    category: string;
    title: string;
    content?: string;
    timeToRead: number;
    viewCount: number;
    commentCount: number;
  }
  
  export interface Topic {
    id: string;
    name: string;
    description: string;
    articleCounts: number;
  }
  
  export interface Category {
    name: string;
    topics: Topic[];
  }
  
  export interface GetSupportHubCategoriesResponse {
    categories: Category[];
    popularArticles: Article[];
  }
  
  export interface GetSupportHubArticlesResponse extends Array<Article> {}
  
  export interface GetSupportHubArticleDetailsResponse extends Article {
    content: string;
  }