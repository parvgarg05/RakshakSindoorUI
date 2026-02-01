import { useEffect, useState, useRef } from 'react';
import { Send, Shield, AlertTriangle, MessageSquare, MapPin, Loader, ChevronDown, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import EncryptedMessage from '@/components/EncryptedMessage';
import { encryptMessage } from '@/lib/encryption';
import { messageStore } from '@/lib/storage';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

// List of Indian states and their major cities
const INDIAN_STATES_CITIES: Record<string, string[]> = {
  'Andhra Pradesh': ['Hyderabad', 'Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tezpur', 'Tezu'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Nagaon', 'Barpeta'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Durg', 'Rajnandgaon', 'Bilaspur'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Gandhinagar'],
  'Haryana': ['Faridabad', 'Gurgaon', 'Hisar', 'Rohtak', 'Panipat'],
  'Himachal Pradesh': ['Shimla', 'Solan', 'Kangra', 'Mandi', 'Kullu'],
  'Jharkhand': ['Ranchi', 'Dhanbad', 'Giridih', 'Jamshedpur', 'Hazaribagh'],
  'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum'],
  'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Alappuzha'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Aurangabad'],
  'Manipur': ['Imphal', 'Bishnupur', 'Thoubal', 'Churachandpur', 'Senapati'],
  'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongstoin', 'Williamnagar'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Serchhip'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur', 'Balasore'],
  'Punjab': ['Chandigarh', 'Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Ajmer', 'Bikaner'],
  'Sikkim': ['Gangtok', 'Namchi', 'Geyzing', 'Mangan', 'Siliguri'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'],
  'Telangana': ['Hyderabad', 'Warangal', 'Karimnagar', 'Khammam', 'Nizamabad'],
  'Tripura': ['Agartala', 'Udaipur', 'Ambassa', 'Kailashahar', 'Dharmanagar'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Nainital', 'Rishikesh', 'Almora'],
  'West Bengal': ['Kolkata', 'Darjeeling', 'Asansol', 'Siliguri', 'Howrah'],
  'Jammu and Kashmir': ['Srinagar', 'Anantnag', 'Baramulla', 'Jammu', 'Pulwama'],
  'Ladakh': ['Leh', 'Kargil', 'Nubra', 'Khardung', 'Pangong'],
  'Delhi': ['New Delhi', 'Old Delhi', 'North Delhi', 'South Delhi', 'East Delhi'],
};

const INDIAN_STATES = Object.keys(INDIAN_STATES_CITIES).sort();

export type GovChatRole = 'civilian' | 'government';

type GovChatType = 'attack' | 'instruction' | 'general';

interface GovChatMessage {
  id: string;
  text: string;
  sender: string;
  role: GovChatRole;
  type: GovChatType;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  nearbyCount?: number;
}

interface GovCitizenChatProps {
  role: GovChatRole;
}

// Reverse geocoding: convert coordinates to location name
const getLocationName = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await response.json();
    return data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Unknown Location';
  } catch (error) {
    console.error('Geocoding error:', error);
    return 'Location';
  }
};

