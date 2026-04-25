"""OpenWeatherMap API integration"""
import httpx
from typing import Dict, Any, Optional
from config import settings

class WeatherAPI:
    """Client for OpenWeatherMap API"""
    
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
        self.base_url = settings.OPENWEATHER_API_URL
        
    async def get_current_weather(self, city: str = 'Saint Petersburg') -> Optional[Dict[str, Any]]:
        """
        Get current weather for a city
        
        Args:
            city: City name
            
        Returns:
            Weather data or None
        """
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                params = {
                    'q': city,
                    'appid': self.api_key,
                    'units': 'metric',
                    'lang': 'ru'
                }
                
                response = await client.get(f'{self.base_url}/weather', params=params)
                response.raise_for_status()
                data = response.json()
                
                return {
                    'temperature': round(data['main']['temp']),
                    'feels_like': round(data['main']['feels_like']),
                    'description': data['weather'][0]['description'],
                    'icon': data['weather'][0]['icon'],
                    'humidity': data['main']['humidity'],
                    'wind_speed': round(data['wind']['speed']),
                    'city': data['name']
                }
                
            except Exception as e:
                print(f"Weather API error: {e}")
                return None
    
    async def get_forecast(self, city: str = 'Saint Petersburg', days: int = 5) -> Optional[Dict[str, Any]]:
        """
        Get weather forecast for a city
        
        Args:
            city: City name
            days: Number of days (1-5)
            
        Returns:
            Forecast data or None
        """
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                params = {
                    'q': city,
                    'appid': self.api_key,
                    'units': 'metric',
                    'lang': 'ru',
                    'cnt': days * 8  # 8 forecasts per day (3-hour intervals)
                }
                
                response = await client.get(f'{self.base_url}/forecast', params=params)
                response.raise_for_status()
                data = response.json()
                
                # Group by day
                daily_forecasts = []
                current_day = None
                day_data = []
                
                for item in data['list']:
                    date = item['dt_txt'].split()[0]
                    
                    if current_day != date:
                        if day_data:
                            # Calculate daily averages
                            avg_temp = sum(d['main']['temp'] for d in day_data) / len(day_data)
                            daily_forecasts.append({
                                'date': current_day,
                                'temperature': round(avg_temp),
                                'description': day_data[len(day_data)//2]['weather'][0]['description'],
                                'icon': day_data[len(day_data)//2]['weather'][0]['icon']
                            })
                        current_day = date
                        day_data = [item]
                    else:
                        day_data.append(item)
                
                # Add last day
                if day_data:
                    avg_temp = sum(d['main']['temp'] for d in day_data) / len(day_data)
                    daily_forecasts.append({
                        'date': current_day,
                        'temperature': round(avg_temp),
                        'description': day_data[len(day_data)//2]['weather'][0]['description'],
                        'icon': day_data[len(day_data)//2]['weather'][0]['icon']
                    })
                
                return {
                    'city': data['city']['name'],
                    'forecasts': daily_forecasts[:days]
                }
                
            except Exception as e:
                print(f"Weather forecast error: {e}")
                return None
    
    def get_activity_recommendation(self, weather_data: Dict[str, Any]) -> str:
        """
        Get activity recommendation based on weather
        
        Args:
            weather_data: Current weather data
            
        Returns:
            Recommendation string
        """
        temp = weather_data.get('temperature', 0)
        description = weather_data.get('description', '').lower()
        
        if 'дождь' in description or 'ливень' in description:
            return 'Рекомендуем музеи, кафе или домашние активности'
        elif 'снег' in description:
            if temp < -10:
                return 'Холодно! Лучше остаться дома или посетить крытые места'
            else:
                return 'Отличная погода для зимних прогулок и катания на коньках'
        elif temp > 25:
            return 'Жарко! Идеально для парков, набережных и водных активностей'
        elif temp > 15:
            return 'Отличная погода для прогулок и активного отдыха'
        elif temp > 5:
            return 'Прохладно, но подходит для прогулок. Оденьтесь теплее'
        else:
            return 'Холодно. Рекомендуем крытые помещения или короткие прогулки'

weather_api = WeatherAPI()
