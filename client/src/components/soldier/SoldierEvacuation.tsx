import { useState } from 'react';
import { Shield, Plus, Edit2, Trash2, MapPin, Users, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useZones, type EvacuationZone, type CreateZonePayload } from '@/hooks/useZones';
import { useToast } from '@/hooks/use-toast';

interface ZoneFormData extends CreateZonePayload {
  latitude: number;
  longitude: number;
}

export default function SoldierEvacuation() {
  const { zones, loading, createZone, updateZone, deleteZone } = useZones();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ZoneFormData>({
    name: '',
    type: 'safe',
    latitude: 34.0837,
    longitude: 74.7973,
    capacity: 100,
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateZone(editingId, { ...formData });
        setEditingId(null);
      } else {
        await createZone(formData);
      }
      setFormData({
        name: '',
        type: 'safe',
        latitude: 34.0837,
        longitude: 74.7973,
        capacity: 100,
        description: '',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleEdit = (zone: EvacuationZone) => {
    setFormData({
      name: zone.name,
      type: zone.type,
      latitude: zone.location.latitude,
      longitude: zone.location.longitude,
      capacity: zone.capacity,
      description: zone.description,
    });
    setEditingId(zone.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      type: 'safe',
      latitude: 34.0837,
      longitude: 74.7973,
      capacity: 100,
      description: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'full':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medical':
        return '🏥';
      case 'evacuation':
        return '🚨';
      default:
        return '🛡️';
    }
  };

  const occupancyPercentage = (occupancy: number, capacity: number) =>
    Math.round((occupancy / capacity) * 100);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-tactical font-bold">Evacuation Zones</h1>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
            data-testid="button-create-zone"
          >
            <Plus className="h-4 w-4" />
            New Zone
          </Button>
        </div>

        {showForm && (
          <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Zone' : 'Create New Evacuation Zone'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Zone Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Safe Zone Alpha"
                    data-testid="input-zone-name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    data-testid="select-zone-type"
                  >
                    <option value="safe">Safe Zone</option>
                    <option value="medical">Medical Hub</option>
                    <option value="evacuation">Evacuation Point</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Capacity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Number of people"
                    data-testid="input-zone-capacity"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Additional details"
                    data-testid="input-zone-description"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    data-testid="input-zone-latitude"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    data-testid="input-zone-longitude"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="default" data-testid="button-save-zone">
                  {editingId ? 'Update Zone' : 'Create Zone'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} data-testid="button-cancel-zone">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        )}
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground">Loading zones...</p>
          </div>
        ) : zones.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No evacuation zones created yet. Click "New Zone" to create one.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {zones.map((zone) => (
            <Card
              key={zone.id}
              className="hover:shadow-md transition-shadow"
              data-testid={`card-zone-${zone.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{getTypeIcon(zone.type)}</span>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{zone.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{zone.description}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(zone.status)}>{zone.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {zone.location.latitude.toFixed(4)}, {zone.location.longitude.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {zone.currentOccupancy} / {zone.capacity}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      occupancyPercentage(zone.currentOccupancy, zone.capacity) > 80
                        ? 'bg-red-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: `${occupancyPercentage(zone.currentOccupancy, zone.capacity)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {occupancyPercentage(zone.currentOccupancy, zone.capacity)}% Occupancy
                </p>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(zone)}
                    className="flex-1"
                    data-testid={`button-edit-zone-${zone.id}`}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure?')) deleteZone(zone.id);
                    }}
                    className="flex-1"
                    data-testid={`button-delete-zone-${zone.id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
