from sqlalchemy.orm import Session

from models import Customer, Sale


def get_customer_by_phone(
    db: Session,
    phone_number: str
):

    return (
        db.query(Customer)
        .filter(
            Customer.PhoneNumber == phone_number
        )
        .first()
    )


def calculate_customer_value(
    total_amount: float
) -> int:

    # Every ₹300 gives 5 customer value

    return int(total_amount // 300) * 3


def create_sale(
    db: Session,
    phone_number: str,
    customer_name: str,
    total_amount: float,
    payment_method: str
):

    # ---------------------------------------
    # Find customer
    # ---------------------------------------

    customer = get_customer_by_phone(
        db,
        phone_number
    )


    # ---------------------------------------
    # Calculate value
    # ---------------------------------------

    value_to_add = calculate_customer_value(
        total_amount
    )


    # ---------------------------------------
    # Create customer if not exists
    # ---------------------------------------

    if customer is None:

        customer = Customer(
            CustomerName=customer_name,
            PhoneNumber=phone_number,
            customer_value=value_to_add
        )

        db.add(customer)

        db.flush()

    else:

        # -----------------------------------
        # Existing customer
        # -----------------------------------

        customer.customer_value += value_to_add


    # ---------------------------------------
    # Create sale
    # ---------------------------------------

    sale = Sale(

        CustomerId=customer.CustomerId,

        TotalAmount=total_amount,

        PaymentMethod=payment_method.upper()

    )

    db.add(sale)

    db.commit()

    db.refresh(customer)

    db.refresh(sale)


    return sale, customer, value_to_add