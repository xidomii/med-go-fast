import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PracticeSettings {
  id: string;
  name: string;
  specialty: string;
  description: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email: string | null;
  opening_hours: {
    [key: string]: {
      open: string;
      close: string;
      break_start?: string;
      break_end?: string;
    };
  };
  accepts_emergency: boolean;
}

const weekDays = [
  { id: 'monday', label: 'Montag' },
  { id: 'tuesday', label: 'Dienstag' },
  { id: 'wednesday', label: 'Mittwoch' },
  { id: 'thursday', label: 'Donnerstag' },
  { id: 'friday', label: 'Freitag' },
  { id: 'saturday', label: 'Samstag' },
  { id: 'sunday', label: 'Sonntag' },
];

const PracticeSettings = ({ practiceId }: { practiceId: string }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // placeholder for potential prefetch
  }, [practiceId]);

  return (
    <div className="space-y-6">
      <Card className="p-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Praxisverwaltung</h2>
        <Button onClick={() => navigate('/practice/dashboard')}>
          Dashboard
        </Button>
      </Card>
    </div>
  );
};

export default PracticeSettings;