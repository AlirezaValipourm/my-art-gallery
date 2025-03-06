import "./ProductImage.css";
import Tilt from "react-parallax-tilt";

import React from "react";

export const ProductImage = ({ selectedProduct }) => {
  const handleImageError = (e) => {
    e.target.src = "https://via.assets.so/img.jpg?w=512&h=768&tc=%23ccc&bg=%23fff&t=404";
  };
  return (
    <Tilt
      tiltEnable={false}
      scale={1.15}
      transitionSpeed={1000}
      className="product-details-image"
    >
      {" "}
      <img src={selectedProduct?.img} alt={selectedProduct.name} onError={handleImageError}/>
    </Tilt>
  );
};
