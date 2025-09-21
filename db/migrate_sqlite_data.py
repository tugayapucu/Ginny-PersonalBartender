# db/migrate_sqlite_data.py (cleaned up)
import sqlite3
import sys
import os
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(__file__))

from models import User, Cocktail, CocktailIngredient, Favorite

load_dotenv()

sqlite_db_path = "../backend/cocktails.db"

def safe_get(row, column_name, default=None):
    """Safely get a column value from sqlite3.Row object."""
    try:
        return row[column_name] if row[column_name] is not None else default
    except (IndexError, KeyError):
        return default

def migrate_sqlite_data():
    """Migrate existing data from SQLite to PostgreSQL."""
    
    if not os.path.exists(sqlite_db_path):
        print(f"SQLite database not found at: {sqlite_db_path}")
        return
    
    print("Starting data migration from SQLite to PostgreSQL...")
    
    try:
        sqlite_conn = sqlite3.connect(sqlite_db_path)
        sqlite_conn.row_factory = sqlite3.Row
        sqlite_cursor = sqlite_conn.cursor()
        
        DATABASE_URL = os.getenv("DATABASE_URL")
        if not DATABASE_URL:
            print("DATABASE_URL not found in environment")
            return
            
        pg_engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=pg_engine)
        pg_session = SessionLocal()
        
        print("Connected to databases")
        
        # Migrate cocktails/drinks
        print("\nMigrating cocktails...")
        migrate_cocktails(sqlite_cursor, pg_session)
        
        # Migrate existing users (if any)
        print("\nMigrating existing users...")
        migrate_users(sqlite_cursor, pg_session)
        
        pg_session.commit()
        
        # Verify migration
        print("\nVerifying migration...")
        verify_migration(pg_session)
        
        pg_session.close()
        sqlite_conn.close()
        
        print("\nSQLite data migration completed successfully!")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        if 'pg_session' in locals():
            pg_session.rollback()
            pg_session.close()
        raise

def migrate_cocktails(sqlite_cursor, pg_session):
    """Migrate drinks table to cocktails + cocktail_ingredients."""
    
    sqlite_cursor.execute("SELECT * FROM drinks")
    drinks = sqlite_cursor.fetchall()
    
    print(f"Migrating {len(drinks)} cocktails...")
    
    migrated_count = 0
    ingredient_count = 0
    
    for drink in drinks:
        try:
            cocktail = Cocktail(
                name=safe_get(drink, 'strDrink', 'Unknown Cocktail'),
                category=safe_get(drink, 'strCategory'),
                alcoholic=safe_get(drink, 'strAlcoholic'),
                glass=safe_get(drink, 'strGlass'),
                image_url=safe_get(drink, 'strDrinkThumb'),
                instructions=safe_get(drink, 'strInstructions')
            )
            
            pg_session.add(cocktail)
            pg_session.flush()
            
            # Migrate ingredients
            for i in range(1, 16):
                ingredient_col = f'strIngredient{i}'
                measure_col = f'strMeasure{i}'
                
                ingredient_name = safe_get(drink, ingredient_col, '')
                measure = safe_get(drink, measure_col, '')
                
                if ingredient_name:
                    ingredient_name = ingredient_name.strip()
                if measure:
                    measure = measure.strip()
                
                if ingredient_name:
                    cocktail_ingredient = CocktailIngredient(
                        cocktail_id=cocktail.id,
                        ingredient_name=ingredient_name,
                        measure=measure if measure else None,
                        order=i
                    )
                    pg_session.add(cocktail_ingredient)
                    ingredient_count += 1
            
            migrated_count += 1
            if migrated_count % 100 == 0:
                print(f"Migrated {migrated_count} cocktails...")
                
        except Exception as e:
            print(f"Error migrating cocktail '{safe_get(drink, 'strDrink', 'Unknown')}': {e}")
            continue
    
    print(f"Successfully migrated {migrated_count} cocktails with {ingredient_count} ingredients")

def migrate_users(sqlite_cursor, pg_session):
    """Migrate users table if it exists."""
    
    try:
        sqlite_cursor.execute("SELECT * FROM users")
        users = sqlite_cursor.fetchall()
        
        print(f"Found {len(users)} existing users to migrate")
        
        migrated_count = 0
        for user in users:
            try:
                pg_user = User(
                    username=safe_get(user, 'username'),
                    email=safe_get(user, 'email'),
                    hashed_password=safe_get(user, 'hashed_password')
                )
                pg_session.add(pg_user)
                migrated_count += 1
            except Exception as e:
                print(f"Error migrating user '{safe_get(user, 'username', 'Unknown')}': {e}")
        
        print(f"Successfully migrated {migrated_count} existing users")
        
    except Exception as e:
        print(f"No existing users table: {e}")

def verify_migration(pg_session):
    """Verify the migrated data."""
    
    try:
        cocktail_count = pg_session.query(Cocktail).count()
        ingredient_count = pg_session.query(CocktailIngredient).count()
        user_count = pg_session.query(User).count()
        
        print(f"Cocktails migrated: {cocktail_count}")
        print(f"Ingredients migrated: {ingredient_count}")
        print(f"Users migrated: {user_count}")
        
    except Exception as e:
        print(f"Error verifying migration: {e}")

if __name__ == "__main__":
    migrate_sqlite_data()
