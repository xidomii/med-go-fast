import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppointmentDashboard from './AppointmentDashboard';
import PracticeSettings from './PracticeSettings';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PracticeDashboardProps {
  practiceId: string;
  currentWaitTime?: number;
}

const PracticeDashboard = ({ practiceId, currentWaitTime = 0 }: PracticeDashboardProps) => {
  const [waitTime, setWaitTime] = useState(currentWaitTime);
  const [isUpdatingWaitTime, setIsUpdatingWaitTime] = useState(false);
  const [showHoursEditor, setShowHoursEditor] = useState(false);

  const updateWaitTime = async () => {
    setIsUpdatingWaitTime(true);
    try {
      const { error } = await supabase
        .from('wait_times')
        .upsert({
          practice_id: practiceId,
          current_wait_minutes: waitTime,
        })
        .eq('practice_id', practiceId);

      if (error) throw error;

      toast.success('Wartezeit aktualisiert');
    } catch (error) {
      console.error('Error updating wait time:', error);
      toast.error('Fehler beim Aktualisieren der Wartezeit');
    } finally {
      setIsUpdatingWaitTime(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Aktuelle Wartezeit</h2>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label htmlFor="waitTime">Wartezeit in Minuten</Label>
            <Input
              id="waitTime"
              type="number"
              min="0"
              value={waitTime}
              onChange={(e) => setWaitTime(parseInt(e.target.value) || 0)}
            />
          </div>
          <Button
            onClick={updateWaitTime}
            disabled={isUpdatingWaitTime}
          >
            {isUpdatingWaitTime ? 'Wird aktualisiert...' : 'Aktualisieren'}
          </Button>
        </div>
      </Card>

      <AppointmentDashboard practiceId={practiceId} />

      <PracticeSettings practiceId={practiceId} />
    </div>
  );
};

// Komponente für die Terminliste
const AppointmentList = ({ practiceId }: { practiceId: string }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Implementierung der Terminliste hier...
  return (
    <div className="space-y-2">
      {loading ? (
        <p className="text-muted-foreground">Lädt Termine...</p>
      ) : appointments.length === 0 ? (
        <p className="text-muted-foreground">Keine Termine für heute</p>
      ) : (
        appointments.map((appointment) => (
          <div key={appointment.id} className="flex items-center justify-between p-2 border rounded">
            {/* Appointment details */}
          </div>
        ))
      )}
    </div>
  );
};

// Komponente für den Öffnungszeiten-Editor
const OpeningHoursEditor = ({
  practiceId,
  open,
  onOpenChange,
}: {
  practiceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Öffnungszeiten bearbeiten</DialogTitle>
        </DialogHeader>
        {/* Implementierung des Öffnungszeiten-Editors hier */}
      </DialogContent>
    </Dialog>
  );
};

export default PracticeDashboard;