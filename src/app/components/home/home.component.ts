import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Matter } from '../../interfaces/matter';
import { Lesson } from '../../interfaces/lesson';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  matters: Matter[] = [];
  lessonsByMatter: { [key: string]: Lesson[] } = {};
  isLoading = true;
  userName = '';

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.currentUser?.name || 'Estudante';
    this.loadMatters();
  }

  loadMatters(): void {
    this.apiService.getMatters().subscribe({
      next: (matters) => {
        this.matters = matters;
        this.loadLessonsForAllMatters();
      },
      error: (error) => {
        console.error('Erro ao carregar matérias:', error);
        this.isLoading = false;
      }
    });
  }

  loadLessonsForAllMatters(): void {
    let completedRequests = 0;
    
    this.matters.forEach(matter => {
      this.apiService.getLessonsByMatter(matter.uuid).subscribe({
        next: (lessons) => {
          this.lessonsByMatter[matter.uuid] = lessons;
          completedRequests++;
          
          if (completedRequests === this.matters.length) {
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error(`Erro ao carregar lições para ${matter.name}:`, error);
          completedRequests++;
          
          if (completedRequests === this.matters.length) {
            this.isLoading = false;
          }
        }
      });
    });
  }

  onLessonClick(lesson: Lesson): void {
    localStorage.setItem('currentLesson', JSON.stringify(lesson));
    this.router.navigate([`/lesson/${lesson.uuid}`]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getSubjectIcon(matterName: string): string {
    const icons: { [key: string]: string } = {
      'matemática': '🔢',
      'português': '📚',
      'ciências': '🔬',
      'história': '📜',
      'geografia': '🌍',
      'inglês': '🗣️',
      'arte': '🎨',
      'educação física': '⚽' 
    };
    
    return icons[matterName.toLowerCase()] || '📖';
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  }

  convertGoogleDriveUrl(driveUrl: string): string {
    if (!driveUrl || !driveUrl.includes('drive.google.com')) {
      return '';
    }
    
    const fileIdMatch = driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300-c`;
    }
    
    return '';
  }

  onImageError(event: any): void {
    const img = event.target;
    const fallback = img?.nextElementSibling;
    
    if (img) {
      img.style.display = 'none';
    }
    if (fallback && fallback.classList.contains('thumbnail-fallback')) {
      fallback.style.display = 'flex';
    }
  }

  onImageLoad(event: any): void {
    const img = event.target;
    const fallback = img?.nextElementSibling;
    
    if (fallback && fallback.classList.contains('thumbnail-fallback')) {
      fallback.style.display = 'none';
    }
  }
}