from pydantic import BaseModel, Field


class CustomerSearchResponse(BaseModel):

    exists: bool

    customer_id: int | None = None

    customer_name: str | None = None

    phone_number: str | None = None

    customer_value: int | None = None


class SaleCreate(BaseModel):

    phone_number: str = Field(
        min_length=10,
        max_length=15
    )

    customer_name: str = Field(
        min_length=1,
        max_length=100
    )

    total_amount: float = Field(
        gt=0
    )

    payment_method: str


class SaleResponse(BaseModel):

    message: str

    sale_id: int

    customer_id: int

    customer_name: str

    total_amount: float

    payment_method: str

    customer_value_added: int

    total_customer_value: int