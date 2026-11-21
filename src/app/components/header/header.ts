import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../api/supabase/auth.service';

@Component({
  imports: [CommonModule, MatIconModule, MatButtonModule],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class HeaderComponent {

private authService = inject(AuthService);

// Sign out the current user
async logout(): Promise<void> {
  try {
    await this.authService.signUserOut();

    console.log('User logged out');

  } catch (error) {
    console.error('Logout failed:', error);
  }
}
}
