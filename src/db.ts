import { supabase } from './lib/supabase';
import { FlightEntry, FlightFormData } from './types';

export const flightDb = {
  async getAll(): Promise<FlightEntry[]> {
    const { data, error } = await supabase
      .from('flights')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return (data || []) as FlightEntry[];
  },

  async add(flight: FlightFormData, userId: string): Promise<FlightEntry> {
    const { data, error } = await supabase
      .from('flights')
      .insert({ ...flight, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data as FlightEntry;
  },

  async update(id: string, flight: FlightFormData): Promise<FlightEntry> {
    const { data, error } = await supabase
      .from('flights')
      .update({ ...flight, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as FlightEntry;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('flights')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('flights')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (error) throw error;
    return count || 0;
  }
};
