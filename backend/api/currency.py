from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.connection import get_db
from models.models import User, UserRating
from api.user import get_current_user

router = APIRouter(prefix="/api/currency", tags=["currency"])


@router.get("/balance")
async def get_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's virtual currency balance"""
    # Get user rating which contains points
    rating = db.query(UserRating).filter(UserRating.user_id == current_user.id).first()

    balance = rating.total_points if rating else 0

    return {
        "balance": balance,
        "currency_name": "Баллы",
        "currency_symbol": "⭐"
    }


@router.get("/transactions")
async def get_transactions(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's currency transaction history"""
    # Mock data for now
    transactions = []
    return transactions
