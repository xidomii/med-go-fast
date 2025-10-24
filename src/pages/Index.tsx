import { Button } from "@/components/ui/button";
import { MapPin, Bell, Calendar, Clock, Users, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import PracticeCard from "@/components/PracticeCard";
import FeatureCard from "@/components/FeatureCard";

const Index = () => {
  const navigate = useNavigate();
  const samplePractices = [
    {
      id: "1",
      name: "Dr. med. Schmidt",
      specialty: "Allgemeinmedizin",
      address: "Hauptstraße 42, 10115 Berlin",
      phone: "030 123456",
      rating: 4.8,
      waitTime: 10,
      distance: "0.5 km",
      openNow: true,
    },
    {
      id: "2",
      name: "Praxis Dr. Müller",
      specialty: "Innere Medizin",
      address: "Berliner Straße 89, 10115 Berlin",
      phone: "030 789012",
      rating: 4.6,
      waitTime: 25,
      distance: "1.2 km",
      openNow: true,
    },
    {
      id: "3",
      name: "Medizinisches Zentrum",
      specialty: "HNO & Allgemeinmedizin",
      address: "Friedrichstraße 15, 10115 Berlin",
      phone: "030 345678",
      rating: 4.9,
      waitTime: 45,
      distance: "2.1 km",
      openNow: true,
    },
  ];

  const features = [
    {
      icon: MapPin,
      title: "Praxen in Echtzeit finden",
      description: "Sieh alle Praxen in deiner Umgebung auf einer interaktiven Karte – farblich markiert nach aktueller Wartezeit.",
    },
    {
      icon: Clock,
      title: "Live-Wartezeiten",
      description: "Erfahre sofort, wo du am schnellsten drankommst. Keine bösen Überraschungen mehr.",
    },
    {
      icon: Bell,
      title: "Smart Benachrichtigungen",
      description: "Lass dich informieren, wenn sich Wartezeiten ändern oder ein Termin frei wird.",
    },
    {
      icon: Calendar,
      title: "Spontan Termin buchen",
      description: "Buche direkt einen Termin – auch kurzfristig für Akutpatienten ohne lange Warteschleifen.",
    },
    {
      icon: Users,
      title: "Detaillierte Profile",
      description: "Bewertungen, Öffnungszeiten, Spezialisierungen und beliebte Uhrzeiten auf einen Blick.",
    },
    {
      icon: Shield,
      title: "Für Praxen optimiert",
      description: "Dashboard für Praxen zur einfachen Verwaltung von Terminen, Urlaub und Patientenströmen.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-primary-foreground">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Wo du am schnellsten drankommst
              </h1>
              <p className="text-lg md:text-xl opacity-90">
                MediTime zeigt dir in Echtzeit alle Praxen in deiner Umgebung – mit Live-Wartezeiten, 
                Bewertungen und direkter Terminbuchung. Schnell, einfach, transparent.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button variant="secondary" size="lg" className="shadow-glow" onClick={() => navigate("/auth")}>
                  Jetzt starten
                </Button>
                <Button variant="outline" size="lg" className="bg-primary-foreground/10 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" onClick={() => navigate("/practices")}>
                  Praxen ansehen
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="MediTime App Interface" 
                className="rounded-2xl shadow-glow w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Alles, was du brauchst
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              MediTime gibt dir die Kontrolle zurück – damit du schneller an die richtige Praxis kommst.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Sample Practices Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Praxen in deiner Nähe
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Finde die perfekte Praxis – mit Live-Wartezeiten und allen wichtigen Informationen.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {samplePractices.map((practice, index) => (
              <PracticeCard key={index} {...practice} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6 text-primary-foreground">
            <h2 className="text-3xl md:text-5xl font-bold">
              Bereit für schnellere Arzttermine?
            </h2>
            <p className="text-lg md:text-xl opacity-90">
              Lade MediTime herunter und finde sofort die Praxis mit der kürzesten Wartezeit in deiner Nähe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button variant="secondary" size="lg" className="shadow-glow" onClick={() => navigate("/auth")}>
                Jetzt registrieren
              </Button>
              <Button variant="outline" size="lg" className="bg-primary-foreground/10 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" onClick={() => navigate("/practices")}>
                Praxen entdecken
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-background border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 MediTime. Schneller zur richtigen Praxis.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
