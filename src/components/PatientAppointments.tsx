import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { CalendarIcon, MapPin, Phone, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  appointment_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  practice: {
    name: string;
    address: string;
    city: string;
    phone: string;
  };
}

const PatientAppointments = ({ patientId }: { patientId: string }) => {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [patientId]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const now = new Date().toISOString();

      // Fetch upcoming appointments
      const { data: upcoming, error: upcomingError } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          status,
          practice:practices (
            name,
            address,
            city,
            phone
          )
        `)
        .eq('patient_id', patientId)
        .gte('appointment_date', now)
        .neq('status', 'cancelled')
        .order('appointment_date');

      if (upcomingError) throw upcomingError;

      // Fetch past appointments
      const { data: past, error: pastError } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          status,
          practice:practices (
            name,
            address,
            city,
            phone
          )
        `)
        .eq('patient_id', patientId)
        .lt('appointment_date', now)
        .order('appointment_date', { ascending: false })
        .limit(10);

      if (pastError) throw pastError;

      setUpcomingAppointments(upcoming || []);
      setPastAppointments(past || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Fehler beim Laden der Termine');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      setUpcomingAppointments(appointments =>
        appointments.filter(apt => apt.id !== selectedAppointment.id)
      );
      
      toast.success('Termin wurde storniert');
      setShowCancelDialog(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Fehler beim Stornieren des Termins');
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

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card
      className="p-4 hover:bg-muted/50 cursor-pointer"
      onClick={() => setSelectedAppointment(appointment)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">{appointment.practice.name}</div>
        <Badge className={getStatusBadgeColor(appointment.status)}>
          {getStatusText(appointment.status)}
        </Badge>
      </div>
      
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>
            {format(new Date(appointment.appointment_date), 'dd.MM.yyyy HH:mm')} Uhr
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{appointment.practice.address}, {appointment.practice.city}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <span>{appointment.practice.phone}</span>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Upcoming Appointments */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Bevorstehende Termine</h2>
        {loading ? (
          <p className="text-muted-foreground">Lädt Termine...</p>
        ) : upcomingAppointments.length === 0 ? (
          <Card className="p-4">
            <p className="text-muted-foreground">Keine bevorstehenden Termine</p>
            <Button className="mt-4" onClick={() => window.location.href = '/practices'}>
              Termin vereinbaren
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Vergangene Termine</h2>
        {loading ? (
          <p className="text-muted-foreground">Lädt Termine...</p>
        ) : pastAppointments.length === 0 ? (
          <Card className="p-4">
            <p className="text-muted-foreground">Keine vergangenen Termine</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pastAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </div>

      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Termindetails</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{selectedAppointment.practice.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedAppointment.appointment_date), 'dd. MMMM yyyy HH:mm', { locale: de })} Uhr
                </p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedAppointment.practice.address}, {selectedAppointment.practice.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{selectedAppointment.practice.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={getStatusBadgeColor(selectedAppointment.status)}>
                  {getStatusText(selectedAppointment.status)}
                </Badge>
              </div>
            </div>
            <DialogFooter>
              {selectedAppointment.status !== 'cancelled' && 
               selectedAppointment.status !== 'completed' && 
               new Date(selectedAppointment.appointment_date) > new Date() && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowCancelDialog(true);
                    setSelectedAppointment(null);
                  }}
                >
                  Termin stornieren
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Termin stornieren</DialogTitle>
            <DialogDescription>
              Möchten Sie diesen Termin wirklich stornieren? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={cancelAppointment}>
              Stornieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientAppointments;