"""Yandex Maps API integration"""
import httpx
from typing import Dict, Any, List, Optional
from config import settings

class YandexMapsClient:
    """Client for Yandex Maps API"""
    
    def __init__(self):
        self.api_key = settings.YANDEX_MAPS_API_KEY
        self.geocoder_url = settings.YANDEX_GEOCODER_URL
        
    async def geocode(self, address: str) -> Optional[Dict[str, Any]]:
        """
        Geocode address to coordinates
        
        Args:
            address: Address string to geocode
            
        Returns:
            Dict with lat, lon, formatted_address or None
        """
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                params = {
                    'apikey': self.api_key,
                    'geocode': address,
                    'format': 'json',
                    'results': 1
                }
                
                response = await client.get(self.geocoder_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                # Parse Yandex Geocoder response
                feature_member = data.get('response', {}).get('GeoObjectCollection', {}).get('featureMember', [])
                
                if not feature_member:
                    return None
                
                geo_object = feature_member[0].get('GeoObject', {})
                point = geo_object.get('Point', {}).get('pos', '').split()
                
                if len(point) != 2:
                    return None
                
                return {
                    'lat': float(point[1]),
                    'lon': float(point[0]),
                    'formatted_address': geo_object.get('metaDataProperty', {}).get('GeocoderMetaData', {}).get('text', address)
                }
                
            except Exception as e:
                print(f"Geocoding error: {e}")
                return None
    
    async def reverse_geocode(self, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        """
        Reverse geocode coordinates to address
        
        Args:
            lat: Latitude
            lon: Longitude
            
        Returns:
            Dict with address information or None
        """
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                params = {
                    'apikey': self.api_key,
                    'geocode': f'{lon},{lat}',
                    'format': 'json',
                    'results': 1
                }
                
                response = await client.get(self.geocoder_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                feature_member = data.get('response', {}).get('GeoObjectCollection', {}).get('featureMember', [])
                
                if not feature_member:
                    return None
                
                geo_object = feature_member[0].get('GeoObject', {})
                metadata = geo_object.get('metaDataProperty', {}).get('GeocoderMetaData', {})
                address = metadata.get('Address', {})
                
                return {
                    'formatted_address': metadata.get('text', ''),
                    'country': address.get('country_code', ''),
                    'city': address.get('locality', ''),
                    'street': address.get('street', ''),
                    'house': address.get('house', '')
                }
                
            except Exception as e:
                print(f"Reverse geocoding error: {e}")
                return None
    
    async def get_route(
        self, 
        from_coords: tuple[float, float], 
        to_coords: tuple[float, float],
        mode: str = 'auto'
    ) -> Optional[Dict[str, Any]]:
        """
        Get route between two points
        
        Args:
            from_coords: (lat, lon) starting point
            to_coords: (lat, lon) destination
            mode: Transport mode (auto, pedestrian, transit)
            
        Returns:
            Dict with route information or None
        """
        # Note: Yandex Routes API requires separate API key and different endpoint
        # For MVP, we'll return estimated data based on distance
        
        # Calculate approximate distance (Haversine formula)
        from math import radians, sin, cos, sqrt, atan2
        
        lat1, lon1 = from_coords
        lat2, lon2 = to_coords
        
        R = 6371  # Earth radius in km
        
        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)
        
        a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        distance = R * c
        
        # Estimate time based on mode
        speed_map = {
            'auto': 40,  # km/h average in city
            'pedestrian': 5,  # km/h
            'transit': 25  # km/h average
        }
        
        speed = speed_map.get(mode, 40)
        duration_hours = distance / speed
        duration_minutes = int(duration_hours * 60)
        
        return {
            'distance': round(distance, 2),
            'duration': duration_minutes,
            'mode': mode,
            'from': from_coords,
            'to': to_coords
        }
    
    async def get_traffic(self, city: str = 'Saint Petersburg') -> Optional[Dict[str, Any]]:
        """
        Get traffic information for city
        
        Args:
            city: City name
            
        Returns:
            Dict with traffic level (1-10) or None
        """
        # Note: Yandex Traffic API requires separate integration
        # For MVP, return mock data
        
        import random
        from datetime import datetime
        
        # Simulate traffic based on time of day
        hour = datetime.now().hour
        
        if 7 <= hour <= 10 or 17 <= hour <= 20:
            # Rush hour
            level = random.randint(6, 9)
        elif 22 <= hour or hour <= 6:
            # Night
            level = random.randint(1, 3)
        else:
            # Normal
            level = random.randint(3, 6)
        
        return {
            'city': city,
            'level': level,
            'description': self._get_traffic_description(level),
            'timestamp': datetime.now().isoformat()
        }
    
    def _get_traffic_description(self, level: int) -> str:
        """Get traffic description by level"""
        if level <= 2:
            return 'Дороги свободны'
        elif level <= 4:
            return 'Небольшие пробки'
        elif level <= 6:
            return 'Средние пробки'
        elif level <= 8:
            return 'Серьезные пробки'
        else:
            return 'Город стоит'

yandex_maps_client = YandexMapsClient()
