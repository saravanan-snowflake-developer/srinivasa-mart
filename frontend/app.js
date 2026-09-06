// ==========================================
// SRINIVASA MART
// V1 Frontend
// ==========================================

const API_URL = "https://srinivasa-mart-backend.onrender.com";

// ==========================================
// COMMON HELPER
// ==========================================

function showMessage(element, text, type = "") {

    if (!element) {
        return;
    }

    element.textContent = text;

    element.className = type
        ? `${element.className.split(" ")[0]} ${type}`
        : element.className.split(" ")[0];
}


// ==========================================
// MAIN SALE PAGE ELEMENTS
// ==========================================

const saleForm =
    document.getElementById("saleForm");

const phoneInput =
    document.getElementById("phone");

const customerNameInput =
    document.getElementById("customerName");

const totalAmountInput =
    document.getElementById("totalAmount");

const searchBtn =
    document.getElementById("searchBtn");

const saveBtn =
    document.getElementById("saveBtn");

const saveBtnText =
    document.getElementById("saveBtnText");

const customerStatus =
    document.getElementById("customerStatus");

const valuePreview =
    document.getElementById("valuePreview");

const message =
    document.getElementById("message");


// ==========================================
// MAIN PAGE - SEARCH CUSTOMER
// ==========================================

if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        searchCustomer
    );
}


async function searchCustomer() {

    const phone =
        phoneInput.value.trim();


    if (phone.length < 10) {

        showCustomerStatus(
            "Please enter a valid phone number.",
            "error"
        );

        customerNameInput.value = "";

        customerNameInput.readOnly = false;

        return;
    }


    searchBtn.disabled = true;

    searchBtn.textContent =
        "Searching...";


    showCustomerStatus(
        "Searching customer...",
        "new"
    );


    try {

        /*
         * Existing backend route:
         *
         * GET /customers/{phone}
         */

        const response =
            await fetch(
                `${API_URL}/customers/${encodeURIComponent(phone)}`
            );


        if (!response.ok) {

            throw new Error(
                "Customer search failed"
            );
        }


        const data =
            await response.json();


        console.log(
            "Customer response:",
            data
        );


        // ==================================
        // EXISTING CUSTOMER
        // ==================================

        if (data.exists) {

            customerNameInput.value =
                data.customer_name;

            customerNameInput.readOnly =
                true;


            showCustomerStatus(
                `Customer found: ${data.customer_name}`,
                "success"
            );

        }


        // ==================================
        // NEW CUSTOMER
        // ==================================

        else {

            customerNameInput.value = "";

            customerNameInput.readOnly =
                false;


            showCustomerStatus(
                "New customer. Please enter customer name.",
                "new"
            );


            customerNameInput.focus();
        }


    } catch (error) {

        console.error(
            "Customer search error:",
            error
        );


        showCustomerStatus(
            "Unable to connect to server. Make sure FastAPI is running on port 8000.",
            "error"
        );

    } finally {

        searchBtn.disabled = false;

        searchBtn.textContent =
            "Search";
    }
}


// ==========================================
// CUSTOMER VALUE CALCULATION
// ==========================================
//
// ₹300  = 5
// ₹600  = 10
// ₹900  = 15
// ₹1200 = 20
//
// ==========================================

function calculateCustomerValue(amount) {

    amount = Number(amount);

    if (!amount || amount < 300) {
        return 0;
    }

    return Math.floor(amount / 300) * 3;
}


// ==========================================
// CUSTOMER VALUE PREVIEW
// ==========================================

if (totalAmountInput) {

    totalAmountInput.addEventListener(
        "input",
        calculateValuePreview
    );
}


function calculateValuePreview() {

    const amount =
        Number(totalAmountInput.value);


    if (!amount || amount <= 0) {

        valuePreview.textContent = "";

        return;
    }


    const customerValue =
        calculateCustomerValue(amount);


    valuePreview.textContent =
        `Customer Value Earned: ${customerValue}`;
}


// ==========================================
// SAVE SALE
// ==========================================

if (saleForm) {

    saleForm.addEventListener(
        "submit",
        saveSale
    );
}


