export interface Lesson {
  uuid: string;
  title: string;
  description: string;
  linkVideo: string;
  content: string;
  matterUuid: string;
  thumbnail?: string;
}
  
  export interface ChatRequest {
    solicitacao: string;
    clienteInfo: string;
  }
  
  export interface ChatResponse {
    response: string;
  }