import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { eventsAPI } from '../services/api';
import { useAuthStore } from '../store';
import type { Event } from '../types';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function MapPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const navigate = useNavigate();
  const { user } = useAuthStore();

  const categories = [
    { id: '', label: 'Все' },
    { id: 'culture', label: 'Культура' },
    { id: 'sport', label: 'Спорт' },
    { id: 'education', label: 'Образование' },
    { id: 'entertainment', label: 'Развлечения' },
  ];

  useEffect(() => {
    loadEvents();
  }, [selectedCategory]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getEvents(selectedCategory || undefined);
      setEvents(data.filter(e => e.latitude && e.longitude));
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Center on Saint Petersburg
  const center: [number, number] = [59.9343, 30.3351];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-white"
              >
                ← Назад
              </button>
              <h1 className="text-2xl font-bold text-white">Карта событий</h1>
            </div>
            <span className="text-gray-300">👋 {user?.username}</span>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map and Events List */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Map */}
        <div className="flex-1 h-[400px] lg:h-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center bg-slate-800">
              <p className="text-white">Загрузка карты...</p>
            </div>
          ) : (
            <MapContainer
              center={center}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {events.map((event) => (
                <Marker
                  key={event.id}
                  position={[event.latitude!, event.longitude!]}
                  eventHandlers={{
                    click: () => setSelectedEvent(event),
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold mb-1">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {event.description.substring(0, 100)}...
                        </p>
                      )}
                      {event.location && (
                        <p className="text-xs text-gray-500">📍 {event.location}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Events List */}
        <div className="w-full lg:w-96 bg-slate-800 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-xl font-bold text-white mb-4">
              События ({events.length})
            </h2>
            {loading ? (
              <p className="text-gray-400">Загрузка...</p>
            ) : events.length === 0 ? (
              <p className="text-gray-400">Нет событий</p>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedEvent?.id === event.id
                        ? 'bg-primary-600/20 border-2 border-primary-500'
                        : 'bg-slate-700 border-2 border-transparent hover:border-slate-600'
                    }`}
                  >
                    {event.image_url && (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="text-white font-semibold mb-1">
                      {event.title}
                    </h3>
                    {event.category && (
                      <span className="inline-block px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded mb-2">
                        {event.category}
                      </span>
                    )}
                    {event.description && (
                      <p className="text-gray-400 text-sm mb-2">
                        {event.description.substring(0, 100)}
                        {event.description.length > 100 && '...'}
                      </p>
                    )}
                    {event.location && (
                      <p className="text-gray-500 text-sm">📍 {event.location}</p>
                    )}
                    {event.start_date && (
                      <p className="text-gray-500 text-sm">
                        📅 {new Date(event.start_date).toLocaleDateString('ru-RU')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