async function saveSale(event) {

    event.preventDefault();


    if (!phoneInput ||
        !customerNameInput ||
        !totalAmountInput) {

        return;
    }


    message.textContent = "";

    message.className =
        "message";


    const phone =
        phoneInput.value.trim();


    const customerName =
        customerNameInput.value.trim();


    const totalAmount =
        Number(totalAmountInput.value);


    const selectedPayment =
        document.querySelector(
            'input[name="payment"]:checked'
        );


    // ==================================
    // VALIDATION
    // ==================================

    if (phone.length < 10) {

        showMessage(
            message,
            "Please enter a valid phone number.",
            "error"
        );

        phoneInput.focus();

        return;
    }


    if (!customerName) {

        showMessage(
            message,
            "Please enter customer name.",
            "error"
        );

        customerNameInput.focus();

        return;
    }


    if (!totalAmount || totalAmount <= 0) {

        showMessage(
            message,
            "Please enter a valid total amount.",
            "error"
        );

        totalAmountInput.focus();

        return;
    }


    if (!selectedPayment) {

        showMessage(
            message,
            "Please select Cash or UPI.",
            "error"
        );

        return;
    }


    const paymentMethod =
        selectedPayment.value;


    // ==================================
    // SALE DATA
    // ==================================

    const saleData = {

        phone_number: phone,

        customer_name: customerName,

        total_amount: totalAmount,

        payment_method: paymentMethod

    };


    console.log(
        "Sending sale:",
        saleData
    );


    // ==================================
    // LOADING
    // ==================================

    saveBtn.disabled = true;

    saveBtnText.textContent =
        "Saving...";


    try {

        const response =
            await fetch(
                `${API_URL}/sales`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            saleData
                        )
                }
            );


        const data =
            await response.json();


        console.log(
            "Sale response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to save sale."
            );
        }


        // ==================================
        // SUCCESS
        // ==================================

        showMessage(
            message,
            `Sale saved! Customer Value +${data.customer_value_added}. Total Value: ${data.total_customer_value}`,
            "success"
        );


        // Reset form

        saleForm.reset();

        customerNameInput.readOnly =
            false;

        customerStatus.textContent = "";

        valuePreview.textContent = "";

        phoneInput.focus();


    } catch (error) {

        console.error(
            "Save sale error:",
            error
        );


        showMessage(
            message,
            error.message ||
            "Unable to connect to server.",
            "error"
        );

    } finally {

        saveBtn.disabled = false;

        saveBtnText.textContent =
            "Save Sale";
    }
}


// ==========================================
// CUSTOMER STATUS
// ==========================================

function showCustomerStatus(
    text,
    type
) {

    if (!customerStatus) {
        return;
    }


    customerStatus.textContent =
        text;


    customerStatus.className =
        "customer-status";


    if (type === "success") {

        customerStatus.classList.add(
            "success"
        );

    } else if (type === "error") {

        customerStatus.classList.add(
            "error"
        );

    } else {

        customerStatus.classList.add(
            "new"
        );
    }
}


// ==========================================
// MAIN PAGE - ENTER PHONE
// ==========================================

if (phoneInput) {

    phoneInput.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                event.preventDefault();

                searchCustomer();
            }

        }
    );
}


// ==========================================
// MAIN PAGE - ENTER NAME
// ==========================================

if (customerNameInput) {

    customerNameInput.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                event.preventDefault();

                if (totalAmountInput) {

                    totalAmountInput.focus();
                }
            }

        }
    );
}


// ==================================================
// CUSTOMER VALUE PAGE
// ==================================================

const valuePhone =
    document.getElementById("valuePhone");

const valueCustomerName =
    document.getElementById(
        "valueCustomerName"
    );

const checkCustomerValueBtn =
    document.getElementById(
        "checkCustomerValueBtn"
    );

const customerValueDisplay =
    document.getElementById(
        "customerValue"
    );

const resetValueBtn =
    document.getElementById(
        "resetValueBtn"
    );

const valueMessage =
    document.getElementById(
        "valueMessage"
    );


// ==========================================
// CUSTOMER VALUE SEARCH BUTTON
// ==========================================

if (checkCustomerValueBtn) {

    checkCustomerValueBtn.addEventListener(
        "click",
        searchCustomerValue
    );
}


// ==========================================
// SEARCH CUSTOMER VALUE
// ==========================================

