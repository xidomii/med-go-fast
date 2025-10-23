import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Star, Clock } from "lucide-react";
import WaitTimeIndicator from "./WaitTimeIndicator";

interface PracticeCardProps {
  name: string;
  specialty: string;
  address: string;
  phone: string;
  rating: number;
  waitTime: number;
  distance: string;
  openNow: boolean;
}

const PracticeCard = ({
  name,
  specialty,
  address,
  phone,
  rating,
  waitTime,
  distance,
  openNow,
}: PracticeCardProps) => {
  return (
    <Card className="p-5 hover:shadow-soft transition-all duration-300 bg-gradient-card border-border">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{specialty}</p>
          </div>
          <WaitTimeIndicator waitTime={waitTime} size="sm" />
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{address} • {distance}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className={openNow ? "text-success font-medium" : "text-muted-foreground"}>
                {openNow ? "Geöffnet" : "Geschlossen"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="default" className="flex-1">
            Termin buchen
          </Button>
          <Button variant="outline" className="flex-1">
            Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PracticeCard;
