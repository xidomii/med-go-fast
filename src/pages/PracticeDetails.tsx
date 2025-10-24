import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Calendar as CalendarIcon, MapPin, Phone, Clock, Star } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import WaitTimeIndicator from '@/components/WaitTimeIndicator';

type Practice = Database['public']['Tables']['practices']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];

const PracticeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [practice, setPractice] = useState<Practice | null>(null);
  const [waitTime, setWaitTime] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchPracticeDetails();
    subscribeToWaitTimes();
  }, [id]);

  const fetchPracticeDetails = async () => {
    try {
      const { data: practiceData, error: practiceError } = await supabase
        .from('practices')
        .select('*')
        .eq('id', id)
        .single();

      if (practiceError) throw practiceError;

      const { data: waitTimeData, error: waitTimeError } = await supabase
        .from('wait_times')
        .select('current_wait_minutes')
        .eq('practice_id', id)
        .single();

      if (waitTimeError && waitTimeError.code !== 'PGRST116') throw waitTimeError;

      setPractice(practiceData);
      if (waitTimeData) setWaitTime(waitTimeData.current_wait_minutes);
    } catch (error) {
      console.error('Error fetching practice details:', error);
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
          table: 'wait_times',
          filter: `practice_id=eq.${id}`,
        },
        (payload) => {
          if (payload.new && 'current_wait_minutes' in payload.new) {
            setWaitTime(payload.new.current_wait_minutes as number);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date || !practice) return;
    setSelectedDate(date);
    
    // Here you would fetch available time slots for the selected date
    // This is a placeholder - implement actual slot fetching logic
    const slots = generateTimeSlots(date, practice.opening_hours as any);
    setAvailableSlots(slots);
  };

  const generateTimeSlots = (date: Date, openingHours: any) => {
    // This is a placeholder - implement actual slot generation logic based on
    // opening hours and existing appointments
    const slots = [];
    const start = new Date(date);
    start.setHours(9, 0, 0);
    const end = new Date(date);
    end.setHours(17, 0, 0);

    while (start < end) {
      slots.push(start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
      start.setMinutes(start.getMinutes() + 30);
    }

    return slots;
  };

  const handleBookAppointment = async (timeSlot: string) => {
    if (!user || !practice || !selectedDate) return;

    try {
      const appointmentDate = new Date(selectedDate);
      const [hours, minutes] = timeSlot.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes));

      const { error } = await supabase.from('appointments').insert({
        practice_id: practice.id,
        patient_id: user.id,
        appointment_date: appointmentDate.toISOString(),
        status: 'pending',
      });

      if (error) throw error;

      // Show success message and close dialog
      setIsBookingOpen(false);
      // You might want to show a toast message here
    } catch (error) {
      console.error('Error booking appointment:', error);
      // Show error message
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Lädt Praxisdetails...</p>
      </div>
    );
  }

  if (!practice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Praxis nicht gefunden</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/practices')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{practice.name}</h1>
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{practice.name}</h2>
                <p className="text-muted-foreground mb-4">{practice.specialty}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{practice.address}, {practice.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{practice.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Aktuelle Wartezeit:</span>
                    <WaitTimeIndicator waitTime={waitTime} size="sm" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Beschreibung</h3>
                <p className="text-muted-foreground mb-4">{practice.description || 'Keine Beschreibung verfügbar.'}</p>
                
                {user && user.id !== practice.owner_id && (
                  <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Termin buchen
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Termin buchen</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          className="rounded-md border"
                        />
                        {selectedDate && availableSlots.length > 0 && (
                          <div className="grid grid-cols-2 gap-2">
                            {availableSlots.map((slot) => (
                              <Button
                                key={slot}
                                variant="outline"
                                onClick={() => handleBookAppointment(slot)}
                              >
                                {slot}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </Card>

          <Tabs defaultValue="hours" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hours">Öffnungszeiten</TabsTrigger>
              <TabsTrigger value="reviews">Bewertungen</TabsTrigger>
            </TabsList>
            <TabsContent value="hours">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Öffnungszeiten</h3>
                {/* Implement opening hours display */}
                <p className="text-muted-foreground">Öffnungszeiten werden hier angezeigt...</p>
              </Card>
            </TabsContent>
            <TabsContent value="reviews">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Bewertungen</h3>
                {/* Implement reviews display */}
                <p className="text-muted-foreground">Bewertungen werden hier angezeigt...</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default PracticeDetails;