import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { ChatRequest } from '../../interfaces/lesson';

interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-ai.component.html',
  styleUrls: ['./chat-ai.component.scss']
})
export class ChatAiComponent implements OnInit {
  @Input() lessonContent: string = '';
  @Input() userName: string = '';
  @Input() isExpanded: boolean = false;
  @Output() toggleExpanded = new EventEmitter<void>();
  @Output() closeChat = new EventEmitter<void>();
  
  messages: ChatMessage[] = [];
  currentMessage = '';
  isLoading = false;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.messages.push({
      content: `Olá ${this.userName}! 👋 Sou seu professor virtual! Estou aqui para te ajudar com qualquer dúvida sobre esta aula. Pode perguntar o que quiser! 😊`,
      isUser: false,
      timestamp: new Date()
    });
  }

  sendMessage(): void {
    if (!this.currentMessage.trim() || this.isLoading) return;

    this.messages.push({
      content: this.currentMessage,
      isUser: true,
      timestamp: new Date()
    });

    const userMessage = this.currentMessage;
    this.currentMessage = '';
    this.isLoading = true;

    const chatRequest: ChatRequest = {
      solicitacao: userMessage,
      clienteInfo: `nome: ${this.userName}, conteudo da aula: ${this.lessonContent}`
    };

    this.chatService.sendMessage(chatRequest).subscribe({
      next: (response) => {
        console.log('Resposta da API:', response);
        
        let aiResponse = '';
        if (typeof response === 'string') {
          aiResponse = response;
        } else if (response && response.response) {
          aiResponse = response.response;
        } else if (response && typeof response === 'object') {
          aiResponse = JSON.stringify(response);
        } else {
          aiResponse = 'Desculpe, não consegui processar sua pergunta no momento.';
        }

        this.messages.push({
          content: aiResponse,
          isUser: false,
          timestamp: new Date()
        });
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Erro no chat:', error);
        this.messages.push({
          content: 'Ops! Tive um probleminha técnico. Tente perguntar novamente! 😅',
          isUser: false,
          timestamp: new Date()
        });
        this.isLoading = false;
        this.scrollToBottom();
      }
    });

    this.scrollToBottom();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  expandChat(): void {
    this.toggleExpanded.emit();
  }

  closeChatModal(): void {
    this.closeChat.emit();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }
}