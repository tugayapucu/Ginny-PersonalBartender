"""add user_cocktail_notes table

Revision ID: 20260621_04
Revises: 20260621_03
Create Date: 2026-06-21
"""
from alembic import op
import sqlalchemy as sa

revision = "20260621_04"
down_revision = "20260621_03"
branch_labels = None
depends_on = None


def _has_table(name: str) -> bool:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    return name in inspector.get_table_names()


def upgrade() -> None:
    if _has_table("user_cocktail_notes"):
        return
    op.create_table(
        "user_cocktail_notes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("drink_id", sa.Integer(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["drink_id"], ["drinks.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "drink_id", name="uq_note_user_drink"),
    )
    op.create_index(op.f("ix_user_cocktail_notes_id"), "user_cocktail_notes", ["id"], unique=False)


def downgrade() -> None:
    if not _has_table("user_cocktail_notes"):
        return
    op.drop_index(op.f("ix_user_cocktail_notes_id"), table_name="user_cocktail_notes")
    op.drop_table("user_cocktail_notes")
