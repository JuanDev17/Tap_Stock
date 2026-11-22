import { Component, inject, OnInit, signal } from '@angular/core';
import { HeaderComponent } from '../../components/header/header';
import { List } from '../../components/list/list';
import { HouseholdService } from '../../api/supabase/household.service';

@Component({
  imports: [HeaderComponent, List],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private householdService = inject(HouseholdService);

  inviteCode = signal<string | null>(null);
  copiedInviteCode = signal(false);
  inviteCodeError = signal('');
  isLoadingInviteCode = signal(true);

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
      this.copiedInviteCode.set(true);
    } catch (error) {
      console.error('Copy invite code failed:', error);
      this.inviteCodeError.set('Unable to copy the invite code.');
    }
  }
}
