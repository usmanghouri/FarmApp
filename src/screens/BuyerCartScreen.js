import React from "react";
import ShoppingCartScreen from "./ShoppingCartScreen";

export default function BuyerCartScreen(props) {
  const overrides = {
    headingText: "Your Shopping Cart",
    browseRoute: "BuyerProducts",
    browseLabel: "Browse Marketplace",
    continueShoppingRoute: "BuyerProducts",
    continueShoppingLabel: "Continue Shopping",
    emptyCtaLabel: "Shop Now",
    emptyMessage: "Add items from the marketplace to start checkout."
  };

  return <ShoppingCartScreen {...props} overrides={overrides} />;
}