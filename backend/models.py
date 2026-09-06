from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Numeric,
    ForeignKey
)

from sqlalchemy.sql import func

from database import Base


class Customer(Base):

    __tablename__ = "Customers"

    CustomerId = Column(
        Integer,
        primary_key=True,
        index=True
    )

    CustomerName = Column(
        String(100),
        nullable=False
    )

    PhoneNumber = Column(
        String(15),
        nullable=False,
        unique=True
    )

    CreatedAt = Column(
        DateTime,
        nullable=False,
        server_default=func.getdate()
    )

    customer_value = Column(
        Integer,
        nullable=False,
        default=0
    )


class Sale(Base):

    __tablename__ = "Sales"

    SaleId = Column(
        Integer,
        primary_key=True,
        index=True
    )

    CustomerId = Column(
        Integer,
        ForeignKey("Customers.CustomerId"),
        nullable=False
    )

    TotalAmount = Column(
        Numeric(10, 2),
        nullable=False
    )

    PaymentMethod = Column(
        String(10),
        nullable=False
    )

    SaleDate = Column(
        DateTime,
        nullable=False,
        server_default=func.getdate()
    )