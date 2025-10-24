import { useState, useEffect } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CalendarIcon, Clock, User, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Appointment {
  id: string;
  appointment_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  patient: {
    full_name: string;
    phone: string | null;
  };
}

const AppointmentDashboard = ({ practiceId }: { practiceId: string }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedDate) {
      fetchAppointments(selectedDate);
    }
  }, [selectedDate]);

  const fetchAppointments = async (date: Date) => {
    setLoading(true);
    try {
      const start = startOfDay(date).toISOString();
      const end = endOfDay(date).toISOString();

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          status,
          patient:profiles (
            full_name,
            phone
          )
        `)
        .eq('practice_id', practiceId)
        .gte('appointment_date', start)
        .lte('appointment_date', end)
        .order('appointment_date');

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Fehler beim Laden der Termine');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: newStatus as any } : apt
      ));
      
      toast.success('Terminstatus aktualisiert');
      setShowAppointmentDetails(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Fehler beim Aktualisieren des Termins');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-600';
      case 'confirmed':
        return 'bg-green-500/20 text-green-600';
      case 'cancelled':
        return 'bg-red-500/20 text-red-600';
      case 'completed':
        return 'bg-blue-500/20 text-blue-600';
      default:
        return 'bg-gray-500/20 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ausstehend';
      case 'confirmed':
        return 'Bestätigt';
      case 'cancelled':
        return 'Storniert';
      case 'completed':
        return 'Abgeschlossen';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Terminübersicht</h2>
          <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
            Heute
          </Button>
        </div>

        <div className="grid md:grid-cols-[300px,1fr] gap-6">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border w-full"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Termine am {format(selectedDate, 'dd. MMMM yyyy', { locale: de })}
            </h3>

            {loading ? (
              <p className="text-muted-foreground">Lädt Termine...</p>
            ) : appointments.length === 0 ? (
              <p className="text-muted-foreground">Keine Termine an diesem Tag</p>
            ) : (
              <div className="space-y-2">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setShowAppointmentDetails(true);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {format(new Date(appointment.appointment_date), 'HH:mm')} Uhr
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {appointment.patient.full_name}
                        </span>
                      </div>
                    </div>
                    <Badge className={getStatusBadgeColor(appointment.status)}>
                      {getStatusText(appointment.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {selectedAppointment && (
        <Dialog open={showAppointmentDetails} onOpenChange={setShowAppointmentDetails}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Termin Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{selectedAppointment.patient.full_name}</span>
                </div>
                {selectedAppointment.patient.phone && (
                  <div className="text-sm text-muted-foreground">
                    Tel: {selectedAppointment.patient.phone}
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">
                    {format(new Date(selectedAppointment.appointment_date), 'dd.MM.yyyy HH:mm')} Uhr
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Status: {getStatusText(selectedAppointment.status)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status ändern</label>
                <Select
                  value={selectedAppointment.status}
                  onValueChange={(value) => updateAppointmentStatus(selectedAppointment.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Ausstehend</SelectItem>
                    <SelectItem value="confirmed">Bestätigt</SelectItem>
                    <SelectItem value="completed">Abgeschlossen</SelectItem>
                    <SelectItem value="cancelled">Storniert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AppointmentDashboard;