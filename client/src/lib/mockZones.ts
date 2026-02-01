/**
 * Mock Evacuation Zones Data
 * Used for development and offline scenarios
 * Replace with real API calls in production
 */

import { type EvacuationZone } from '@/hooks/useZones';

export const mockEvacuationZones: EvacuationZone[] = [
  {
    id: '1',
    name: 'Safe Zone Alpha - Community Center',
    type: 'safe',
    location: {
      latitude: 34.0837,
      longitude: 74.7973,
    },
    capacity: 500,
    currentOccupancy: 180,
    status: 'active',
    description: 'Main community center with basic medical support and food supplies',
    createdBy: 'soldier-admin',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'District Hospital - Emergency Wing',
    type: 'medical',
    location: {
      latitude: 34.0937,
      longitude: 74.8073,
    },
    capacity: 200,
    currentOccupancy: 95,
    status: 'active',
    description: 'Full emergency medical facilities with 24/7 staff',
    createdBy: 'soldier-admin',
    timestamp: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Primary School Evacuation Point',
    type: 'evacuation',
    location: {
      latitude: 34.0737,
      longitude: 74.7873,
    },
    capacity: 300,
    currentOccupancy: 120,
    status: 'active',
    description: 'School building converted to temporary evacuation point',
    createdBy: 'soldier-admin',
    timestamp: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Safe Zone Bravo - Sports Complex',
    type: 'safe',
    location: {
      latitude: 34.0637,
      longitude: 74.8173,
    },
    capacity: 800,
    currentOccupancy: 250,
    status: 'active',
    description: 'Large sports complex with multiple shelter areas',
    createdBy: 'soldier-admin',
    timestamp: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Medical Hub - Health Center',
    type: 'medical',
    location: {
      latitude: 34.0937,
      longitude: 74.7873,
    },
    capacity: 150,
    currentOccupancy: 65,
    status: 'active',
    description: 'Primary healthcare facility with basic trauma care',
    createdBy: 'soldier-admin',
    timestamp: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'University Campus Shelter',
    type: 'safe',
    location: {
      latitude: 34.0737,
      longitude: 74.8073,
    },
    capacity: 600,
    currentOccupancy: 400,
    status: 'active',
    description: 'University halls converted for emergency shelter',
    createdBy: 'soldier-admin',
    timestamp: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Dal Lake Emergency Point',
    type: 'evacuation',
    location: {
      latitude: 34.1057,
      longitude: 74.8273,
    },
    capacity: 200,
    currentOccupancy: 45,
    status: 'active',
    description: 'Waterside evacuation point for northern sector',
    createdBy: 'soldier-admin',
    timestamp: new Date().toISOString(),
  },
  {
    id: '8',
    name: 'Central Hospital - Trauma Care',
    type: 'medical',
    location: {
      latitude: 34.0737,
      longitude: 74.7973,
    },
    capacity: 100,
    currentOccupancy: 92,
    status: 'active',
    description: 'Specialized trauma and critical care facility',
    createdBy: 'soldier-admin',
    timestamp: new Date().toISOString(),
  },
];

/**
 * Seed zones to localStorage for offline development
 * Call this on app initialization if zones are not available from API
 */
export function seedMockZones(): void {
  try {
    const existingZones = localStorage.getItem('rakshak-zones');
    if (!existingZones) {
      localStorage.setItem('rakshak-zones', JSON.stringify(mockEvacuationZones));
      console.log('Mock zones seeded to localStorage');
    }
  } catch (error) {
    console.error('Error seeding mock zones:', error);
  }
}

/**
 * Get mock zones from localStorage
 */
export function getMockZonesFromStorage(): EvacuationZone[] {
  try {
    const zones = localStorage.getItem('rakshak-zones');
    return zones ? JSON.parse(zones) : [];
  } catch (error) {
    console.error('Error getting zones from storage:', error);
    return [];
  }
}

/**
 * Add a mock zone to localStorage
 */
export function addMockZoneToStorage(zone: EvacuationZone): void {
  try {
    const zones = getMockZonesFromStorage();
    zones.push(zone);
    localStorage.setItem('rakshak-zones', JSON.stringify(zones));
  } catch (error) {
    console.error('Error adding zone to storage:', error);
  }
}

/**
 * Update a mock zone in localStorage
 */
export function updateMockZoneInStorage(id: string, updates: Partial<EvacuationZone>): EvacuationZone | null {
  try {
    const zones = getMockZonesFromStorage();
    const index = zones.findIndex((z) => z.id === id);
    if (index !== -1) {
      zones[index] = { ...zones[index], ...updates };
      localStorage.setItem('rakshak-zones', JSON.stringify(zones));
      return zones[index];
    }
    return null;
  } catch (error) {
    console.error('Error updating zone in storage:', error);
    return null;
  }
}

/**
 * Delete a mock zone from localStorage
 */
export function deleteMockZoneFromStorage(id: string): boolean {
  try {
    const zones = getMockZonesFromStorage();
    const filtered = zones.filter((z) => z.id !== id);
    localStorage.setItem('rakshak-zones', JSON.stringify(filtered));
    return filtered.length < zones.length;
  } catch (error) {
    console.error('Error deleting zone from storage:', error);
    return false;
  }
}
