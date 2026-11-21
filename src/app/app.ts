import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { List } from './components/list/list';
import { Dashboard } from './pages/dashboard/dashboard';import { AuthService } from './api/supabase/auth.service';
1
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, HeaderComponent, List, Dashboard, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Tap-Stock');

  private auth = inject(AuthService);
  
  constructor() {
    this.auth.listenForAuthChanges();
}
}
