import { useEffect, useRef, useState } from 'react';

interface YandexMapProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    coords: [number, number];
    title: string;
    description?: string;
  }>;
  onMarkerClick?: (index: number) => void;
}

export default function YandexMap({ 
  center, 
  zoom = 12, 
  markers = [],
  onMarkerClick 
}: YandexMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Yandex Maps API
    if (!window.ymaps) {
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=5a5c211d-0ae2-46ec-b0d9-da08e89ebddf&lang=ru_RU`;
      script.async = true;
      script.onload = () => {
        window.ymaps.ready(() => {
          setIsLoaded(true);
        });
      };
      document.head.appendChild(script);
    } else {
      window.ymaps.ready(() => {
        setIsLoaded(true);
      });
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // Create map
    const map = new window.ymaps.Map(mapRef.current, {
      center: center,
      zoom: zoom,
      controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
    });

    setMapInstance(map);

    return () => {
      map.destroy();
    };
  }, [isLoaded, center, zoom]);

  useEffect(() => {
    if (!mapInstance) return;

    // Clear existing markers
    mapInstance.geoObjects.removeAll();

    // Add markers
    markers.forEach((marker, index) => {
      const placemark = new window.ymaps.Placemark(
        marker.coords,
        {
          balloonContentHeader: marker.title,
          balloonContentBody: marker.description || '',
        },
        {
          preset: 'islands#blueCircleDotIcon'
        }
      );

      if (onMarkerClick) {
        placemark.events.add('click', () => {
          onMarkerClick(index);
        });
      }

      mapInstance.geoObjects.add(placemark);
    });
  }, [mapInstance, markers, onMarkerClick]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg"
      style={{ minHeight: '400px' }}
    />
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ymaps: any;
  }
}
