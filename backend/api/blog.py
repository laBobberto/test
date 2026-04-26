from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database.connection import get_db
from models.models import User
from api.user import get_current_user

router = APIRouter(prefix="/api/blog", tags=["blog"])


@router.get("/posts")
async def get_blog_posts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all blog posts"""
    # Mock data
    posts = [
        {
            "id": 1,
            "title": "Как я нашёл баланс между учёбой и жизнью",
            "slug": "balance-study-life",
            "summary": "Делюсь своим опытом организации времени и приоритетов. Главное - не забывать про отдых!",
            "content": "Привет! Хочу поделиться своим опытом, как я научился совмещать учёбу в ЛЭТИ с личной жизнью и хобби...",
            "author": {
                "id": 2,
                "username": "Анна Смирнова"
            },
            "published": True,
            "views": 150,
            "likes": 23,
            "created_at": "2026-04-20T10:00:00Z"
        },
        {
            "id": 2,
            "title": "Топ-5 мест для учёбы в Петербурге",
            "slug": "top-5-study-places-spb",
            "summary": "Подборка лучших мест для продуктивной учёбы в центре города",
            "content": "Собрал для вас список проверенных мест, где можно спокойно поучиться с ноутбуком...",
            "author": {
                "id": 3,
                "username": "Дмитрий Иванов"
            },
            "published": True,
            "views": 230,
            "likes": 45,
            "created_at": "2026-04-18T14:30:00Z"
        },
        {
            "id": 3,
            "title": "Мой опыт участия в хакатоне",
            "slug": "hackathon-experience",
            "summary": "Рассказываю про участие в хакатоне 'Цифровой Петербург'",
            "content": "Недавно участвовал в хакатоне и хочу поделиться впечатлениями и советами для новичков...",
            "author": {
                "id": 1,
                "username": "Демо Пользователь"
            },
            "published": True,
            "views": 180,
            "likes": 34,
            "created_at": "2026-04-22T16:00:00Z"
        },
        {
            "id": 4,
            "title": "Как начать бегать: гид для новичков",
            "slug": "running-guide-beginners",
            "summary": "Простые советы для тех, кто хочет начать бегать",
            "content": "Бег - это отличный способ поддерживать форму и очищать голову. Вот мои советы...",
            "author": {
                "id": 4,
                "username": "Елена Петрова"
            },
            "published": True,
            "views": 195,
            "likes": 38,
            "created_at": "2026-04-15T09:00:00Z"
        }
    ]

    return {"posts": posts}


@router.get("/posts/{slug}")
async def get_blog_post(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single blog post by slug"""
    # Mock data
    post = {
        "id": 1,
        "title": "Как я нашёл баланс между учёбой и жизнью",
        "slug": slug,
        "summary": "Делюсь своим опытом организации времени и приоритетов.",
        "content": "Привет! Хочу поделиться своим опытом, как я научился совмещать учёбу в ЛЭТИ с личной жизнью и хобби...",
        "author": {
            "id": 2,
            "username": "Анна Смирнова"
        },
        "published": True,
        "views": 150,
        "likes": 23,
        "created_at": "2026-04-20T10:00:00Z"
    }

    return post


@router.post("/posts/{post_id}/like")
async def like_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like a blog post"""
    return {"message": "Post liked", "post_id": post_id}