// Calculate distance between two coordinates in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function GovCitizenChat({ role }: GovCitizenChatProps) {
  const { language, user } = useApp();
  const { toast } = useToast();
  const [messages, setMessages] = useState<GovChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<GovChatType>(role === 'government' ? 'instruction' : 'general');
  const [isSending, setIsSending] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationSource, setLocationSource] = useState<'current' | 'manual'>('current');
  const [manualLocationName, setManualLocationName] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const locationWatchRef = useRef<number | null>(null);

  const handleReset = async () => {
    if (!confirm('Are you sure you want to clear all chat messages? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete all govchat messages
      const keysToDelete: string[] = [];
      await messageStore.iterate((value: any, key: string) => {
        if (key?.startsWith('govchat_')) {
          keysToDelete.push(key);
        }
      });

      for (const key of keysToDelete) {
        await messageStore.removeItem(key);
      }

      // Clear form and state
      setMessages([]);
      setNewMessage('');
      setMessageType(role === 'government' ? 'instruction' : 'general');
      setSelectedState('');
      setSelectedCity('');
      setManualLocationName('');
      setLocationSource('current');
      setShowSuggestions(false);

      // Dispatch update event
      window.dispatchEvent(new CustomEvent('govchat:updated'));

      toast({
        title: 'Chats Cleared',
        description: 'All chat messages have been deleted.',
      });
    } catch (error) {
      console.error('Error clearing chats:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear chats. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete the message
      await messageStore.removeItem(`govchat_${messageId}`);
      
      // Delete all government responses to this message
      await messageStore.iterate((value: any, key: string) => {
        if (key?.startsWith('govresponse_') && value.alertId === messageId) {
          messageStore.removeItem(key);
        }
      });

      // Update messages list
      setMessages(messages.filter(m => m.id !== messageId));
      
      // Dispatch update event
      window.dispatchEvent(new CustomEvent('govchat:updated'));
      
      toast({
        title: 'Message Deleted',
        description: 'The message has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const loadMessages = async () => {
      const all: GovChatMessage[] = [];
      await messageStore.iterate((value: any, key: string) => {
        if (key?.startsWith('govchat_')) {
          all.push(value as GovChatMessage);
        }
      });
      setMessages(all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    };

    loadMessages();
    const handleUpdate = () => loadMessages();
    window.addEventListener('govchat:updated', handleUpdate);
    const intervalId = window.setInterval(loadMessages, 3000);

    // Get user location on mount
    if ('geolocation' in navigator) {
      setIsLoadingLocation(true);
      locationWatchRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    return () => {
      window.removeEventListener('govchat:updated', handleUpdate);
      window.clearInterval(intervalId);
      if (locationWatchRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
      }
    };
  }, []);

  const getNearbyCount = async (lat: number, lon: number): Promise<number> => {
    let count = 0;
    await messageStore.iterate((value: any, key: string) => {
      if (key?.startsWith('govchat_') && value.latitude && value.longitude) {
        const distance = calculateDistance(lat, lon, value.latitude, value.longitude);
        if (distance <= 10 && distance > 0) {
          count++;
        }
      }
    });
    return count;
  };

  // Broadcast attack report to nearby civilians as notifications
  const broadcastAttackToNearby = async (message: GovChatMessage) => {
    if (!message.latitude || !message.longitude) return;

    // Create a notification alert for nearby citizens
    const alertId = `alert_${message.id}`;
    const alertData = {
      id: alertId,
      title: `CITIZEN ALERT: Attack reported in ${message.locationName}`,
      message: `A citizen has reported an attack. Stay alert and follow government instructions. Location: ${message.locationName}`,
      timestamp: new Date().toISOString(),
      type: 'threat',
      source: 'citizen_report',
      originLat: message.latitude,
      originLon: message.longitude,
    };

    await messageStore.setItem(`notif_${alertId}`, alertData);

    // Dispatch event to update all listeners
    window.dispatchEvent(new CustomEvent('public-alerts:updated'));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    // Validate location selection for attack reports
    if (messageType === 'attack') {
      if (locationSource === 'current' && !userLocation) {
        toast({ title: 'Location Required', description: 'Please enable location access to send attack report.' });
        return;
      }
      if (locationSource === 'manual' && !selectedState && !selectedCity) {
        toast({ title: 'Location Required', description: 'Please select state and city for family member location.' });
        return;
      }
    }

    setIsSending(true);
    const id = Date.now().toString();

    // For attack reports, include location
    let messageData: GovChatMessage = {
      id,
      text: newMessage.trim(),
      sender: user?.displayName || (role === 'government' ? 'Government Command' : 'Citizen'),
      role,
      type: messageType,
      timestamp: new Date().toISOString(),
    };

    // Add location for attack reports
    if (messageType === 'attack') {
      if (locationSource === 'current' && userLocation) {
        messageData.latitude = userLocation.lat;
        messageData.longitude = userLocation.lon;
        messageData.locationName = await getLocationName(userLocation.lat, userLocation.lon);
        const nearbyCount = await getNearbyCount(userLocation.lat, userLocation.lon);
        messageData.nearbyCount = nearbyCount;
      } else if (locationSource === 'manual' && selectedState && selectedCity) {
        messageData.locationName = `${selectedCity}, ${selectedState}`;
      }
    }

    await messageStore.setItem(`govchat_${id}`, messageData);
    setMessages([messageData, ...messages]);
    setNewMessage('');
    setSelectedState('');
    setSelectedCity('');
    setIsSending(false);
    window.dispatchEvent(new CustomEvent('govchat:updated'));

    // Broadcast attack report to nearby civilians
    if (messageType === 'attack' && role === 'civilian') {
      await broadcastAttackToNearby(messageData);
    }

    const locMsg = locationSource === 'current' 
      ? `from ${messageData.locationName}. ${messageData.nearbyCount || 0} citizens nearby`
      : `for family member at ${messageData.locationName}`;
    const msg = messageType === 'attack' 
      ? `Attack report sent ${locMsg} (within 10 km) will be notified.`
      : role === 'government' 
        ? 'Guidance delivered to civilians.' 
        : 'Your update has been sent to government.';

    toast({
      title: role === 'government' ? 'Instruction Sent' : messageType === 'attack' ? 'Attack Report Sent' : 'Message Sent',
      description: msg,
    });
  };

  const title = role === 'government' ? 'Citizen ↔ Government Chat' : 'Government ↔ Citizen Chat';
  const helper = role === 'government'
    ? 'Give instructions and respond to citizen reports.'
    : 'Report attacks and request guidance from government.';

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{helper}</p>
        </div>
      </div>

      <Card className="mb-6 border-primary/20 bg-muted/30">
        <CardContent className="pt-6">
          <form onSubmit={handleSendMessage} className="flex flex-col gap-4">
            <div className="flex gap-2 flex-wrap items-center">
              <label className="text-sm text-muted-foreground">Message type</label>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value as GovChatType)}
                className="border rounded-md px-2 py-1 text-sm bg-background"
              >
                <option value="general">General</option>
                {role === 'civilian' ? (
                  <option value="attack">Attack Report</option>
                ) : (
                  <option value="instruction">Instruction</option>
                )}
              </select>
              {role === 'civilian' && messageType === 'attack' && (
                <div className="flex items-center gap-1 text-xs">
                  {isLoadingLocation && locationSource === 'current' ? (
                    <>
                      <Loader className="h-3 w-3 animate-spin" />
                      <span className="text-muted-foreground">Getting location...</span>
                    </>
                  ) : userLocation && locationSource === 'current' ? (
                    <>
                      <MapPin className="h-3 w-3 text-green-600" />
                      <span className="text-green-600 font-semibold">Location ready</span>
                    </>
                  ) : locationSource === 'current' ? (
                    <>
                      <MapPin className="h-3 w-3 text-red-600" />
                      <span className="text-red-600">Location unavailable</span>
                    </>
                  ) : null}
                </div>
              )}
            </div>

            {role === 'civilian' && messageType === 'attack' && (
              <div className="border rounded-lg p-3 bg-background">
                <label className="text-sm font-medium block mb-3">Location Type</label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="current"
                      name="location"
                      value="current"
                      checked={locationSource === 'current'}
                      onChange={(e) => setLocationSource(e.target.value as 'current' | 'manual')}
                      className="w-4 h-4"
                    />
                    <label htmlFor="current" className="text-sm cursor-pointer">
                      Current Location (GPS)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="manual"
                      name="location"
                      value="manual"
                      checked={locationSource === 'manual'}
                      onChange={(e) => setLocationSource(e.target.value as 'current' | 'manual')}
                      className="w-4 h-4"
                    />
                    <label htmlFor="manual" className="text-sm cursor-pointer">
                      Family Member Location
                    </label>
                  </div>
                </div>

                {locationSource === 'manual' && (
                  <div className="mt-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">State</label>
                        <select
                          value={selectedState}
                          onChange={(e) => {
                            setSelectedState(e.target.value);
                            setSelectedCity('');
                          }}
                          className="border rounded-md px-2 py-2 text-sm bg-background w-full"
                        >
                          <option value="">Select State</option>
                          {INDIAN_STATES.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">City</label>
                        <select
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.target.value)}
                          disabled={!selectedState}
                          className="border rounded-md px-2 py-2 text-sm bg-background w-full disabled:opacity-50"
                        >
                          <option value="">Select City</option>
                          {selectedState && INDIAN_STATES_CITIES[selectedState]?.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {selectedState && selectedCity && (
                      <p className="text-xs text-green-600 font-medium">
                        <MapPin className="inline h-3 w-3 mr-1" />
                        Location: {selectedCity}, {selectedState}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder={role === 'government' ? 'Send guidance to civilians...' : 'Report an attack or ask for help...'}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="pr-10"
                />
                {messageType === 'attack' ? (
                  <AlertTriangle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                ) : (
                  <Shield className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <Button type="submit" disabled={isSending}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
              <Button type="button" variant="outline" onClick={handleReset} disabled={isSending}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4 overflow-auto flex-1 pb-6">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground py-10 italic">No messages yet.</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={msg.type === 'attack' ? 'destructive' : msg.type === 'instruction' ? 'default' : 'secondary'}>
                  {msg.type === 'attack' ? 'ATTACK REPORT' : msg.type === 'instruction' ? 'INSTRUCTION' : 'GENERAL'}
                </Badge>
                <Badge variant="outline">
                  {msg.role === 'government' ? 'GOV' : 'CITIZEN'}
                </Badge>
                {msg.locationName && (
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {msg.locationName}
                    {msg.nearbyCount !== undefined && msg.nearbyCount > 0 && (
                      <span className="ml-1">
                        · {msg.nearbyCount} nearby
                      </span>
                    )}
                  </Badge>
                )}
              </div>
              {msg.role === 'civilian' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteMessage(msg.id)}
                  className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                  title="Delete message"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <EncryptedMessage
              encrypted={encryptMessage(msg.text)}
              sender={msg.sender}
              timestamp={new Date(msg.timestamp).toLocaleTimeString()}
              currentLang={language}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
