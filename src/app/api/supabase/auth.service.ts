import { inject, Service } from '@angular/core';
import { SupabaseService } from './supabase';
import { Observable } from 'rxjs';
import { User } from '@supabase/supabase-js';

@Service()

export class AuthService {

    private supabase = inject(SupabaseService);
    loading = false;

    async sendOtpEmail(email: string): Promise<void>{
        const { error } = 
        // await waits for the async op to settle 
            await this.supabase.client.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true
                }
            });

        if(error){
         // allow the component to catch the error and display
            throw error;
        }
           
    }


    async verifyOtpEmail(email: string, code: string): Promise<void>{
        const { data, error } = 
            await this.supabase.client.auth.verifyOtp({
                email,
                // numeric code user received 
                token: code,
                // type tells supabase which OTP flow to use
                type: 'email'
            });

            if(error){
                throw error;
            }

    }

    // getCurrentUser()
    // Promise bc we want the user details once. 
    // this just returns snapshot at the moment its called 
    async getUserDetails(): Promise<User | null>{
        const { data, error } = 
        // methods coming from supabase.client.auth
           await this.supabase.client.auth.getUser();

            if(error){
                throw error;
            }

            return data.user;
    }

    // signout()
    async signUserOut(): Promise<void>{
        const { error } =
            await this.supabase.client.auth.signOut();

            if(error){
                throw error;
            }

    }

}
