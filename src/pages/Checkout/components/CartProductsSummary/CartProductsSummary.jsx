import "./CartProductsSummary.css";

import React from "react";
import { useUserData } from "../../../../contexts/UserDataProvider.js";

export const CartProductsSummary = () => {
  const { userDataState } = useUserData();
  const handleImageError = (e) => {
    e.target.src = "https://via.assets.so/img.jpg?w=512&h=768&tc=%23ccc&bg=%23fff&t=404";
  };
  return (
    <div className="product-details-container">
      <h1>In Your Bag</h1>
      <div className="ordered-products-container">
        {userDataState.cartProducts?.map(
          ({ id, img, name, qty, discounted_price }) => (
            <div key={id} className="ordered-product-card">
              <img src={img} alt={name} onError={handleImageError}/>
              <span>
                <span>{name} - </span>
                <span>{qty}</span>
              </span>
              <span>${discounted_price}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};
