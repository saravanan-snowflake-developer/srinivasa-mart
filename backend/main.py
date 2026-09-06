from fastapi import (
    FastAPI,
    Depends,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from database import get_db

from models import Customer

from schemas import (
    CustomerSearchResponse,
    SaleCreate,
    SaleResponse
)

from crud import (
    get_customer_by_phone,
    create_sale
)


app = FastAPI(
    title="Srinivasa Mart API",
    version="1.0.0"
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# ==========================================
# Home
# ==========================================

@app.get("/")
def home():

    return {
        "message": "Srinivasa Mart API is running"
    }


# ==========================================
# Search Customer
# ==========================================

@app.get(
    "/customers/{phone_number}",
    response_model=CustomerSearchResponse
)
def search_customer(

    phone_number: str,

    db: Session = Depends(get_db)

):

    customer = get_customer_by_phone(
        db,
        phone_number
    )


    # --------------------------------------
    # Customer does not exist
    # --------------------------------------

    if customer is None:

        return CustomerSearchResponse(
            exists=False
        )


    # --------------------------------------
    # Customer exists
    # --------------------------------------

    return CustomerSearchResponse(

        exists=True,

        customer_id=customer.CustomerId,

        customer_name=customer.CustomerName,

        phone_number=customer.PhoneNumber,

        customer_value=customer.customer_value

    )


# ==========================================
# Save Sale
# ==========================================

@app.post(
    "/sales",
    response_model=SaleResponse
)
def save_sale(

    sale_data: SaleCreate,

    db: Session = Depends(get_db)

):

    # --------------------------------------
    # Validate payment method
    # --------------------------------------

    payment_method = (
        sale_data.payment_method.upper()
    )

    if payment_method not in ["CASH", "UPI"]:

        raise HTTPException(
            status_code=400,
            detail="Payment method must be CASH or UPI"
        )


    try:

        sale, customer, value_added = create_sale(

            db=db,

            phone_number=sale_data.phone_number,

            customer_name=sale_data.customer_name,

            total_amount=sale_data.total_amount,

            payment_method=payment_method

        )


        return SaleResponse(

            message="Sale saved successfully",

            sale_id=sale.SaleId,

            customer_id=customer.CustomerId,

            customer_name=customer.CustomerName,

            total_amount=float(
                sale.TotalAmount
            ),

            payment_method=sale.PaymentMethod,

            customer_value_added=value_added,

            total_customer_value=customer.customer_value

        )


    except Exception as e:

        db.rollback()

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )


# ==========================================
# Reset / Redeem Customer Value
# ==========================================

@app.put("/customers/{phone_number}/reset-value")
def reset_customer_value(
    phone_number: str,
    db: Session = Depends(get_db)
):

    customer = get_customer_by_phone(
        db,
        phone_number
    )

    if customer is None:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    old_value = customer.customer_value

    customer.customer_value = 0

    db.commit()

    db.refresh(customer)

    return {
        "message": "Customer value reset successfully",
        "customer_id": customer.CustomerId,
        "customer_name": customer.CustomerName,
        "old_customer_value": old_value,
        "new_customer_value": customer.customer_value
    }