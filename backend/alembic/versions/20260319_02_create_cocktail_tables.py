"""Create cocktail catalogue tables.

Revision ID: 20260319_02
Revises: 20260318_01
Create Date: 2026-03-19 00:00:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260319_02"
down_revision: Union[str, Sequence[str], None] = "20260318_01"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(inspector: sa.Inspector, table_name: str) -> bool:
    return table_name in inspector.get_table_names()


def _has_index(inspector: sa.Inspector, table_name: str, index_name: str) -> bool:
    return index_name in {idx["name"] for idx in inspector.get_indexes(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # ------------------------------------------------------------------
    # drinks
    # ------------------------------------------------------------------
    if not _has_table(inspector, "drinks"):
        op.create_table(
            "drinks",
            sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("category", sa.String(), nullable=True),
            sa.Column("alcoholic", sa.String(), nullable=True),
            sa.Column("glass", sa.String(), nullable=True),
            sa.Column("instructions", sa.String(), nullable=True),
            sa.Column("thumb_url", sa.String(), nullable=True),
        )

    inspector = sa.inspect(bind)
    if not _has_index(inspector, "drinks", "ix_drinks_name"):
        op.create_index("ix_drinks_name", "drinks", ["name"], unique=False)

    # ------------------------------------------------------------------
    # ingredients
    # ------------------------------------------------------------------
    inspector = sa.inspect(bind)
    if not _has_table(inspector, "ingredients"):
        op.create_table(
            "ingredients",
            sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("name_key", sa.String(), nullable=False),
        )

    inspector = sa.inspect(bind)
    if not _has_index(inspector, "ingredients", "ix_ingredients_name_key"):
        op.create_index("ix_ingredients_name_key", "ingredients", ["name_key"], unique=True)

    # ------------------------------------------------------------------
    # drink_ingredients
    # ------------------------------------------------------------------
    inspector = sa.inspect(bind)
    if not _has_table(inspector, "drink_ingredients"):
        op.create_table(
            "drink_ingredients",
            sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
            sa.Column("drink_id", sa.Integer(), sa.ForeignKey("drinks.id"), nullable=False),
            sa.Column("ingredient_id", sa.Integer(), sa.ForeignKey("ingredients.id"), nullable=False),
            sa.Column("measure", sa.String(), nullable=True),
            sa.Column("position", sa.Integer(), nullable=False),
            sa.UniqueConstraint("drink_id", "ingredient_id", "position", name="uq_drink_ingredient_position"),
        )

    inspector = sa.inspect(bind)
    if not _has_index(inspector, "drink_ingredients", "ix_drink_ingredients_drink_id"):
        op.create_index("ix_drink_ingredients_drink_id", "drink_ingredients", ["drink_id"], unique=False)
    if not _has_index(inspector, "drink_ingredients", "ix_drink_ingredients_ingredient_id"):
        op.create_index("ix_drink_ingredients_ingredient_id", "drink_ingredients", ["ingredient_id"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_table(inspector, "drink_ingredients"):
        for idx in ["ix_drink_ingredients_ingredient_id", "ix_drink_ingredients_drink_id"]:
            if _has_index(inspector, "drink_ingredients", idx):
                op.drop_index(idx, table_name="drink_ingredients")
        op.drop_table("drink_ingredients")

    inspector = sa.inspect(bind)
    if _has_table(inspector, "ingredients"):
        if _has_index(inspector, "ingredients", "ix_ingredients_name_key"):
            op.drop_index("ix_ingredients_name_key", table_name="ingredients")
        op.drop_table("ingredients")

    inspector = sa.inspect(bind)
    if _has_table(inspector, "drinks"):
        if _has_index(inspector, "drinks", "ix_drinks_name"):
            op.drop_index("ix_drinks_name", table_name="drinks")
        op.drop_table("drinks")
