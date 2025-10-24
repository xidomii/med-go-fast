import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import PracticeDashboard from "@/components/PracticeDashboard";
import PracticeSettings from "@/components/PracticeSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface PracticeData {
  id: string;
  name: string;
  specialty: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
}

const PracticeAdmin = () => {
  const { user } = useAuth();
  const [practiceData, setPracticeData] = useState<PracticeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPracticeData = async () => {
      if (!user) return;

      try {
        // Erst prüfen ob eine Praxis für diesen Benutzer existiert
        const { data: practices, error: fetchError } = await supabase
          .from("practices")
          .select("*")
          .eq("owner_id", user.id);

        if (fetchError) {
          console.error("Error fetching practices:", fetchError);
          throw fetchError;
        }

        if (practices && practices.length > 0) {
          setPracticeData(practices[0]);
        } else {
          console.log("No practice found, creating new one...");
          // Wenn keine Praxis gefunden wurde, erstellen wir eine neue mit Basis-Daten
          const { data: newPractice, error: createError } = await supabase
            .from("practices")
            .insert([
              {
                owner_id: user.id,
                name: "Neue Praxis",
                specialty: "Allgemeinmedizin",
                address: "",
                city: "",
                postal_code: "",
                phone: "",
                email: user.email,
                latitude: null,
                longitude: null
              },
            ])
            .select();

          if (createError) {
            throw createError;
          }

          setPracticeData(newPractice);
          toast.success("Praxis wurde erfolgreich erstellt");
        }
      } catch (error: any) {
        console.error("Error fetching practice data:", error);
        toast.error(error.message || "Fehler beim Laden der Praxisdaten");
      } finally {
        setLoading(false);
      }
    };

    fetchPracticeData();
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Lädt Praxisdaten...</p>
      </div>
    );
  }

  if (!practiceData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Keine Praxisdaten gefunden</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Praxis Dashboard</h1>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <PracticeDashboard practice={practiceData} />
        </TabsContent>

        <TabsContent value="settings">
          <PracticeSettings
            practice={practiceData}
            onUpdate={(updatedData) => setPracticeData(updatedData)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PracticeAdmin;