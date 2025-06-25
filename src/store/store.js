import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice.js";
import cartSlice from "./slices/cartSlice.js";
import productsSlice from "./slices/productsSlice.js";
import messageSlice from "./slices/messageSlice.js";
import notificationSlice from "./slices/notificationSlice.js";

const store = configureStore({
  reducer: {
    auth: authSlice,
    cart: cartSlice,
    products: productsSlice,
    messages: messageSlice,
    notifications: notificationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "auth/loginSuccess",
          "auth/updateUser",
          "cart/addToCart",
          "cart/removeFromCart",
          "cart/updateQuantity",
          "cart/clearCart",
          "cart/syncCartFromServer",
        ],
        ignoredPaths: [
          "auth.user.profileImage",
          "cart.items",
          "cart.lastUpdated",
        ],
      },
      immutableCheck: {
        ignoredPaths: ["cart.items"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
