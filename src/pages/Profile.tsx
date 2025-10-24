import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: "patient" | "practice" | "admin";
}

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setProfileData(profile);
      } catch (error: any) {
        toast.error(error.message || "Fehler beim Laden des Profils");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
        })
        .eq("id", user?.id);

      if (error) throw error;
      toast.success("Profil wurde erfolgreich aktualisiert");
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Aktualisieren des Profils");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Lädt Profil...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Profil nicht gefunden</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Mein Profil</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Name</Label>
            <Input
              id="full_name"
              value={profileData.full_name}
              onChange={(e) =>
                setProfileData({ ...profileData, full_name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={profileData.phone || ""}
              onChange={(e) =>
                setProfileData({ ...profileData, phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Rolle</Label>
            <Input
              value={
                profileData.role === "practice"
                  ? "Praxis"
                  : profileData.role === "admin"
                  ? "Administrator"
                  : "Patient"
              }
              disabled
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Speichert..." : "Änderungen speichern"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Profile;