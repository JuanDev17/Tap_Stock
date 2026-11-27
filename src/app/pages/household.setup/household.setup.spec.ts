import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { HouseholdService } from '../../api/supabase/household.service';
import { HouseholdSetup } from './household.setup';

describe('HouseholdSetup', () => {
  let component: HouseholdSetup;
  let fixture: ComponentFixture<HouseholdSetup>;
  let householdService: {
    createhousehold: ReturnType<typeof vi.fn>;
    joinHousehold: ReturnType<typeof vi.fn>;
    saveCurrentMemberName: ReturnType<typeof vi.fn>;
  };
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    householdService = {
      createhousehold: vi.fn().mockResolvedValue(undefined),
      joinHousehold: vi.fn().mockResolvedValue(undefined),
      saveCurrentMemberName: vi.fn().mockResolvedValue(undefined)
    };
    navigate = vi.fn().mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [HouseholdSetup],
      providers: [
        { provide: HouseholdService, useValue: householdService },
        { provide: Router, useValue: { navigate } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HouseholdSetup);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('moves to name entry after household creation succeeds', async () => {
    const request = component.createSubmit('The Smith Family');
    expect(component.isLoading()).toBe(true);

    await request;

    expect(component.step()).toBe('member-name');
    expect(component.isLoading()).toBe(false);
    expect(component.successMessage()).toContain('Household created');
  });

  it('shows an error and stops loading when household creation fails', async () => {
    householdService.createhousehold.mockRejectedValue(new Error('Request failed'));

    await component.createSubmit('The Smith Family');

    expect(component.step()).toBe('household');
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toContain('Unable to create household');
  });
});
