from fastapi import APIRouter, HTTPException, status
from typing import Optional
from integrations.yandex_maps import yandex_maps_client

router = APIRouter(prefix="/api/maps", tags=["maps"])

@router.get("/geocode")
async def geocode_address(address: str):
    """
    Geocode address to coordinates
    
    Args:
        address: Address string to geocode
        
    Returns:
        Coordinates and formatted address
    """
    result = await yandex_maps_client.geocode(address)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )
    
    return result

@router.get("/reverse-geocode")
async def reverse_geocode(lat: float, lon: float):
    """
    Reverse geocode coordinates to address
    
    Args:
        lat: Latitude
        lon: Longitude
        
    Returns:
        Address information
    """
    result = await yandex_maps_client.reverse_geocode(lat, lon)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    return result

@router.get("/route")
async def get_route(
    from_lat: float,
    from_lon: float,
    to_lat: float,
    to_lon: float,
    mode: str = 'auto'
):
    """
    Get route between two points
    
    Args:
        from_lat: Starting latitude
        from_lon: Starting longitude
        to_lat: Destination latitude
        to_lon: Destination longitude
        mode: Transport mode (auto, pedestrian, transit)
        
    Returns:
        Route information with distance and duration
    """
    if mode not in ['auto', 'pedestrian', 'transit']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid mode. Use: auto, pedestrian, or transit"
        )
    
    result = await yandex_maps_client.get_route(
        (from_lat, from_lon),
        (to_lat, to_lon),
        mode
    )
    
    return result

@router.get("/traffic")
async def get_traffic(city: str = 'Saint Petersburg'):
    """
    Get traffic information for city
    
    Args:
        city: City name (default: Saint Petersburg)
        
    Returns:
        Traffic level and description
    """
    result = await yandex_maps_client.get_traffic(city)
    
    return result
