import { createSlice } from "@reduxjs/toolkit";

const CART_VERSION = "v2"; // bump this to force a cart reset

const initialState = {
    items: (() => {
        try {
            // If cart version doesn't match, clear old stale cart
            if (localStorage.getItem("carts_version") !== CART_VERSION) {
                localStorage.removeItem("carts");
                localStorage.setItem("carts_version", CART_VERSION);
                return [];
            }
            const stored = localStorage.getItem("carts");
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    })(),
    statusTab: false,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart(state, action) {
            const { productId, productName, quantity, price, image, color } = action.payload;

            const indexProductId = state.items.findIndex((item) => item.productId === productId);

            if (indexProductId >= 0) {
                state.items[indexProductId].quantity += quantity;
            } else {
                state.items.push({ productId, productName, quantity, price, image: image || "", color: color || "" });
            }

            localStorage.setItem("carts", JSON.stringify(state.items));
        },
        changeQuantity(state, action) {
            const { productId, quantity } = action.payload;

            const indexProductId = state.items.findIndex((item) => item.productId === productId);

            if (indexProductId >= 0) {
                if (quantity > 0) {
                    // Update quantity if greater than zero
                    state.items[indexProductId].quantity = quantity;
                } else {
                    // Remove item if quantity is zero or less
                    state.items = state.items.filter((item) => item.productId !== productId);
                }

                // Save updated cart to localStorage
                localStorage.setItem("carts", JSON.stringify(state.items));
            }
        },
        syncCartItem(state, action) {
            const { productId, productName, price } = action.payload;
            const indexProductId = state.items.findIndex((item) => item.productId === productId);

            if (indexProductId >= 0) {
                if (productName) {
                    state.items[indexProductId].productName = productName;
                }

                if (price !== undefined && price !== null && price !== "") {
                    state.items[indexProductId].price = Number(price);
                }

                localStorage.setItem("carts", JSON.stringify(state.items));
            }
        },
        removeFromCart(state, action) {
            const { productId } = action.payload;

            // Filter out the item to remove it
            state.items = state.items.filter((item) => item.productId !== productId);

            // Save updated cart to localStorage
            localStorage.setItem("carts", JSON.stringify(state.items));
        },
        removeAllCart(state) {
            state.items = [];
            localStorage.removeItem('carts')
        },
        toggleStatusTab(state) {
            // Toggle the statusTab state
            state.statusTab = !state.statusTab;
        },
    },
});

export const { addToCart, changeQuantity, syncCartItem, removeFromCart, toggleStatusTab, removeAllCart } = cartSlice.actions;
export default cartSlice.reducer;
