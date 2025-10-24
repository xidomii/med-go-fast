import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Search, MapPin, List } from 'lucide-react';
import PracticesMap from '@/components/PracticesMap';
import PracticeCard from '@/components/PracticeCard';

interface Practice {
  id: string;
  name: string;
  specialty: string;
  address: string;
  city: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  phone: string;
  waitTime?: number;
}

const specialties = [
  'Allgemeinmedizin',
  'Augenheilkunde',
  'Chirurgie',
  'Dermatologie',
  'Gynäkologie',
  'HNO',
  'Innere Medizin',
  'Kardiologie',
  'Neurologie',
  'Orthopädie',
  'Pädiatrie',
  'Psychiatrie',
  'Urologie',
  'Zahnmedizin',
];

const PracticesOverview = () => {
  const navigate = useNavigate();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [filteredPractices, setFilteredPractices] = useState<Practice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'map'>('list');

  useEffect(() => {
    fetchPractices();
    subscribeToWaitTimes();
  }, []);

  useEffect(() => {
    filterPractices();
  }, [searchQuery, selectedSpecialty, practices]);

  const fetchPractices = async () => {
    try {
      const { data: practicesData, error: practicesError } = await supabase
        .from('practices')
        .select('*');

      if (practicesError) throw practicesError;

      const { data: waitTimesData, error: waitTimesError } = await supabase
        .from('wait_times')
        .select('practice_id, current_wait_minutes');

      if (waitTimesError) throw waitTimesError;

      // Combine practices with their wait times
      const practicesWithWaitTimes = practicesData?.map(practice => ({
        ...practice,
        waitTime: waitTimesData?.find(wt => wt.practice_id === practice.id)?.current_wait_minutes || 0
      }));

      setPractices(practicesWithWaitTimes || []);
      setFilteredPractices(practicesWithWaitTimes || []);
    } catch (error) {
      console.error('Error fetching practices:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToWaitTimes = () => {
    const channel = supabase
      .channel('wait_times_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wait_times'
        },
        (payload) => {
          const newPayload = payload.new as { practice_id: string; current_wait_minutes: number };
          if (newPayload && newPayload.practice_id) {
            setPractices(currentPractices =>
              currentPractices.map(practice =>
                practice.id === newPayload.practice_id
                  ? { ...practice, waitTime: newPayload.current_wait_minutes }
                  : practice
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filterPractices = () => {
    let filtered = [...practices];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(practice =>
        practice.name.toLowerCase().includes(query) ||
        practice.city.toLowerCase().includes(query) ||
        practice.address.toLowerCase().includes(query)
      );
    }

    if (selectedSpecialty && selectedSpecialty !== 'all') {
      filtered = filtered.filter(practice =>
        practice.specialty === selectedSpecialty
      );
    }

    setFilteredPractices(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Alle Arztpraxen</h1>
          <p className="text-muted-foreground">
            Durchsuchen Sie alle registrierten Arztpraxen und sehen Sie die aktuelle Wartezeit
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Suchen Sie nach Name, Ort oder Adresse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Fachrichtung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Fachrichtungen</SelectItem>
                {specialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'map')}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="list">
                <List className="w-4 h-4 mr-2" />
                Liste
              </TabsTrigger>
              <TabsTrigger value="map">
                <MapPin className="w-4 h-4 mr-2" />
                Karte
              </TabsTrigger>
            </TabsList>
            <p className="text-sm text-muted-foreground">
              {filteredPractices.length} Praxen gefunden
            </p>
          </div>

          <TabsContent value="list" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <p>Lädt Praxen...</p>
              ) : filteredPractices.length === 0 ? (
                <p>Keine Praxen gefunden</p>
              ) : (
                filteredPractices.map(practice => (
                  <PracticeCard
                    key={practice.id}
                    id={practice.id}
                    name={practice.name}
                    specialty={practice.specialty}
                    address={`${practice.address}, ${practice.city}`}
                    phone={practice.phone}
                    rating={4.5} // This should come from reviews
                    waitTime={practice.waitTime || 0}
                    // distance will be added later when user location is available
                    openNow={true} // This should be calculated based on opening hours
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="map">
            <PracticesMap
              practices={filteredPractices}
              onPracticeSelect={(practice) => navigate(`/practices/${practice.id}`)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PracticesOverview;