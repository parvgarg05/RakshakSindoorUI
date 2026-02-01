import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  getMockZonesFromStorage,
  addMockZoneToStorage,
  updateMockZoneInStorage,
  deleteMockZoneFromStorage,
  seedMockZones,
} from '@/lib/mockZones';

export interface EvacuationZone {
  id: string;
  name: string;
  type: 'safe' | 'medical' | 'evacuation';
  location: {
    latitude: number;
    longitude: number;
  };
  capacity: number;
  currentOccupancy: number;
  status: 'active' | 'inactive' | 'full';
  description: string;
  createdBy: string;
  timestamp: string;
}

export interface CreateZonePayload {
  name: string;
  type: 'safe' | 'medical' | 'evacuation';
  latitude: number;
  longitude: number;
  capacity: number;
  description: string;
}

export function useZones() {
  const [zones, setZones] = useState<EvacuationZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useOfflineMode, setUseOfflineMode] = useState(false);
  const { toast } = useToast();

  // Fetch all zones
  const fetchZones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/zones');
      if (!response.ok) throw new Error('Failed to fetch zones');
      const data = await response.json();
      setZones(data);
      setUseOfflineMode(false);
    } catch (err) {
      // Fallback to mock/offline data
      console.log('Falling back to offline zones...');
      seedMockZones();
      const offlineZones = getMockZonesFromStorage();
      setZones(offlineZones);
      setUseOfflineMode(true);
      const message = err instanceof Error ? err.message : 'Using offline data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create zone
  const createZone = useCallback(
    async (payload: CreateZonePayload) => {
      try {
        if (useOfflineMode) {
          const newZone: EvacuationZone = {
            id: `zone-${Date.now()}`,
            name: payload.name,
            type: payload.type,
            location: {
              latitude: payload.latitude,
              longitude: payload.longitude,
            },
            capacity: payload.capacity,
            currentOccupancy: 0,
            status: 'active',
            description: payload.description,
            createdBy: 'user',
            timestamp: new Date().toISOString(),
          };
          addMockZoneToStorage(newZone);
          setZones((prev) => [...prev, newZone]);
          toast({ title: 'Zone created (offline)', description: `${payload.name} has been created` });
          return newZone;
        }

        const response = await fetch('/api/zones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            latitude: payload.latitude,
            longitude: payload.longitude,
          }),
        });

        if (!response.ok) throw new Error('Failed to create zone');
        const newZone = await response.json();
        setZones((prev) => [...prev, newZone]);
        toast({ title: 'Zone created', description: `${payload.name} has been created` });
        return newZone;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        toast({ title: 'Error', description: message, variant: 'destructive' });
        throw err;
      }
    },
    [useOfflineMode, toast]
  );

  // Update zone
  const updateZone = useCallback(
    async (id: string, updates: Partial<EvacuationZone>) => {
      try {
        if (useOfflineMode) {
          const updated = updateMockZoneInStorage(id, updates);
          if (updated) {
            setZones((prev) => prev.map((z) => (z.id === id ? updated : z)));
            toast({ title: 'Zone updated (offline)', description: 'Changes saved locally' });
            return updated;
          }
          throw new Error('Zone not found');
        }

        const response = await fetch(`/api/zones/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error('Failed to update zone');
        const updatedZone = await response.json();
        setZones((prev) => prev.map((z) => (z.id === id ? updatedZone : z)));
        toast({ title: 'Zone updated', description: 'Changes saved successfully' });
        return updatedZone;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        toast({ title: 'Error', description: message, variant: 'destructive' });
        throw err;
      }
    },
    [useOfflineMode, toast]
  );

  // Delete zone
  const deleteZone = useCallback(
    async (id: string) => {
      try {
        if (useOfflineMode) {
          if (deleteMockZoneFromStorage(id)) {
            setZones((prev) => prev.filter((z) => z.id !== id));
            toast({ title: 'Zone deleted (offline)', description: 'Zone has been removed' });
          } else {
            throw new Error('Zone not found');
          }
          return;
        }

        const response = await fetch(`/api/zones/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete zone');
        setZones((prev) => prev.filter((z) => z.id !== id));
        toast({ title: 'Zone deleted', description: 'Zone has been removed' });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        toast({ title: 'Error', description: message, variant: 'destructive' });
        throw err;
      }
    },
    [useOfflineMode, toast]
  );

  // Find nearest zone
  const findNearestZone = useCallback(
    async (lat: number, lon: number, type?: string) => {
      try {
        if (useOfflineMode) {
          const allZones = getMockZonesFromStorage();
          let filtered = allZones;

          if (type && type !== 'all') {
            filtered = allZones.filter((z) => z.type === type);
          }

          if (filtered.length === 0) return null;

          // Calculate distances
          const withDistance = filtered.map((zone) => {
            const lat1 = lat * (Math.PI / 180);
            const lat2 = zone.location.latitude * (Math.PI / 180);
            const deltaLat = (zone.location.latitude - lat) * (Math.PI / 180);
            const deltaLon = (zone.location.longitude - lon) * (Math.PI / 180);

            const a =
              Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) *
                Math.cos(lat2) *
                Math.sin(deltaLon / 2) *
                Math.sin(deltaLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = 6371 * c;

            return { ...zone, distance };
          });

          return withDistance.reduce((prev, curr) =>
            prev.distance < curr.distance ? prev : curr
          );
        }

        const params = new URLSearchParams();
        params.append('lat', lat.toString());
        params.append('lon', lon.toString());
        if (type) params.append('type', type);

        const response = await fetch(`/api/zones/nearest?${params}`);
        if (!response.ok) throw new Error('Failed to find nearest zone');
        const zone = await response.json();
        return zone;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(message);
        return null;
      }
    },
    [useOfflineMode]
  );

  // Initial fetch
  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  return {
    zones,
    loading,
    error,
    useOfflineMode,
    fetchZones,
    createZone,
    updateZone,
    deleteZone,
    findNearestZone,
  };
}
