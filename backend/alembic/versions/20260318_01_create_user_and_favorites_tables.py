"""Create users and favorites tables.

Revision ID: 20260318_01
Revises:
Create Date: 2026-03-18 00:00:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260318_01"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(inspector: sa.Inspector, table_name: str) -> bool:
    return table_name in inspector.get_table_names()


def _has_column(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def _has_index(inspector: sa.Inspector, table_name: str, index_name: str) -> bool:
    return index_name in {index["name"] for index in inspector.get_indexes(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_table(inspector, "users"):
        op.create_table(
            "users",
            sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
            sa.Column("username", sa.String(length=100), nullable=False),
            sa.Column("email", sa.String(length=100), nullable=False),
            sa.Column("hashed_password", sa.String(length=255), nullable=False),
            sa.Column("theme", sa.String(length=20), nullable=True),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        )
        op.create_index("ix_users_id", "users", ["id"], unique=False)
        op.create_index("ix_users_username", "users", ["username"], unique=True)
        op.create_index("ix_users_email", "users", ["email"], unique=True)
    else:
        if not _has_column(inspector, "users", "theme"):
            op.add_column("users", sa.Column("theme", sa.String(length=20), nullable=True))
        if not _has_column(inspector, "users", "is_active"):
            op.add_column(
                "users",
                sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            )

        inspector = sa.inspect(bind)
        if not _has_index(inspector, "users", "ix_users_id"):
            op.create_index("ix_users_id", "users", ["id"], unique=False)
        if not _has_index(inspector, "users", "ix_users_username"):
            op.create_index("ix_users_username", "users", ["username"], unique=True)
        if not _has_index(inspector, "users", "ix_users_email"):
            op.create_index("ix_users_email", "users", ["email"], unique=True)

    inspector = sa.inspect(bind)
    if not _has_table(inspector, "favorites"):
        op.create_table(
            "favorites",
            sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("cocktail_id", sa.String(), nullable=False),
        )
        op.create_index("ix_favorites_id", "favorites", ["id"], unique=False)
    else:
        if not _has_index(inspector, "favorites", "ix_favorites_id"):
            op.create_index("ix_favorites_id", "favorites", ["id"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_table(inspector, "favorites"):
        if _has_index(inspector, "favorites", "ix_favorites_id"):
            op.drop_index("ix_favorites_id", table_name="favorites")
        op.drop_table("favorites")

    inspector = sa.inspect(bind)
    if _has_table(inspector, "users"):
        if _has_index(inspector, "users", "ix_users_email"):
            op.drop_index("ix_users_email", table_name="users")
        if _has_index(inspector, "users", "ix_users_username"):
            op.drop_index("ix_users_username", table_name="users")
        if _has_index(inspector, "users", "ix_users_id"):
            op.drop_index("ix_users_id", table_name="users")
        op.drop_table("users")
