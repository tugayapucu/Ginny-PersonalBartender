"""Add test users and sample data

Revision ID: 2c25a8c54841
Revises: 86403a8892f7
Create Date: 2025-09-21 18:12:02.412565

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker

# revision identifiers
revision = '2c25a8c54841'
down_revision = '86403a8892f7'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Pre-hashed passwords to avoid bcrypt dependency in migrations
    # password123 -> $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1yoUOj3.CK
    # password456 -> $2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
    
    bind = op.get_bind()
    Session = sessionmaker(bind=bind)
    session = Session()
    
    try:
        # Check if test users already exist
        existing_users = session.execute(
            sa.text("SELECT username FROM users WHERE username IN ('testuser1', 'testuser2')")
        ).fetchall()
        
        existing_usernames = [row[0] for row in existing_users]
        
        # Insert test users that don't exist
        users_to_insert = []
        if 'testuser1' not in existing_usernames:
            users_to_insert.append({
                'username': 'testuser1',
                'email': 'test1@example.com',
                'password': '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1yoUOj3.CK'
            })
        if 'testuser2' not in existing_usernames:
            users_to_insert.append({
                'username': 'testuser2',
                'email': 'test2@example.com',
                'password': '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'
            })
        
        for user_data in users_to_insert:
            session.execute(
                sa.text("""
                    INSERT INTO users (username, email, hashed_password, created_at)
                    VALUES (:username, :email, :password, NOW())
                """),
                user_data
            )
        
        session.commit()
        
        # Insert sample favorites only if cocktails exist
        cocktail_count = session.execute(sa.text("SELECT COUNT(*) FROM cocktails")).scalar()
        
        if cocktail_count >= 3:
            # Get test user IDs and first 3 cocktails
            users = session.execute(
                sa.text("SELECT id, username FROM users WHERE username IN ('testuser1', 'testuser2')")
            ).fetchall()
            
            cocktails = session.execute(
                sa.text("SELECT id FROM cocktails ORDER BY id LIMIT 3")
            ).fetchall()
            
            # Create favorites (3 for testuser1, 2 for testuser2)
            for user_id, username in users:
                cocktail_limit = 3 if username == 'testuser1' else 2
                for i, (cocktail_id,) in enumerate(cocktails[:cocktail_limit]):
                    session.execute(
                        sa.text("""
                            INSERT INTO favorites (user_id, cocktail_id, created_at)
                            VALUES (:user_id, :cocktail_id, NOW())
                        """),
                        {'user_id': user_id, 'cocktail_id': cocktail_id}
                    )
        
        session.commit()
        
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()

def downgrade() -> None:
    bind = op.get_bind()
    Session = sessionmaker(bind=bind)
    session = Session()
    
    try:
        session.execute(
            sa.text("DELETE FROM users WHERE username IN ('testuser1', 'testuser2')")
        )
        session.commit()
        
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()