async function searchCustomerValue() {

    const phone =
        valuePhone.value.trim();


    if (phone.length < 10) {

        showMessage(
            valueMessage,
            "Please enter a valid phone number.",
            "error"
        );

        valueCustomerName.value = "";

        customerValueDisplay.textContent =
            "0";

        resetValueBtn.disabled = true;

        valuePhone.focus();

        return;
    }


    checkCustomerValueBtn.disabled =
        true;

    checkCustomerValueBtn.textContent =
        "Searching...";


    showMessage(
        valueMessage,
        "Searching customer...",
        ""
    );


    try {

        /*
         * IMPORTANT:
         *
         * Use the SAME backend route
         * that your existing app uses:
         *
         * GET /customers/{phone}
         */

        const response =
            await fetch(
                `${API_URL}/customers/${encodeURIComponent(phone)}`
            );


        console.log(
            "Customer value HTTP status:",
            response.status
        );


        if (!response.ok) {

            if (response.status === 404) {

                throw new Error(
                    "Customer not found."
                );
            }


            throw new Error(
                `Customer search failed (${response.status})`
            );
        }


        const data =
            await response.json();


        console.log(
            "Customer value response:",
            data
        );


        // ==================================
        // CUSTOMER FOUND
        // ==================================

        if (data.exists) {

            valueCustomerName.value =
                data.customer_name || "";


            customerValueDisplay.textContent =
                data.customer_value || 0;


            const currentValue =
                Number(
                    data.customer_value || 0
                );


            if (currentValue > 0) {

                resetValueBtn.disabled =
                    false;

            } else {

                resetValueBtn.disabled =
                    true;
            }


            showMessage(
                valueMessage,
                "Customer found successfully.",
                "success"
            );

        }


        // ==================================
        // CUSTOMER NOT FOUND
        // ==================================

        else {

            valueCustomerName.value = "";

            customerValueDisplay.textContent =
                "0";

            resetValueBtn.disabled =
                true;


            showMessage(
                valueMessage,
                "Customer not found.",
                "error"
            );
        }


    } catch (error) {

        console.error(
            "Customer value search error:",
            error
        );


        valueCustomerName.value = "";

        customerValueDisplay.textContent =
            "0";

        resetValueBtn.disabled =
            true;


        /*
         * Show the REAL error instead of
         * hiding everything behind
         * "Unable to connect".
         */

        if (
            error instanceof TypeError &&
            error.message.includes("fetch")
        ) {

            showMessage(
                valueMessage,
                "Cannot connect to FastAPI. Check that the backend is running on http://127.0.0.1:8000",
                "error"
            );

        } else {

            showMessage(
                valueMessage,
                error.message ||
                "Unable to connect to server.",
                "error"
            );
        }


    } finally {

        checkCustomerValueBtn.disabled =
            false;

        checkCustomerValueBtn.textContent =
            "Search";
    }
}


// ==========================================
// CUSTOMER VALUE - ENTER KEY
// ==========================================

if (valuePhone) {

    valuePhone.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                event.preventDefault();

                searchCustomerValue();
            }

        }
    );
}


// ==========================================
// RESET / REDEEM CUSTOMER VALUE
// ==========================================

if (resetValueBtn) {

    resetValueBtn.addEventListener(
        "click",
        resetCustomerValue
    );
}


// ==========================================
// RESET CUSTOMER VALUE
// ==========================================

async function resetCustomerValue() {

    const phone =
        valuePhone.value.trim();


    const currentValue =
        Number(
            customerValueDisplay.textContent
        );


    if (!phone) {

        showMessage(
            valueMessage,
            "Please search for a customer first.",
            "error"
        );

        return;
    }


    if (currentValue <= 0) {

        showMessage(
            valueMessage,
            "Customer has no value to redeem.",
            "error"
        );

        return;
    }


    // ==================================
    // CONFIRMATION
    // ==================================

    const confirmed =
        confirm(
            `Customer has ${currentValue} value. Do you want to redeem and reset it to 0?`
        );


    if (!confirmed) {
        return;
    }


    resetValueBtn.disabled =
        true;

    resetValueBtn.textContent =
        "Resetting...";


    try {

        /*
         * Existing backend route:
         *
         * PUT /customers/{phone}/reset-value
         */

        const response =
            await fetch(
                `${API_URL}/customers/${encodeURIComponent(phone)}/reset-value`,
                {
                    method: "PUT"
                }
            );


        const data =
            await response.json();


        console.log(
            "Reset response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to reset customer value."
            );
        }


        // ==================================
        // UPDATE SCREEN
        // ==================================

        customerValueDisplay.textContent =
            data.new_customer_value;


        showMessage(
            valueMessage,
            `Customer value redeemed successfully. Previous value: ${data.old_customer_value}`,
            "success"
        );


    } catch (error) {

        console.error(
            "Reset value error:",
            error
        );


        showMessage(
            valueMessage,
            error.message ||
            "Unable to reset customer value.",
            "error"
        );


    } finally {

        resetValueBtn.disabled =
            Number(
                customerValueDisplay.textContent
            ) <= 0;

        resetValueBtn.textContent =
            "Redeem / Reset Value";
    }
}