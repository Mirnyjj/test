export interface FormData {
    input?: string;
    type: 'user' | 'repo';
  }
  
  export interface UserData {
    login: string;
    public_repos: number;
  }
  
  export interface RepoData {
    full_name: string;
    stargazers_count: number;
  }
  