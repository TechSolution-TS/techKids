
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { LessonPlayerComponent } from './components/lesson-player/lesson-player.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'lesson/:id', component: LessonPlayerComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];