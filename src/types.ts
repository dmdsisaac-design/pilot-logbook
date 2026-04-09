export interface FlightEntry {
  id?: string;  // UUID from Supabase
  user_id?: string;
  date: string;
  aircraft_type: string;
  aircraft_ident: string;
  route_from: string;
  route_to: string;
  route_via: string;
  total_time: number;
  pic_time: number;
  sic_time: number;
  dual_received: number;
  dual_given: number;
  solo_time: number;
  cross_country: number;
  night_time: number;
  actual_instrument: number;
  simulated_instrument: number;
  simulator_time: number;
  approaches: number;
  day_landings: number;
  night_landings: number;
  remarks: string;
  created_at?: string;
}

export type FlightFormData = Omit<FlightEntry, 'id' | 'user_id' | 'created_at'>;

export interface TotalsSummary {
  total_time: number;
  pic_time: number;
  sic_time: number;
  dual_received: number;
  dual_given: number;
  solo_time: number;
  cross_country: number;
  night_time: number;
  actual_instrument: number;
  simulated_instrument: number;
  simulator_time: number;
  approaches: number;
  day_landings: number;
  night_landings: number;
  flight_count: number;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  subscription_status: 'free' | 'pro' | 'canceled';
  flight_count: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}
