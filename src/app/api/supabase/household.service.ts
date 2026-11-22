import { inject, Service } from '@angular/core';
import { SupabaseService } from './supabase';

@Service()
export class HouseholdService {
    private supabase = inject(SupabaseService);

    async getInviteCode(): Promise<string | null> {
        const { data, error: sessionError } =
            await this.supabase.client.auth.getSession();

        if (sessionError) {
            throw sessionError;
        }

        const user = data.session?.user;
        if (!user) {
            return null;
        }

        const { data: household, error: householdError } =
            await this.supabase.client
                .from('households')
                .select('invite_code')
                .eq('created_by', user.id)
                .limit(1)
                .maybeSingle();

        if (householdError) {
            throw householdError;
        }

        return household?.invite_code ?? null;
    }

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

    // checking if user belongs to a household 
    // Check whether the current user belongs to a household
async hasHousehold(): Promise<boolean> {

    const { data: { user }, error: userError } =
        await this.supabase.client.auth.getUser();

    if (userError) {
        throw userError;
    }

    if (!user) {
        return false;
    }

    const { data, error } =
        await this.supabase.client
            .from('household_members')
            .select('household_id')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle();

    if (error) {
        throw error;
    }

    // Membership exists = household setup completed
    return !!data;
}


}
