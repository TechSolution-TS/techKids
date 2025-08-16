export interface User {
    token: string;
    userUuid: string;
    name: string;
    user: string;
  }
  
  export interface LoginRequest {
    username: string;
    password: string;
  }