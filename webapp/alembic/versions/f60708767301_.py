"""empty message

Revision ID: f60708767301
Revises: f03a65452ad3
Create Date: 2017-10-30 17:44:32.236914

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f60708767301'
down_revision = 'f03a65452ad3'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('merge_log',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('upload_id', sa.String(length=255), nullable=True),
    sa.Column('new_unique_rows', sa.Integer(), nullable=True),
    sa.Column('total_unique_rows', sa.Integer(), nullable=True),
    sa.Column('merge_start_timestamp', sa.DateTime(), nullable=True),
    sa.Column('merge_complete_timestamp', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['upload_id'], ['upload_log.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('merge_log')
    # ### end Alembic commands ###
