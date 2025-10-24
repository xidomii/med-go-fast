import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Setzen Sie Ihren Mapbox Access Token
const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
console.log('Mapbox Token:', token); // Temporär zum Debuggen
if (!token) {
  console.error('Mapbox Access Token ist nicht gesetzt!');
}
mapboxgl.accessToken = token || '';

interface Practice {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  specialty: string;
  waitTime?: number;
}

interface PracticesMapProps {
  practices: Practice[];
  onPracticeSelect?: (practice: Practice) => void;
}

const getWaitTimeColor = (waitTime: number): string => {
  if (waitTime <= 15) return '#10b981'; // Grün für kurze Wartezeit
  if (waitTime <= 30) return '#f59e0b'; // Gelb für mittlere Wartezeit
  return '#ef4444'; // Rot für lange Wartezeit
};

const PracticesMap = ({ practices, onPracticeSelect }: PracticesMapProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialisiere die Karte
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [10.4515, 51.1657], // Zentrum von Deutschland
      zoom: 6
    });

    map.current.on('load', () => {
      setLoading(false);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || loading) return;

    // Entferne existierende Marker
    const markers = document.getElementsByClassName('mapboxgl-marker');
    while (markers[0]) {
      markers[0].remove();
    }

    // Füge neue Marker hinzu
    practices.forEach((practice) => {
      if (!practice.latitude || !practice.longitude) return;

      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = getWaitTimeColor(practice.waitTime || 0);
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1)';
      el.style.cursor = 'pointer';

      // Erstelle einen Popup für die Praxisinformationen
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <strong>${practice.name}</strong><br>
        ${practice.specialty}<br>
        Wartezeit: ${practice.waitTime || 'keine Angabe'} min
      `);

      // Erstelle und füge den Marker hinzu
      new mapboxgl.Marker(el)
        .setLngLat([practice.longitude, practice.latitude])
        .setPopup(popup)
        .addTo(map.current);

      // Event-Handler für Klicks
      el.addEventListener('click', () => {
        if (onPracticeSelect) {
          onPracticeSelect(practice);
        }
      });
    });

    // Passe die Kartengrenzen an
    if (practices.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      practices.forEach(practice => {
        if (practice.latitude && practice.longitude) {
          bounds.extend([practice.longitude, practice.latitude]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [practices, loading, onPracticeSelect]);

  return (
    <Card className="relative w-full h-[600px] overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </Card>
  );
};

export default PracticesMap;