import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SupabaseService } from './supabase';
import { HouseholdService } from './household.service';

describe('HouseholdService', () => {
  let service: HouseholdService;
  let rpc: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    rpc = vi.fn().mockResolvedValue({
      data: 'Juan Aviles',
      error: null
    });

    TestBed.configureTestingModule({
      providers: [{
        provide: SupabaseService,
        useValue: { client: { rpc } }
      }]
    });
    service = TestBed.inject(HouseholdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('saves the trimmed name through the member-name RPC', async () => {
    await service.saveCurrentMemberName('  Juan Aviles  ');

    expect(rpc).toHaveBeenCalledWith(
      'set_household_member_name',
      { _full_name: 'Juan Aviles' }
    );
  });

  it('rejects a name when the database does not confirm the saved value', async () => {
    rpc.mockResolvedValue({ data: null, error: null });

    await expect(service.saveCurrentMemberName('Juan Aviles'))
      .rejects.toThrow('The database did not confirm the saved household name.');
  });

  it('does not send an invalid name to the database', async () => {
    await expect(service.saveCurrentMemberName(' '))
      .rejects.toThrow('Name must contain at least 2 characters.');

    expect(rpc).not.toHaveBeenCalled();
  });
});
