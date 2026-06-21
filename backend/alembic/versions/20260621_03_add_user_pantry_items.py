"""Add user_pantry_items table.

Revision ID: 20260621_03
Revises: 20260319_02
Create Date: 2026-06-21 00:00:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260621_03"
down_revision: Union[str, Sequence[str], None] = "20260319_02"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(inspector: sa.Inspector, table_name: str) -> bool:
    return table_name in inspector.get_table_names()


def _has_index(inspector: sa.Inspector, table_name: str, index_name: str) -> bool:
    return index_name in {idx["name"] for idx in inspector.get_indexes(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_table(inspector, "user_pantry_items"):
        op.create_table(
            "user_pantry_items",
            sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("ingredient_id", sa.Integer(), sa.ForeignKey("ingredients.id"), nullable=True),
            sa.Column("ingredient_name", sa.String(), nullable=False),
            sa.Column("ingredient_key", sa.String(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.UniqueConstraint("user_id", "ingredient_key", name="uq_pantry_user_ingredient"),
        )
        op.create_index("ix_user_pantry_items_id", "user_pantry_items", ["id"], unique=False)
        op.create_index("ix_user_pantry_items_user_id", "user_pantry_items", ["user_id"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_table(inspector, "user_pantry_items"):
        for idx in ["ix_user_pantry_items_user_id", "ix_user_pantry_items_id"]:
            if _has_index(inspector, "user_pantry_items", idx):
                op.drop_index(idx, table_name="user_pantry_items")
        op.drop_table("user_pantry_items")
