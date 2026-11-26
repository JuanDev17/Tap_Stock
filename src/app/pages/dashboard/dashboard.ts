import { Component, inject, OnInit, signal } from '@angular/core';
import { HeaderComponent } from '../../components/header/header';
import { List } from '../../components/list/list';
import { HouseholdService } from '../../api/supabase/household.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  imports: [
    HeaderComponent,
    List,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private householdService = inject(HouseholdService);
  private snackBar = inject(MatSnackBar);

  inviteCode = signal<string | null>(null);
  inviteCodeError = signal('');
  isLoadingInviteCode = signal(true);
  isInviteCodeVisible = signal(false);

  toggleInviteCodeVisibility(): void {
    this.isInviteCodeVisible.update(isVisible => !isVisible);
  }

  async ngOnInit(): Promise<void> {
    try {
      this.inviteCode.set(await this.householdService.getInviteCode());
    } catch (error) {
      console.error('Could not load household invite code:', error);
      this.inviteCodeError.set('Unable to load the invite code.');
    } finally {
      this.isLoadingInviteCode.set(false);
    }
  }

  async copyInviteCode(): Promise<void> {
    const inviteCode = this.inviteCode();
    if (!inviteCode) return;

    try {
      await navigator.clipboard.writeText(inviteCode);
      this.snackBar.open('Copied', undefined, { duration: 1800 });
    } catch (error) {
      console.error('Copy invite code failed:', error);
      this.inviteCodeError.set('Unable to copy the invite code.');
      this.snackBar.open('Could not copy invite code', undefined, {
        duration: 2500
      });
    }
  }
}
