import { Router } from "express";
import { offerDisplay, offerDisplayByID, offerDisplayByName } from "../Controllers/common/offer.js";
import { brand, category, displayAllProduct, displayAllProductByName, displayByBrand, displayByCategory, getOneItemBySpecID, getProduct, searchItems, searchItemsByName } from "../Controllers/common/product.js";
import { displayByDate } from "../Controllers/adminCrud/DashBoard.js";
import { createNotification, deleteNotification, getNotification } from "../Controllers/common/notification.js";
import { getProductReviews, addProductReview, voteReview, deleteReview } from "../Controllers/common/reviews.js";
import { startChat, sendMessage, getChatMessages, getAdminChats, closeChat, assignAdmin, getChatHistory } from "../Controllers/common/chat.js";
import { reserveInventory, releaseInventory, confirmInventory, getInventoryStatus, getLowStockAlerts, getInventoryReport } from "../Controllers/common/inventory.js";
import { trackBrowsing, getCoViewedProducts, getSimilarPriceProducts, getTopRatedInCategory, getPersonalizedRecommendations } from "../Controllers/common/recommendations.js";
import { advancedSearch, getFilterOptions } from "../Controllers/common/filtering.js";

import { validateToken_refresh_token } from "../Utils/jwt_validation_refresh_token.js";

const commonRouter = Router();

// Existing product routes
commonRouter.get('/offerDisplay', offerDisplay);
commonRouter.get('/offerDisplayByName', offerDisplayByName);
commonRouter.get('/offerDisplayByID/:id', offerDisplayByID);
commonRouter.get("/getAllProduct", displayAllProduct);
commonRouter.get("/getAllProductByName", displayAllProductByName);
commonRouter.get("/searchProduct", searchItems);
commonRouter.get("/searchProductByName", searchItemsByName);
commonRouter.get("/getProduct", getProduct)
commonRouter.get("/getAllProductbyCategory", displayByCategory);
commonRouter.get("/getAllProductbyBrand", displayByBrand);
commonRouter.get("/getAllProductbydate", displayByDate);
commonRouter.get("/getOneItemBySpecID", getOneItemBySpecID);
commonRouter.get('/category', category);
commonRouter.get('/brand', brand);

// Notification routes
commonRouter.get("/notification", getNotification);
commonRouter.post("/notification", createNotification);
commonRouter.delete("/notification/:id", deleteNotification);

// ===== NEW FEATURE ROUTES =====

// Reviews — GET is public, write routes require auth
commonRouter.get("/reviews/:spec_id", getProductReviews);
commonRouter.post("/reviews", validateToken_refresh_token, addProductReview);
commonRouter.post("/reviews/vote", validateToken_refresh_token, voteReview);
commonRouter.delete("/reviews/:review_id", validateToken_refresh_token, deleteReview);

// 2. Chat Support Routes
commonRouter.post("/chat/start", startChat);
commonRouter.post("/chat/message", sendMessage);
commonRouter.get("/chat/:conversation_id/messages", getChatMessages);
commonRouter.get("/chat/admin/list", getAdminChats);
commonRouter.post("/chat/:conversation_id/assign", assignAdmin);
commonRouter.put("/chat/:conversation_id/close", closeChat);
commonRouter.get("/chat/history", getChatHistory);

// 3. Inventory Management Routes
commonRouter.post("/inventory/reserve", reserveInventory);
commonRouter.post("/inventory/release", releaseInventory);
commonRouter.post("/inventory/confirm", confirmInventory);
commonRouter.get("/inventory/:spec_id/status", getInventoryStatus);
commonRouter.get("/inventory/alerts/low-stock", getLowStockAlerts);
commonRouter.get("/inventory/report", getInventoryReport);

// 4. Product Recommendations Routes
commonRouter.post("/recommendations/track", trackBrowsing);
commonRouter.get("/recommendations/:spec_id/co-viewed", getCoViewedProducts);
commonRouter.get("/recommendations/:spec_id/similar-price", getSimilarPriceProducts);
commonRouter.get("/recommendations/:spec_id/top-rated", getTopRatedInCategory);
commonRouter.get("/recommendations/personalized", getPersonalizedRecommendations);

// 5. Advanced Filtering Routes
commonRouter.get("/search/advanced", advancedSearch);
commonRouter.get("/search/filters/options", getFilterOptions);

export default commonRouter;