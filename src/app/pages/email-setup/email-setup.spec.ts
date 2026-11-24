import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AuthService } from '../../api/supabase/auth.service';
import { EmailSetup } from './email-setup';

describe('EmailSetup', () => {
  let component: EmailSetup;
  let fixture: ComponentFixture<EmailSetup>;
  let sendSignInLink: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    sendSignInLink = vi.fn().mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [EmailSetup],
      providers: [{
        provide: AuthService,
        useValue: { sendSignInLink }
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(EmailSetup);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows sending state, then confirms the email was sent', async () => {
    let resolveRequest!: () => void;
    sendSignInLink.mockReturnValue(new Promise<void>(resolve => {
      resolveRequest = resolve;
    }));

    const request = component.emailSubmit('person@example.com');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sending sign-in link...');

    resolveRequest();
    await request;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sign-in email sent.');
    expect(fixture.nativeElement.textContent).not.toContain('Sending sign-in link...');
  });
});
