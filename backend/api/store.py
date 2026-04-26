from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.models import User
from api.user import get_current_user

router = APIRouter(prefix="/api/store", tags=["store"])


@router.get("/items")
async def get_store_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all store items (promo codes)"""
    # Mock data for now
    items = [
        {
            "id": 1,
            "title": "Скидка 20% в Буквоед",
            "description": "Промокод на скидку 20% в книжном магазине Буквоед",
            "price": 500,
            "category": "promo",
            "promo_code": "VPOTOKE20BOOK",
            "stock": 100
        },
        {
            "id": 2,
            "title": "Бесплатный кофе в Surf Coffee",
            "description": "Промокод на бесплатный кофе в Surf Coffee",
            "price": 300,
            "category": "promo",
            "promo_code": "VPOTOKE_COFFEE",
            "stock": 100
        },
        {
            "id": 3,
            "title": "Скидка 15% в Спортмастер",
            "description": "Промокод на скидку 15% в Спортмастер",
            "price": 600,
            "category": "promo",
            "promo_code": "VPOTOKE15SPORT",
            "stock": 100
        },
        {
            "id": 4,
            "title": "2 билета в кино по цене 1",
            "description": "Промокод на 2 билета в Каро Фильм",
            "price": 800,
            "category": "promo",
            "promo_code": "VPOTOKE_CINEMA",
            "stock": 100
        },
        {
            "id": 5,
            "title": "Скидка 25% на доставку Яндекс.Еда",
            "description": "Промокод на скидку 25% на первый заказ",
            "price": 400,
            "category": "promo",
            "promo_code": "VPOTOKE25EDA",
            "stock": 100
        },
        {
            "id": 6,
            "title": "Бесплатный вход в Эрмитаж",
            "description": "Промокод на бесплатный вход в Эрмитаж",
            "price": 1000,
            "category": "promo",
            "promo_code": "VPOTOKE_MUSEUM",
            "stock": 100
        },
        {
            "id": 7,
            "title": "Скидка 30% в Ozon",
            "description": "Промокод на скидку 30% на первый заказ",
            "price": 700,
            "category": "promo",
            "promo_code": "VPOTOKE30OZON",
            "stock": 100
        },
        {
            "id": 8,
            "title": "Бесплатная аренда самоката",
            "description": "Промокод на 30 минут бесплатной аренды Whoosh",
            "price": 350,
            "category": "promo",
            "promo_code": "VPOTOKE_SCOOTER",
            "stock": 100
        }
    ]

    return {"items": items}


@router.get("/purchases")
async def get_user_purchases(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's purchase history"""
    # Mock data
    purchases = []
    return {"purchases": purchases}


@router.post("/purchase/{item_id}")
async def purchase_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Purchase an item from the store"""
    return {
        "message": "Purchase successful",
        "promo_code": "VPOTOKE_DEMO"
    }
