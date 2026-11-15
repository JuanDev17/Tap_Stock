import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HouseholdSignup } from './household.signup';

describe('HouseholdSignup', () => {
  let component: HouseholdSignup;
  let fixture: ComponentFixture<HouseholdSignup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HouseholdSignup],
    }).compileComponents();

    fixture = TestBed.createComponent(HouseholdSignup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
