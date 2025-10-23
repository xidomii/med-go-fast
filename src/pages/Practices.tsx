import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";
import PracticeCard from "@/components/PracticeCard";

interface Practice {
  id: string;
  name: string;
  specialty: string;
  address: string;
  city: string;
  phone: string;
  latitude: number;
  longitude: number;
  description: string;
}

interface WaitTime {
  practice_id: string;
  current_wait_minutes: number;
}

const Practices = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [waitTimes, setWaitTimes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchData();
    subscribeToWaitTimes();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const { data: practicesData, error: practicesError } = await supabase
        .from("practices")
        .select("*");

      if (practicesError) throw practicesError;

      const { data: waitTimesData, error: waitTimesError } = await supabase
        .from("wait_times")
        .select("practice_id, current_wait_minutes");

      if (waitTimesError) throw waitTimesError;

      setPractices(practicesData || []);
      
      const waitTimesMap: Record<string, number> = {};
      waitTimesData?.forEach((wt: WaitTime) => {
        waitTimesMap[wt.practice_id] = wt.current_wait_minutes;
      });
      setWaitTimes(waitTimesMap);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToWaitTimes = () => {
    const channel = supabase
      .channel("wait_times_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wait_times",
        },
        (payload) => {
          if (payload.new && typeof payload.new === "object" && "practice_id" in payload.new) {
            const newWaitTime = payload.new as WaitTime;
            setWaitTimes((prev) => ({
              ...prev,
              [newWaitTime.practice_id]: newWaitTime.current_wait_minutes,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const calculateDistance = (lat: number, lon: number) => {
    const distance = Math.random() * 3;
    return `${distance.toFixed(1)} km`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Lädt Praxen...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">MediTime</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <User className="w-4 h-4 mr-2" />
              Profil
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Praxen in deiner Nähe</h2>
          <p className="text-muted-foreground">
            {practices.length} Praxen gefunden • Live-Wartezeiten
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practices.map((practice) => (
            <PracticeCard
              key={practice.id}
              name={practice.name}
              specialty={practice.specialty}
              address={`${practice.address}, ${practice.city}`}
              phone={practice.phone}
              rating={4.5 + Math.random() * 0.5}
              waitTime={waitTimes[practice.id] || 15}
              distance={calculateDistance(practice.latitude, practice.longitude)}
              openNow={true}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Practices;
