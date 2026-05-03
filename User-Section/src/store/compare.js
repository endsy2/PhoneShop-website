import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  compareItems: localStorage.getItem("compareItems")
    ? JSON.parse(localStorage.getItem("compareItems"))
    : [],
};

const compareSlice = createSlice({
  name: "compare",
  initialState,
  reducers: {
    addToCompare(state, action) {
      const product = action.payload;

      if (!product?.phone_id) {
        return;
      }

      const alreadyExists = state.compareItems.some(
        (item) => item.phone_id === product.phone_id
      );

      if (!alreadyExists) {
        state.compareItems.unshift(product);
        localStorage.setItem("compareItems", JSON.stringify(state.compareItems));
      }
    },
    removeFromCompare(state, action) {
      const { productId } = action.payload;

      state.compareItems = state.compareItems.filter(
        (item) => item.phone_id !== productId
      );
      localStorage.setItem("compareItems", JSON.stringify(state.compareItems));
    },
    clearCompare(state) {
      state.compareItems = [];
      localStorage.removeItem("compareItems");
    },
  },
});

export const { addToCompare, removeFromCompare, clearCompare } = compareSlice.actions;
export default compareSlice.reducer;