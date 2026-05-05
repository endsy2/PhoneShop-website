import { configureStore } from "@reduxjs/toolkit";
import cartReducer from './cart.js'
import favoriteReducer from './favorite.js'
import compareReducer from './compare.js'

const store = configureStore({
    reducer: {
        cart: cartReducer,
        favorite: favoriteReducer,
        compare: compareReducer
    }
})

export default store;