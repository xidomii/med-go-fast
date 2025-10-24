import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { CalendarIcon, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AppointmentBookingProps {
  practiceId: string;
  practiceName: string;
}

const AppointmentBooking = ({ practiceId, practiceName }: AppointmentBookingProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateTimeSlots = (date: Date) => {
    const slots: string[] = [];
    const start = new Date(date);
    start.setHours(8, 0, 0); // Start at 8 AM
    const end = new Date(date);
    end.setHours(17, 0, 0); // End at 5 PM

    while (start < end) {
      slots.push(
        start.toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
      start.setMinutes(start.getMinutes() + 30); // 30-minute slots
    }

    return slots;
  };

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    
    // Here we would normally fetch available slots from the backend
    // For now, we'll generate some slots and filter out booked ones
    setIsLoading(true);
    try {
      const slots = generateTimeSlots(date);
      
      // Fetch existing appointments for this date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: existingAppointments, error } = await supabase
        .from('appointments')
        .select('appointment_date')
        .eq('practice_id', practiceId)
        .gte('appointment_date', startOfDay.toISOString())
        .lte('appointment_date', endOfDay.toISOString());

      if (error) throw error;

      // Filter out booked slots
      const bookedTimes = new Set(
        existingAppointments?.map((app) =>
          new Date(app.appointment_date).toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        ) || []
      );

      setAvailableSlots(slots.filter((slot) => !bookedTimes.has(slot)));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Fehler beim Laden der verfügbaren Termine');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !user) {
      toast.error('Bitte wählen Sie Datum und Uhrzeit aus');
      return;
    }

    setIsLoading(true);
    try {
      const appointmentDate = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes));

      const { error } = await supabase.from('appointments').insert({
        practice_id: practiceId,
        patient_id: user.id,
        appointment_date: appointmentDate.toISOString(),
        status: 'pending'
      });

      if (error) throw error;

      toast.success('Termin erfolgreich gebucht!');
      setIsOpen(false);
      setSelectedDate(undefined);
      setSelectedTime(undefined);
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Fehler bei der Terminbuchung');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Termin buchen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Termin buchen</DialogTitle>
          <DialogDescription>
            Wählen Sie einen Termin bei {practiceName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => 
                date < new Date() || // Disable past dates
                date.getDay() === 0 || // Disable Sundays
                date.getDay() === 6 // Disable Saturdays
              }
              className="rounded-md border"
            />
          </div>

          {selectedDate && (
            <div className="grid gap-2">
              <label className="text-sm font-medium">Uhrzeit</label>
              <Select
                value={selectedTime}
                onValueChange={setSelectedTime}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie eine Uhrzeit">
                    {selectedTime ? (
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {selectedTime} Uhr
                      </div>
                    ) : (
                      "Wählen Sie eine Uhrzeit"
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot} Uhr
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button 
            onClick={handleBookAppointment}
            disabled={!selectedDate || !selectedTime || isLoading}
          >
            {isLoading ? 'Wird gebucht...' : 'Termin buchen'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentBooking;