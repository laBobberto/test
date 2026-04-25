import { useState, useEffect } from 'react';
import { eventsAPI, mapsAPI } from '../services/api';
import Navigation from '../components/Navigation';
import YandexMap from '../components/YandexMap';
import type { Event } from '../types';

export default function MapPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [traffic, setTraffic] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [transportMode, setTransportMode] = useState<'auto' | 'pedestrian' | 'transit'>('auto');

  const [mapCenter] = useState<[number, number]>([59.9343, 30.3351]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const eventsData = await eventsAPI.getEvents();
      setEvents(eventsData);
      const trafficData = await mapsAPI.getTraffic();
      setTraffic(trafficData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (index: number) => {
    setSelectedEvent(events[index]);
    setRouteInfo(null);
  };

  const handleBuildRoute = async () => {
    if (!selectedEvent || !selectedEvent.latitude || !selectedEvent.longitude) return;

    try {
      const route = await mapsAPI.getRoute(
        mapCenter[0],
        mapCenter[1],
        selectedEvent.latitude,
        selectedEvent.longitude,
        transportMode
      );
      setRouteInfo(route);
    } catch (error) {
      console.error('Error building route:', error);
    }
  };

  const markers = events
    .filter(e => e.latitude && e.longitude)
    .map(e => ({
      coords: [e.latitude!, e.longitude!] as [number, number],
      title: e.title,
      description: e.description || ''
    }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center brutal-grid">
        <div className="text-center">
          <div className="text-5xl mb-4 syne font-bold gradient-text">Загрузка карты</div>
          <div className="h-1 w-32 bg-[var(--accent-primary)] mx-auto animate-pulse rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen brutal-grid">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold syne gradient-text">События на карте</h2>
                {traffic && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Пробки:
                    </span>
                    <span className={`text-sm font-bold ${
                      traffic.level <= 4 ? 'text-green-500' :
                      traffic.level <= 7 ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {traffic.description}
                    </span>
                  </div>
                )}
              </div>

              <div className="h-[500px] rounded-xl overflow-hidden">
                <YandexMap
                  center={mapCenter}
                  zoom={12}
                  markers={markers}
                  onMarkerClick={handleMarkerClick}
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="lg:col-span-1">
            {selectedEvent ? (
              <div className="card">
                <h3 className="text-xl font-bold syne mb-4">
                  {selectedEvent.title}
                </h3>

                {selectedEvent.image_url && (
                  <img
                    src={selectedEvent.image_url}
                    alt={selectedEvent.title}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                )}

                {selectedEvent.description && (
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {selectedEvent.description}
                  </p>
                )}

                {selectedEvent.location && (
                  <div className="flex items-start gap-2 mb-4">
                    <span className="text-lg">📍</span>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {selectedEvent.location}
                    </span>
                  </div>
                )}

                {selectedEvent.start_date && (
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-lg">📅</span>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(selectedEvent.start_date).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                )}

                <div className="border-t border-[var(--border-primary)] pt-6">
                  <h4 className="font-semibold mb-4">Построить маршрут</h4>

                  <div className="flex gap-2 mb-4">
                    {[
                      { mode: 'auto' as const, label: 'Авто', icon: '🚗' },
                      { mode: 'pedestrian' as const, label: 'Пешком', icon: '🚶' },
                      { mode: 'transit' as const, label: 'Транспорт', icon: '🚌' }
                    ].map(({ mode, label, icon }) => (
                      <button
                        key={mode}
                        onClick={() => setTransportMode(mode)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                          transportMode === mode
                            ? 'bg-[var(--accent-primary)] text-white'
                            : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)]'
                        }`}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleBuildRoute}
                    className="btn-primary w-full"
                  >
                    Построить маршрут
                  </button>

                  {routeInfo && (
                    <div className="mt-4 p-4 bg-[var(--bg-tertiary)] rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Расстояние:
                        </span>
                        <span className="font-bold">{routeInfo.distance} км</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Время в пути:
                        </span>
                        <span className="font-bold">{routeInfo.duration} мин</span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedEvent.source_url && (
                  <a
                    href={selectedEvent.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-4 text-center text-sm font-semibold hover:underline"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    Подробнее →
                  </a>
                )}
              </div>
            ) : (
              <div className="card text-center py-16">
                <div className="text-5xl mb-4 opacity-30">📍</div>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Выберите событие на карте
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Events List */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold syne gradient-text mb-6">Все события</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`card card-hover cursor-pointer ${
                  selectedEvent?.id === event.id
                    ? 'ring-2 ring-[var(--accent-primary)]'
                    : ''
                }`}
              >
                {event.image_url && (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-semibold mb-2">{event.title}</h3>
                {event.location && (
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {event.location}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
