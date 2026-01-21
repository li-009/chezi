"""社区模块 - API 路由"""
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Post, PostLike, Comment, User
from ..auth.deps import get_current_user

router = APIRouter()


class CreatePostRequest(BaseModel):
    content: str = Field(min_length=1, max_length=1000)
    image: Optional[str] = None


class CommentRequest(BaseModel):
    content: str = Field(min_length=1, max_length=500)


@router.get("")
def get_posts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取帖子列表"""
    posts = db.query(Post).order_by(Post.created_at.desc()).all()
    
    result = []
    for post in posts:
        likes_count = db.query(PostLike).filter(PostLike.post_id == post.id).count()
        comments_count = db.query(Comment).filter(Comment.post_id == post.id).count()
        is_liked = db.query(PostLike).filter(
            PostLike.post_id == post.id,
            PostLike.user_id == current_user.id
        ).first() is not None
        
        result.append({
            "id": post.id,
            "user_id": post.user_id,
            "author": {
                "id": post.author.id,
                "username": post.author.username,
                "avatar": post.author.avatar
            },
            "content": post.content,
            "image": post.image,
            "likesCount": likes_count,
            "commentsCount": comments_count,
            "is_liked": is_liked,
            "created_at": post.created_at.isoformat()
        })
    
    return {"success": True, "data": result}


@router.post("")
def create_post(
    request: CreatePostRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建帖子"""
    post = Post(
        user_id=current_user.id,
        content=request.content,
        image=request.image
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    
    return {
        "success": True,
        "data": {
            "id": post.id,
            "user_id": post.user_id,
            "author": {
                "id": current_user.id,
                "username": current_user.username,
                "avatar": current_user.avatar
            },
            "content": post.content,
            "image": post.image,
            "likesCount": 0,
            "commentsCount": 0,
            "is_liked": False,
            "created_at": post.created_at.isoformat()
        }
    }


@router.post("/{post_id}/like")
def toggle_like(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """点赞/取消点赞"""
    existing = db.query(PostLike).filter(
        PostLike.post_id == post_id,
        PostLike.user_id == current_user.id
    ).first()
    
    if existing:
        db.delete(existing)
        is_liked = False
    else:
        like = PostLike(post_id=post_id, user_id=current_user.id)
        db.add(like)
        is_liked = True
    
    db.commit()
    
    likes_count = db.query(PostLike).filter(PostLike.post_id == post_id).count()
    
    return {
        "success": True,
        "data": {"isLiked": is_liked, "likesCount": likes_count}
    }


@router.get("/{post_id}/comments")
def get_comments(post_id: int, db: Session = Depends(get_db)):
    """获取帖子评论"""
    comments = db.query(Comment).filter(
        Comment.post_id == post_id
    ).order_by(Comment.created_at).all()
    
    return {
        "success": True,
        "data": [
            {
                "id": c.id,
                "post_id": c.post_id,
                "user_id": c.user_id,
                "author": c.author.username,
                "avatar": c.author.avatar,
                "content": c.content,
                "created_at": c.created_at.isoformat()
            }
            for c in comments
        ]
    }


@router.post("/{post_id}/comment")
def add_comment(
    post_id: int,
    request: CommentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """添加评论"""
    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        content=request.content
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    return {
        "success": True,
        "data": {
            "id": comment.id,
            "post_id": comment.post_id,
            "user_id": current_user.id,
            "author": current_user.username,
            "avatar": current_user.avatar,
            "content": comment.content,
            "created_at": comment.created_at.isoformat()
        }
    }
