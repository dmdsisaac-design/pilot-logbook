import { FlightEntry, FlightFormData } from '../types';

const CSV_HEADERS = [
  'Date', 'Aircraft Type', 'Aircraft Ident', 'From', 'Via', 'To',
  'Total Time', 'PIC', 'SIC', 'Dual Received', 'Dual Given', 'Solo',
  'Cross-Country', 'Night', 'Actual IMC', 'Simulated Inst', 'Simulator',
  'Approaches', 'Day Landings', 'Night Landings', 'Remarks'
];

export function exportFlightsToCsv(flights: FlightEntry[]): string {
  const rows = flights.map((f) => [
    f.date, f.aircraft_type, f.aircraft_ident, f.route_from, f.route_via, f.route_to,
    f.total_time, f.pic_time, f.sic_time, f.dual_received, f.dual_given, f.solo_time,
    f.cross_country, f.night_time, f.actual_instrument, f.simulated_instrument, f.simulator_time,
    f.approaches, f.day_landings, f.night_landings,
    `"${(f.remarks || '').replace(/"/g, '""')}"`
  ]);
  return [CSV_HEADERS.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function downloadCsv(csv: string, filename: string = 'flight_log.csv'): void {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Parse CSV values (handles quoted fields with commas)
function parseRow(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { result.push(current.trim()); current = ''; }
      else { current += ch; }
    }
  }
  result.push(current.trim());
  return result;
}

// Standard logbook header mappings
const HEADER_MAP: Record<string, string> = {
  date: 'date', aircraft_type: 'aircraft_type', aircrafttype: 'aircraft_type',
  aircraft_ident: 'aircraft_ident', aircraftident: 'aircraft_ident',
  from: 'route_from', route_from: 'route_from', routefrom: 'route_from',
  to: 'route_to', route_to: 'route_to', routeto: 'route_to',
  via: 'route_via', route_via: 'route_via', routevia: 'route_via',
  total_time: 'total_time', totaltime: 'total_time', total: 'total_time',
  pic: 'pic_time', pic_time: 'pic_time', pictime: 'pic_time',
  sic: 'sic_time', sic_time: 'sic_time', sictime: 'sic_time',
  dual_received: 'dual_received', dualreceived: 'dual_received', dualrcvd: 'dual_received',
  dual_given: 'dual_given', dualgiven: 'dual_given',
  solo: 'solo_time', solo_time: 'solo_time', solotime: 'solo_time',
  crosscountry: 'cross_country', cross_country: 'cross_country', xc: 'cross_country',
  night: 'night_time', night_time: 'night_time', nighttime: 'night_time',
  actual_instrument: 'actual_instrument', actualinstrument: 'actual_instrument',
  actual_imc: 'actual_instrument', actualimc: 'actual_instrument', imc: 'actual_instrument',
  simulated_instrument: 'simulated_instrument', simulatedinstrument: 'simulated_instrument',
  simulated_inst: 'simulated_instrument', simulatedinst: 'simulated_instrument',
  simulator: 'simulator_time', simulator_time: 'simulator_time', simulatortime: 'simulator_time',
  approaches: 'approaches', apch: 'approaches',
  day_landings: 'day_landings', daylandings: 'day_landings',
  night_landings: 'night_landings', nightlandings: 'night_landings',
  remarks: 'remarks', notes: 'remarks',
};

// FlightAware header mappings
const FLIGHTAWARE_MAP: Record<string, string> = {
  ident: 'aircraft_ident',
  reg: 'aircraft_ident',
  type: 'aircraft_type',
  origin: 'route_from',
  origin_name: '_origin_name',
  origin_city: '_origin_city',
  destination: 'route_to',
  destination_name: '_dest_name',
  destination_city: '_dest_city',
  departure_time: '_departure_time',
  departuretime: '_departure_time',
  arrival_time: '_arrival_time',
  arrivaltime: '_arrival_time',
  enroute: '_enroute',
  filed_route: '_filed_route',
  filedroute: '_filed_route',
  departure_runway: '_dep_rwy',
  departurerunway: '_dep_rwy',
  arrival_runway: '_arr_rwy',
  arrivalrunway: '_arr_rwy',
};

// ForeFlight header mappings
const FOREFLIGHT_MAP: Record<string, string> = {
  date: 'date',
  aircraftid: 'aircraft_ident',
  aircraft_id: 'aircraft_ident',
  model: 'aircraft_type',
  typecode: 'aircraft_type',
  from: 'route_from',
  to: 'route_to',
  route: 'route_via',
  totaltime: 'total_time',
  total_time: 'total_time',
  pic: 'pic_time',
  sic: 'sic_time',
  night: 'night_time',
  solo: 'solo_time',
  crosscountry: 'cross_country',
  cross_country: 'cross_country',
  actualinstrument: 'actual_instrument',
  actual_instrument: 'actual_instrument',
  simulatedinstrument: 'simulated_instrument',
  simulated_instrument: 'simulated_instrument',
  dualreceived: 'dual_received',
  dual_received: 'dual_received',
  dualgiven: 'dual_given',
  dual_given: 'dual_given',
  approaches: 'approaches',
  daylandings: 'day_landings',
  day_landings: 'day_landings',
  nightlandings: 'night_landings',
  night_landings: 'night_landings',
  remarks: 'remarks',
  comments: 'remarks',
};

const NUM_FIELDS = new Set([
  'total_time', 'pic_time', 'sic_time', 'dual_received', 'dual_given', 'solo_time',
  'cross_country', 'night_time', 'actual_instrument', 'simulated_instrument', 'simulator_time',
  'approaches', 'day_landings', 'night_landings'
]);

const STR_FIELDS = new Set([
  'date', 'aircraft_type', 'aircraft_ident', 'route_from', 'route_to', 'route_via', 'remarks'
]);

// Convert H:MM or HH:MM duration to decimal hours
function durationToDecimal(val: string): number {
  if (!val || val === 'n/a') return 0;
  const match = val.match(/^(\d+):(\d+)$/);
  if (match) {
    return parseInt(match[1]) + parseInt(match[2]) / 60;
  }
  return parseFloat(val) || 0;
}

// Extract date from datetime string like "2024-07-13 10:12AM CDT"
function extractDate(val: string): string {
  if (!val) return '';
  const match = val.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  return val;
}

// Detect if this is a FlightAware CSV based on headers
function isFlightAwareFormat(headers: string[]): boolean {
  const lower = headers.map(h => h.toLowerCase().replace(/[^a-z_]/g, ''));
  return lower.includes('ident') && lower.includes('origin') && lower.includes('enroute');
}

// Detect if this is a ForeFlight CSV based on headers
function isFlightAwareHeaders(headers: string[]): boolean {
  const lower = headers.map(h => h.toLowerCase().replace(/[^a-z_]/g, ''));
  return lower.includes('aircraftid') || (lower.includes('model') && lower.includes('totaltime'));
}

// Parse FlightAware CSV into flights
function parseFlightAware(headers: string[], dataLines: string[]): FlightFormData[] {
  const cleanHeaders = headers.map(h => h.toLowerCase().replace(/[^a-z_]/g, ''));
  const colMap = cleanHeaders.map(h => FLIGHTAWARE_MAP[h] || HEADER_MAP[h] || null);
  
  const flights: FlightFormData[] = [];
  
  for (const line of dataLines) {
    const vals = parseRow(line);
    const raw: Record<string, string> = {};
    
    colMap.forEach((field, idx) => {
      if (!field || idx >= vals.length) return;
      raw[field] = vals[idx] || '';
    });
    
    // Extract date from departure time
    const date = extractDate(raw['_departure_time'] || '');
    if (!date) continue;
    
    // Get aircraft type
    const aircraftType = raw['aircraft_type'] || '';
    if (!aircraftType) continue;
    
    // Convert enroute time (H:MM) to decimal
    const totalTime = durationToDecimal(raw['_enroute'] || '');
    
    // Build route remarks from filed route and runways
    const remarks: string[] = [];
    if (raw['_filed_route']) remarks.push(`Route: ${raw['_filed_route']}`);
    if (raw['_dep_rwy'] || raw['_arr_rwy']) {
      remarks.push(`Rwy: ${raw['_dep_rwy'] || '?'}→${raw['_arr_rwy'] || '?'}`);
    }
    if (raw['_origin_name']) remarks.push(`${raw['_origin_name']}`);
    if (raw['_dest_name']) remarks.push(`→ ${raw['_dest_name']}`);
    
    flights.push({
      date,
      aircraft_type: aircraftType,
      aircraft_ident: raw['aircraft_ident'] || '',
      route_from: raw['route_from'] || '',
      route_to: raw['route_to'] || '',
      route_via: raw['_filed_route'] || '',
      total_time: Math.round(totalTime * 10) / 10,
      pic_time: Math.round(totalTime * 10) / 10, // Default PIC = total time
      sic_time: 0,
      dual_received: 0,
      dual_given: 0,
      solo_time: 0,
      cross_country: (raw['route_from'] !== raw['route_to'] && raw['route_from'] && raw['route_to']) 
        ? Math.round(totalTime * 10) / 10 : 0,
      night_time: 0,
      actual_instrument: 0,
      simulated_instrument: 0,
      simulator_time: 0,
      approaches: 0,
      day_landings: 1,
      night_landings: 0,
      remarks: remarks.join(' | '),
    });
  }
  
  return flights;
}

export function parseCsvToFlights(text: string): FlightFormData[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const rawHeaders = parseRow(lines[0]);
  
  // Check if FlightAware format
  if (isFlightAwareFormat(rawHeaders)) {
    return parseFlightAware(rawHeaders, lines.slice(1));
  }
  
  // Standard logbook format
  const cleanHeaders = rawHeaders.map(h => h.trim().toLowerCase().replace(/[^a-z_]/g, ''));
  
  // Try ForeFlight mappings first, then standard
  const colMap = cleanHeaders.map(h => FOREFLIGHT_MAP[h] || HEADER_MAP[h] || null);

  const flights: FlightFormData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = parseRow(lines[i]);
    const row: Record<string, any> = {};

    colMap.forEach((field, idx) => {
      if (!field || idx >= vals.length) return;
      if (NUM_FIELDS.has(field)) { 
        row[field] = durationToDecimal(vals[idx]); 
      }
      else if (STR_FIELDS.has(field)) { row[field] = vals[idx] || ''; }
    });

    if (!row.date || !row.aircraft_type) continue; // skip invalid rows

    flights.push({
      date: row.date || '',
      aircraft_type: row.aircraft_type || '',
      aircraft_ident: row.aircraft_ident || '',
      route_from: row.route_from || '',
      route_to: row.route_to || '',
      route_via: row.route_via || '',
      total_time: row.total_time || 0,
      pic_time: row.pic_time || 0,
      sic_time: row.sic_time || 0,
      dual_received: row.dual_received || 0,
      dual_given: row.dual_given || 0,
      solo_time: row.solo_time || 0,
      cross_country: row.cross_country || 0,
      night_time: row.night_time || 0,
      actual_instrument: row.actual_instrument || 0,
      simulated_instrument: row.simulated_instrument || 0,
      simulator_time: row.simulator_time || 0,
      approaches: row.approaches || 0,
      day_landings: row.day_landings || 0,
      night_landings: row.night_landings || 0,
      remarks: row.remarks || '',
    });
  }

  return flights;
}
