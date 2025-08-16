import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ChatAiComponent } from '../chat-ai/chat-ai.component';
import { Lesson } from '../../interfaces/lesson';
import { AuthService } from '../../services/auth.service';

interface ContentPart {
  type: 'text' | 'code';
  content: string;
  formattedContent?: string;
}

@Component({
  selector: 'app-lesson-player',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatAiComponent],
  templateUrl: './lesson-player.component.html',
  styleUrls: ['./lesson-player.component.scss']
})
export class LessonPlayerComponent implements OnInit {
  lesson: Lesson | null = null;
  videoUrl: SafeResourceUrl | null = null;
  showChat = false;
  userName = '';
  processedContent: ContentPart[] = [];
  isChatExpanded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.currentUser?.name || 'Estudante';
    const lessonId = this.route.snapshot.params['id'];    
    const savedLesson = localStorage.getItem('currentLesson');
    
    if (savedLesson) {
      try {
        this.lesson = JSON.parse(savedLesson);        
        if (this.lesson && this.lesson.uuid === lessonId) {
          this.loadVideo();
          this.processContent();
          localStorage.removeItem('currentLesson');
        } else {
          this.redirectToHome('UUID não confere');
        }
      } catch (error) {
        this.redirectToHome('Erro ao parsear dados');
      }
    } else {
      this.redirectToHome('Nenhuma lesson encontrada');
    }
  }

  private processContent(): void {
    if (!this.lesson?.content) return;
    
    const content = this.lesson.content;
    const parts: ContentPart[] = [];
    
    const codeMarker = 'Código usado na aula:';
    const codeMarkerIndex = content.indexOf(codeMarker);
    
    if (codeMarkerIndex !== -1) {      
      const textPart = content.substring(0, codeMarkerIndex).trim();
      if (textPart) {
        parts.push({ type: 'text', content: textPart});
      }
      
      const codePart = content.substring(codeMarkerIndex + codeMarker.length).trim();
      if (codePart) {
        parts.push({ type: 'code', content: codePart, formattedContent: this.formatHtmlCode(codePart) });
      }
    } else {
      parts.push({ type: 'text', content: content});
    }
    
    this.processedContent = parts;
    console.log('Conteúdo processado:', parts);
  }

  copyCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      // Feedback visual
      const button = event?.target as HTMLElement;
      const originalText = button.textContent;
      button.textContent = '✅ Copiado!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    }).catch(() => {
      alert('Erro ao copiar código. Tente selecionar e copiar manualmente.');
    });
  }

  private redirectToHome(reason: string): void {
    console.log('Redirecionando para home. Motivo:', reason);
    alert(`Erro: ${reason}. Voltando para a página inicial.`);
    this.router.navigate(['/home']);
  }

  loadVideo(): void {    
    if (this.lesson?.linkVideo) {
      const videoLink = this.lesson.linkVideo;
      
      if (this.isGoogleDriveLink(videoLink)) {
        const embedUrl = this.convertGoogleDriveToEmbed(videoLink);
        this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
        console.log('Google Drive video URL:', embedUrl);
      } 
      else if (this.isYouTubeId(videoLink)) {
        const embedUrl = `https://www.youtube.com/embed/${videoLink}`;
        this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
        console.log('YouTube video URL:', embedUrl);
      }
      else if (videoLink.startsWith('http')) {
        this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(videoLink);
        console.log('Direct video URL:', videoLink);
      }
      else {
        console.log('Formato de vídeo não reconhecido:', videoLink);
      }
    }
  }

  private isGoogleDriveLink(link: string): boolean {
    return link.includes('drive.google.com') || link.includes('docs.google.com');
  }

  private isYouTubeId(link: string): boolean {
    return /^[a-zA-Z0-9_-]{11}$/.test(link) && !link.includes('/');
  }

  private convertGoogleDriveToEmbed(driveLink: string): string {
    let fileId = '';
    
    if (driveLink.includes('/file/d/')) {
      const match = driveLink.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        fileId = match[1];
      }
    }
    else if (driveLink.includes('/document/d/')) {
      const match = driveLink.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        fileId = match[1];
      }
    }
    else if (/^[a-zA-Z0-9_-]+$/.test(driveLink)) {
      fileId = driveLink;
    }
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  toggleChat(): void {
    this.showChat = !this.showChat;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  toggleChatExpanded(): void {
    this.isChatExpanded = !this.isChatExpanded;
  }

  closeChatModal(): void {
    this.isChatExpanded = false;
  }

  private formatHtmlCode(code: string): string {
    return code
      // Adicionar quebras de linha entre tags
      .replace(/></g, '>\n<')
      
      // Formatação específica para tags importantes
      .replace(/<html/g, '\n<html')
      .replace(/<head>/g, '<head>\n  ')
      .replace(/<\/head>/g, '\n</head>')
      .replace(/<body/g, '\n<body')
      .replace(/<\/body>/g, '\n</body>')
      .replace(/<title>/g, '  <title>')
      .replace(/<meta/g, '  <meta')
      
      // Formatação do JavaScript
      .replace(/<script>/g, '\n<script>\n  ')
      .replace(/<\/script>/g, '\n</script>')
      .replace(/function /g, '\n  function ')
      .replace(/;/g, ';\n    ')
      .replace(/\{/g, '{\n      ')
      .replace(/\}/g, '\n  }')
      
      // Formatação de elementos comuns
      .replace(/<h1>/g, '  <h1>')
      .replace(/<p>/g, '  <p>')
      .replace(/<input/g, '  <input')
      .replace(/<button/g, '  <button')
      .replace(/<br>/g, '  <br>')
      
      // Limpeza - remover linhas vazias duplas
      .replace(/\n\s*\n/g, '\n')
      
      // Limpeza - ajustar espaçamentos excessivos
      .replace(/\n\s{6,}/g, '\n    ')
      
      // Trim geral
      .trim();
  }
}