import { Router } from "express";
import upload from "../Utils/handleimg.js";
import { validateToken_refresh_token } from "../Utils/jwt_validation_refresh_token.js";
import { authorize } from "../Utils/rbac.js";
import { addNewBrand, addNewCategory, addNewProduct, addNewSpecificate, addVariants, CountHeaderData, deleteBrand, deleteCategory, deleteProduct, deleteSpecification, deleteVariants, getProductOptions, getProductVariantsWithSpecs, updateProduct, updateProductVariants, UpdateSpecification } from "../Controllers/adminCrud/product.js";
import { dashboardHeader, dashboardHeaderAll } from "../Controllers/adminCrud/DashBoard.js"
import { deleteOrder, deleteOrderItems, headerOrder, orderByID, orderTable, OrderTableItemsByID, searchOrder, updateOrderitems } from "../Controllers/adminCrud/Order.js";
import { updateOrderStatus } from "../Controllers/adminCrud/updateOrderStatus.js";
import { cancelPayment, confirmPayment } from "../Controllers/adminCrud/payment.js";
import { cancelOrder } from "../Controllers/adminCrud/cancelOrder.js";
import { offerDelete, offerInsert, offerUpdate } from "../Controllers/adminCrud/Offer.js";


const adminRouter = Router();
// Every route needs a valid token AND the permission named on it (see Utils/rbac.js).
adminRouter.use(validateToken_refresh_token);

adminRouter.post("/addNewBrand", authorize("catalog:write"), upload.single('images'), addNewBrand);
adminRouter.post("/addNewCategory", authorize("catalog:write"), addNewCategory);
adminRouter.delete("/deleteBrand", authorize("catalog:write"), deleteBrand);
adminRouter.delete("/deleteCategory", authorize("catalog:write"), deleteCategory);
adminRouter.post("/addNewProduct", authorize("catalog:write"), upload.array("images", 10), addNewProduct);
adminRouter.put("/updateProduct", authorize("catalog:write"), updateProduct);
adminRouter.put("/updateSpec", authorize("catalog:write"), UpdateSpecification);
adminRouter.delete("/deleteProduct", authorize("catalog:write"), deleteProduct);
adminRouter.delete("/deleteVariants", authorize("catalog:write"), deleteVariants);
adminRouter.get('/productHead', authorize("catalog:read"), CountHeaderData)
adminRouter.get('/productOptions', authorize("catalog:read"), getProductOptions)
adminRouter.get('/productVariantsWithSpecs', authorize("catalog:read"), getProductVariantsWithSpecs)
adminRouter.get('/dashboardHead', authorize("dashboard:read"), dashboardHeader);
adminRouter.get('/dashboardHeadAll', authorize("dashboard:read"), dashboardHeaderAll);
adminRouter.get('/tableOrderItemsByID/:order_id', authorize("order:read"), OrderTableItemsByID);
adminRouter.get('/orderByID/:order_id', authorize("order:read"), orderByID);
adminRouter.get('/tableOrder', authorize("order:read"), orderTable);
adminRouter.get('/searchTableOrder', authorize("order:read"), searchOrder);
adminRouter.get('/headerOrder', authorize("order:read"), headerOrder);
adminRouter.put('/updateOrderStatus/:order_id', authorize("order:update"), updateOrderStatus);
adminRouter.put('/confirmPayment/:order_id', authorize("payment:manage"), confirmPayment);
adminRouter.put('/cancelPayment/:order_id', authorize("payment:manage"), cancelPayment);
adminRouter.put('/cancelOrder/:order_id', authorize("order:update"), cancelOrder);
adminRouter.put('/UpdateOrderItems', authorize("order:update"), updateOrderitems);
adminRouter.delete('/deleleOrder/:DeleteOrderID', authorize("order:delete"), deleteOrder);
adminRouter.delete('/deleleSpec', authorize("catalog:write"), deleteSpecification);
adminRouter.delete('/deleteOrderItems/:orderItemsID', authorize("order:delete"), deleteOrderItems);
adminRouter.put('/offerInsert', authorize("promotion:write"), offerInsert)
adminRouter.put('/offerUpdate/:offerID', authorize("promotion:write"), offerUpdate)
adminRouter.delete('/offerDelete/:offerID', authorize("promotion:write"), offerDelete)
adminRouter.put('/updateVariants/:productVariantID', authorize("catalog:write"), upload.array('productImages', 10), updateProductVariants);
adminRouter.post('/addNewVariants', authorize("catalog:write"), upload.array('productImages', 10), addVariants)
adminRouter.post('/addNewSpecification', authorize("catalog:write"), addNewSpecificate)


export default adminRouter;