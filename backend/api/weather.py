from fastapi import APIRouter, Query
from integrations.weather_api import weather_api

router = APIRouter(prefix="/api/weather", tags=["weather"])

@router.get("/current")
async def get_current_weather(city: str = Query('Saint Petersburg')):
    """
    Get current weather for a city
    
    Args:
        city: City name (default: Saint Petersburg)
        
    Returns:
        Current weather data
    """
    weather = await weather_api.get_current_weather(city)
    
    if not weather:
        return {
            'error': 'Could not fetch weather data',
            'city': city
        }
    
    # Add recommendation
    weather['recommendation'] = weather_api.get_activity_recommendation(weather)
    
    return weather

@router.get("/forecast")
async def get_weather_forecast(
    city: str = Query('Saint Petersburg'),
    days: int = Query(5, ge=1, le=5)
):
    """
    Get weather forecast for a city
    
    Args:
        city: City name (default: Saint Petersburg)
        days: Number of days (1-5)
        
    Returns:
        Weather forecast data
    """
    forecast = await weather_api.get_forecast(city, days)
    
    if not forecast:
        return {
            'error': 'Could not fetch forecast data',
            'city': city
        }
    
    return forecast
