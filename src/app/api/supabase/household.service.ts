import { inject, Service } from '@angular/core';
import { SupabaseService } from './supabase';

@Service()
export class HouseholdService {
    private supabase = inject(SupabaseService);

    // rpc - remote procedure call
    // built in supabase method to execute PostgreSQL functions
    // aka stored procedure
    async createhousehold(name: string) {
        const { data, error } = 
        await this.supabase.client.rpc(
            'create_household', {
                _name: name, 
            }
        );

        if(error){
            throw error;
        }
        
        return data;
    }

       
    // database generates code
    async joinHousehold(inviteCode: string) {
        const { data, error } =
        await this.supabase.client.rpc('join_household',{
            _invite_code: inviteCode
        });

        if(error){
            throw error;
        }

        return data;
    }



}
