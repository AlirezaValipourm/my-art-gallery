import "./DeliveryAddress.css";
import { useUserData } from "../../../../contexts/UserDataProvider.js";
import { v4 as uuid } from "uuid";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../../contexts/AuthProvider.js";
import { useNavigate } from "react-router-dom";
import PaymentModal from "../PaymentModal/PaymentModal.jsx";

export const DeliveryAddress = () => {
  const { userDataState, dispatch, clearCartHandler } = useUserData();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const {
    cartProducts,
    addressList,
    orderDetails: { cartItemsDiscountTotal, orderAddress },
  } = userDataState;

  const totalAmount = cartItemsDiscountTotal;

  const navigate = useNavigate();

  const userContact = addressList?.find(
    ({ _id }) => _id === orderAddress?._id
  )?.phone;

  const { auth, setCurrentPage } = useAuth();

  const successHandler = (response) => {
    const paymentId = response.razorpay_payment_id;
    const orderId = uuid();
    const order = {
      paymentId,
      orderId,
      amountPaid: totalAmount,
      orderedProducts: [...cartProducts],
      deliveryAddress: { ...orderAddress },
      paymentMethod: response.method,
      savedCard: response.saved_card
    };

    dispatch({ type: "SET_ORDERS", payload: order });
    clearCartHandler(auth.token);
    setCurrentPage("orders");
    navigate("/profile/orders");
    
    toast.success("Payment successful! Your order has been placed.");
  };

  const placeOrderHandler = () => {
    if (orderAddress) {
      setShowPaymentModal(true);
    } else {
      toast.error("Please select an address!");
    }
  };

  return (
    <div className="delivery-address-container">
      <p>Delivering To</p>

      <div className="delivery-address-description">
        <span className="name">
          Name: {userDataState.orderDetails?.orderAddress?.name}
        </span>
        <span className="address">
          Address: {orderAddress?.street}, {orderAddress?.city},{" "}
          {orderAddress?.state}, {orderAddress?.country},{" "}
          {orderAddress?.pincode}
        </span>
        <span className="contact">Contact: {orderAddress?.phone}</span>
        <button onClick={placeOrderHandler} className="place-order-btn">
          Place Order
        </button>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={totalAmount}
        onPaymentSuccess={successHandler}
        customerInfo={{
          name: auth.firstName,
          email: auth.email,
          phone: userContact
        }}
      />
    </div>
  );
};
