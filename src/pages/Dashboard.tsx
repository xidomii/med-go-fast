import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PracticeDashboard from "@/components/PracticeDashboard";
import PatientAppointments from "@/components/PatientAppointments";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Lädt Profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/practices")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Mein Profil</h1>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Abmelden
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="p-6 bg-gradient-card">
            <h2 className="text-2xl font-bold mb-4">Profilinformationen</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{profile?.full_name || "Nicht angegeben"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">E-Mail</p>
                <p className="font-medium">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rolle</p>
                <p className="font-medium capitalize">{profile?.role}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefon</p>
                <p className="font-medium">{profile?.phone || "Nicht angegeben"}</p>
              </div>
            </div>
          </Card>

          {profile?.role === 'practice' && (
            <PracticeDashboard practiceId={user?.id || ''} />
          )}

          {profile?.role === 'patient' && (
            <PatientAppointments patientId={user?.id || ''} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
