from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.models import User
from api.user import get_current_user

router = APIRouter(prefix="/api/store", tags=["store"])


@router.get("/items")
async def get_store_items(
    category: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all store items (promo codes)"""
    # Mock data for now
    all_items = [
        {
            "id": 1,
            "title": "Скидка 20% в Буквоед",
            "description": "Промокод на скидку 20% в книжном магазине Буквоед",
            "price": 500,
            "category": "discount",
            "promo_code": "VPOTOKE20BOOK",
            "stock": 100,
            "available": True,
            "partner": "Буквоед"
        },
        {
            "id": 2,
            "title": "Бесплатный кофе в Surf Coffee",
            "description": "Промокод на бесплатный кофе в Surf Coffee",
            "price": 300,
            "category": "discount",
            "promo_code": "VPOTOKE_COFFEE",
            "stock": 100,
            "available": True,
            "partner": "Surf Coffee"
        },
        {
            "id": 3,
            "title": "Скидка 15% в Спортмастер",
            "description": "Промокод на скидку 15% в Спортмастер",
            "price": 600,
            "category": "discount",
            "promo_code": "VPOTOKE15SPORT",
            "stock": 100,
            "available": True,
            "partner": "Спортмастер"
        },
        {
            "id": 4,
            "title": "2 билета в кино по цене 1",
            "description": "Промокод на 2 билета в Каро Фильм",
            "price": 800,
            "category": "discount",
            "promo_code": "VPOTOKE_CINEMA",
            "stock": 100,
            "available": True,
            "partner": "Каро Фильм"
        },
        {
            "id": 5,
            "title": "Скидка 25% на доставку Яндекс.Еда",
            "description": "Промокод на скидку 25% на первый заказ",
            "price": 400,
            "category": "discount",
            "promo_code": "VPOTOKE25EDA",
            "stock": 100,
            "available": True,
            "partner": "Яндекс.Еда"
        },
        {
            "id": 6,
            "title": "Бесплатный вход в Эрмитаж",
            "description": "Промокод на бесплатный вход в Эрмитаж",
            "price": 1000,
            "category": "premium",
            "promo_code": "VPOTOKE_MUSEUM",
            "stock": 50,
            "available": True,
            "partner": "Эрмитаж"
        },
        {
            "id": 7,
            "title": "Скидка 30% в Ozon",
            "description": "Промокод на скидку 30% на первый заказ",
            "price": 700,
            "category": "discount",
            "promo_code": "VPOTOKE30OZON",
            "stock": 100,
            "available": True,
            "partner": "Ozon"
        },
        {
            "id": 8,
            "title": "Бесплатная аренда самоката",
            "description": "Промокод на 30 минут бесплатной аренды Whoosh",
            "price": 350,
            "category": "discount",
            "promo_code": "VPOTOKE_SCOOTER",
            "stock": 100,
            "available": True,
            "partner": "Whoosh"
        }
    ]

    # Filter by category if provided
    if category:
        items = [item for item in all_items if item["category"] == category]
    else:
        items = all_items

    return items


@router.get("/purchases")
async def get_user_purchases(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's purchase history"""
    # Mock data
    purchases = []
    return purchases


@router.post("/purchase/{item_id}")
async def purchase_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Purchase an item from the store"""
    # Mock promo codes
    promo_codes = {
        1: "VPOTOKE20BOOK",
        2: "VPOTOKE_COFFEE",
        3: "VPOTOKE15SPORT",
        4: "VPOTOKE_CINEMA",
        5: "VPOTOKE25EDA",
        6: "VPOTOKE_MUSEUM",
        7: "VPOTOKE30OZON",
        8: "VPOTOKE_SCOOTER"
    }

    return {
        "success": True,
        "message": "Purchase successful",
        "promo_code": promo_codes.get(item_id, "VPOTOKE_DEMO"),
        "item_id": item_id
    }
