import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, mapsAPI } from '../services/api';
import { useAuthStore } from '../store';
import YandexMap from '../components/YandexMap';
import type { Event } from '../types';

export default function MapPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [traffic, setTraffic] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [transportMode, setTransportMode] = useState<'auto' | 'pedestrian' | 'transit'>('auto');
  
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Saint Petersburg center coordinates
  const [mapCenter] = useState<[number, number]>([59.9343, 30.3351]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load events
      const eventsData = await eventsAPI.getEvents();
      setEvents(eventsData);

      // Load traffic info
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
      // Use map center as starting point (user's location)
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

  const handleLogout = () => {
    logout();
    navigate('/');
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка карты...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">LifeBalance SPb</h1>
              <nav className="hidden md:flex gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-400 hover:text-white transition"
                >
                  Главная
                </button>
                <button
                  onClick={() => navigate('/map')}
                  className="text-primary-400 font-medium"
                >
                  Карта
                </button>
                <button
                  onClick={() => navigate('/chat')}
                  className="text-gray-400 hover:text-white transition"
                >
                  AI Чат
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-gray-400 hover:text-white transition"
                >
                  Профиль
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-300">{user?.username}</span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition"
              >
                Выход
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">События на карте</h2>
                {traffic && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">Пробки:</span>
                    <span className={`text-sm font-medium ${
                      traffic.level <= 4 ? 'text-green-400' :
                      traffic.level <= 7 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {traffic.description}
                    </span>
                  </div>
                )}
              </div>
              
              <YandexMap
                center={mapCenter}
                zoom={12}
                markers={markers}
                onMarkerClick={handleMarkerClick}
              />
            </div>
          </div>

          {/* Event Details & Route */}
          <div className="lg:col-span-1">
            {selectedEvent ? (
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  {selectedEvent.title}
                </h3>
                
                {selectedEvent.image_url && (
                  <img
                    src={selectedEvent.image_url}
                    alt={selectedEvent.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                
                {selectedEvent.description && (
                  <p className="text-gray-300 text-sm mb-4">
                    {selectedEvent.description}
                  </p>
                )}
                
                {selectedEvent.location && (
                  <div className="flex items-start gap-2 mb-4">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-400 text-sm">{selectedEvent.location}</span>
                  </div>
                )}

                {selectedEvent.start_date && (
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-400 text-sm">
                      {new Date(selectedEvent.start_date).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                )}

                <div className="border-t border-slate-700 pt-4 mt-4">
                  <h4 className="text-white font-medium mb-3">Построить маршрут</h4>
                  
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setTransportMode('auto')}
                      className={`flex-1 py-2 px-3 rounded transition ${
                        transportMode === 'auto'
                          ? 'bg-primary-500 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      🚗 Авто
                    </button>
                    <button
                      onClick={() => setTransportMode('pedestrian')}
                      className={`flex-1 py-2 px-3 rounded transition ${
                        transportMode === 'pedestrian'
                          ? 'bg-primary-500 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      🚶 Пешком
                    </button>
                    <button
                      onClick={() => setTransportMode('transit')}
                      className={`flex-1 py-2 px-3 rounded transition ${
                        transportMode === 'transit'
                          ? 'bg-primary-500 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      🚌 Транспорт
                    </button>
                  </div>

                  <button
                    onClick={handleBuildRoute}
                    className="w-full bg-primary-500 text-white py-2 px-4 rounded hover:bg-primary-600 transition"
                  >
                    Построить маршрут
                  </button>

                  {routeInfo && (
                    <div className="mt-4 p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Расстояние:</span>
                        <span className="text-white font-medium">{routeInfo.distance} км</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Время в пути:</span>
                        <span className="text-white font-medium">{routeInfo.duration} мин</span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedEvent.source_url && (
                  <a
                    href={selectedEvent.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-4 text-primary-400 hover:text-primary-300 text-sm text-center"
                  >
                    Подробнее →
                  </a>
                )}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg p-6">
                <p className="text-gray-400 text-center">
                  Выберите событие на карте
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Events List */}
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-white mb-4">Все события</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`bg-slate-800 rounded-lg p-4 cursor-pointer transition ${
                  selectedEvent?.id === event.id
                    ? 'ring-2 ring-primary-500'
                    : 'hover:bg-slate-700'
                }`}
              >
                {event.image_url && (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="text-white font-medium mb-2">{event.title}</h3>
                {event.location && (
                  <p className="text-gray-400 text-sm">{event.location}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
