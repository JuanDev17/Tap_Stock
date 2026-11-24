import { inject, Service } from '@angular/core';
import { from, Observable } from 'rxjs';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { GroceryItem, GroceryUnit } from '../models/grocery-item.model';
import { SupabaseService } from './supabase';

interface GroceryItemRow {
    id: string;
    household_id: string;
    name: string;
    quantity: number;
    unit: string;
    category: string | null;
    is_purchased: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;
    added_by: string;
}

interface HouseholdMemberRow {
    household_id: string;
    user_id: string;
    full_name: string | null;
}

interface HouseholdContext {
    householdId: string;
    userId: string;
}

@Service()
export class GroceryService {
    private supabase = inject(SupabaseService);

    getGroceryItems(): Observable<GroceryItem[]> {
        return from(this.loadGroceryItems());
    }

    watchGroceryItemChanges(): Observable<void> {
        return new Observable<void>(observer => {
            let channel: RealtimeChannel | undefined;
            let stopped = false;

            // Listen only to changes for this user's household.
            void this.getHouseholdContext().then(({ householdId }) => {
                if (stopped) return;

                channel = this.supabase.client
                    .channel(`grocery-items:${householdId}`)
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'grocery_items',
                            filter: `household_id=eq.${householdId}`
                        },
                        () => observer.next(undefined)
                    )
                    .subscribe(status => {
                        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                            observer.error(
                                new Error(`Grocery realtime channel failed: ${status}`)
                            );
                        }
                    });
            }).catch(error => observer.error(error));

            // Removing the Observable also closes its Supabase channel.
            return () => {
                stopped = true;
                if (channel) {
                    void this.supabase.client.removeChannel(channel).catch(error => {
                        console.error('Could not close grocery realtime channel:', error);
                    });
                }
            };
        });
    }

    addGroceryItem(
        item: Omit<GroceryItem, 'id'>
    ): Observable<GroceryItem> {
        return from(this.insertGroceryItem(item));
    }

    deleteGroceryItem(id: string): Observable<GroceryItem> {
        return from(this.removeGroceryItem(id));
    }

    editGroceryItem(
        id: string,
        changes: Partial<Omit<GroceryItem, 'id'>>
    ): Observable<GroceryItem> {
        return from(this.updateGroceryItem(id, changes));
    }

    private async loadGroceryItems(): Promise<GroceryItem[]> {
        const { householdId } = await this.getHouseholdContext();
        const groceryResult = await this.supabase.client
            .from('grocery_items')
            .select('*')
            .eq('household_id', householdId);

        if (groceryResult.error) throw groceryResult.error;

        // Names are display-only; a missing full_name column must not hide groceries.
        let memberNames = new Map<string, string>();
        try {
            memberNames = await this.getMemberNames(householdId);
        } catch (error) {
            console.error('Could not load household member names:', error);
        }

        return (groceryResult.data as GroceryItemRow[]).map(row =>
            this.fromDatabase(row, memberNames)
        );
    }

    private async insertGroceryItem(
        item: Omit<GroceryItem, 'id'>
    ): Promise<GroceryItem> {
        const { householdId, userId } = await this.getHouseholdContext();
        const { data, error } = await this.supabase.client
            .from('grocery_items')
            .insert({
                household_id: householdId,
                name: item.title,
                quantity: item.quantity,
                unit: item.unit,
                is_purchased: item.isCompleted,
                notes: item.note ?? null,
                added_by: userId
            })
            .select()
            .single();

        if (error) throw error;

        const memberNames = await this.getMemberNames(householdId);
        return this.fromDatabase(data as GroceryItemRow, memberNames);
    }

    private async updateGroceryItem(
        id: string,
        changes: Partial<Omit<GroceryItem, 'id'>>
    ): Promise<GroceryItem> {
        const { householdId } = await this.getHouseholdContext();
        const update: Partial<GroceryItemRow> = {};

        // Map only fields present in the edit so other columns stay unchanged.
        if (changes.title !== undefined) update.name = changes.title;
        if (changes.quantity !== undefined) update.quantity = changes.quantity;
        if (changes.unit !== undefined) update.unit = changes.unit;
        if (changes.isCompleted !== undefined) {
            update.is_purchased = changes.isCompleted;
        }
        if (changes.note !== undefined) update.notes = changes.note;

        const { data, error } = await this.supabase.client
            .from('grocery_items')
            .update(update)
            .eq('id', id)
            .eq('household_id', householdId)
            .select()
            .single();

        if (error) throw error;

        const memberNames = await this.getMemberNames(householdId);
        return this.fromDatabase(data as GroceryItemRow, memberNames);
    }

    private async removeGroceryItem(id: string): Promise<GroceryItem> {
        const { householdId } = await this.getHouseholdContext();
        const { data, error } = await this.supabase.client
            .from('grocery_items')
            .delete()
            .eq('id', id)
            .eq('household_id', householdId)
            .select()
            .single();

        if (error) throw error;

        const memberNames = await this.getMemberNames(householdId);
        return this.fromDatabase(data as GroceryItemRow, memberNames);
    }

    private async getHouseholdContext(): Promise<HouseholdContext> {
        const { data: { user }, error: userError } =
            await this.supabase.client.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error('You must be signed in to manage groceries.');

        const { data: member, error: memberError } = await this.supabase.client
            .from('household_members')
            .select('household_id')
            .eq('user_id', user.id)
            .single();

        if (memberError) throw memberError;

        return {
            householdId: member.household_id,
            userId: user.id
        };
    }

    private async getMemberNames(
        householdId: string
    ): Promise<Map<string, string>> {
        const { data, error } = await this.supabase.client
            .from('household_members')
            .select('user_id, full_name')
            .eq('household_id', householdId);

        if (error) throw error;

        return new Map(
            (data as HouseholdMemberRow[]).map(member => [
                member.user_id,
                member.full_name?.trim() || 'Household member'
            ])
        );
    }

    private fromDatabase(
        row: GroceryItemRow,
        memberNames: Map<string, string>
    ): GroceryItem {
        // Translate database column names into the app's display model.
        return {
            id: row.id,
            title: row.name,
            quantity: Number(row.quantity),
            unit: row.unit as GroceryUnit,
            note: row.notes ?? undefined,
            addedBy: memberNames.get(row.added_by) ?? 'Household member',
            isCompleted: row.is_purchased,
            createdAt: row.created_at
        };
    }
}
