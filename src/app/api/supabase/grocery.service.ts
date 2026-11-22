import { inject, Service } from '@angular/core';
import { SupabaseService } from './supabase';
import { from, map, Observable } from 'rxjs';
import { GroceryItem } from '../models/grocery-item.model';

@Service()
export class GroceryService {

    private supabase = inject(SupabaseService);

    getGroceryItems(): Observable<GroceryItem[]>{


    // supabase returns a Promise
    // from converts Promise to an Observable 
        return from(
            this.supabase.client
            .from('grocery_items')
            .select('*')
        ).pipe(
           map(({ data, error }) => {
            if (error) {
                throw error;
            }

            return data as GroceryItem[];
           })
        )
    }

}
