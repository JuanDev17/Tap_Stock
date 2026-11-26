import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HouseholdService } from '../../api/supabase/household.service';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [{
        provide: HouseholdService,
        useValue: { getInviteCode: async () => 'ABC123' }
      }, {
        provide: MatSnackBar,
        useValue: { open: () => undefined }
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggles the invite code visibility', () => {
    expect(component.isInviteCodeVisible()).toBe(false);

    component.toggleInviteCodeVisibility();
    expect(component.isInviteCodeVisible()).toBe(true);

    component.toggleInviteCodeVisibility();
    expect(component.isInviteCodeVisible()).toBe(false);
  });

  it('copies the invite code and shows snackbar feedback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText }
    });
    const snackBar = TestBed.inject(MatSnackBar);
    const open = vi.spyOn(snackBar, 'open');

    await component.copyInviteCode();

    expect(writeText).toHaveBeenCalledWith('ABC123');
    expect(open).toHaveBeenCalledWith('Copied', undefined, { duration: 1800 });
  });
});
