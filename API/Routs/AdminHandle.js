import { Router } from "express";
import upload from "../Utils/handleimg.js";
import { validateToken_refresh_token } from "../Utils/jwt_validation_refresh_token.js";
import { addNewBrand, addNewCategory, addNewProduct, addNewSpecificate, addVariants, CountHeaderData, deleteBrand, deleteCategory, deleteProduct, deleteSpecification, deleteVariants, getProductOptions, updateProduct, updateProductVariants, UpdateSpecification } from "../Controllers/adminCrud/Product.js";
import { dashboardHeader, dashboardHeaderAll } from "../Controllers/adminCrud/DashBoard.js"
import { deleteOrder, deleteOrderItems, orderByID, orderTable, OrderTableItemsByID, searchOrder, updateOrderitems } from "../Controllers/adminCrud/Order.js";

import { offerDelete, offerInsert, offerUpdate } from "../Controllers/adminCrud/Offer.js";
import { headerOrder } from "../Controllers/adminCrud/Order.js";


const adminRouter = Router();
adminRouter.use(validateToken_refresh_token);

adminRouter.post("/addNewBrand", upload.single('images'), addNewBrand);
adminRouter.post("/addNewCategory", addNewCategory);
adminRouter.delete("/deleteBrand", deleteBrand);
adminRouter.delete("/deleteCategory", deleteCategory);
adminRouter.post("/addNewProduct", upload.array("images", 10), addNewProduct);
adminRouter.put("/updateProduct", updateProduct);
adminRouter.put("/updateSpec", UpdateSpecification);
adminRouter.delete("/deleteProduct", deleteProduct);
adminRouter.delete("/deleteVariants", deleteVariants);
adminRouter.get('/productHead', CountHeaderData)
adminRouter.get('/productOptions', getProductOptions)
adminRouter.get('/dashboardHead', dashboardHeader);
adminRouter.get('/dashboardHeadAll', dashboardHeaderAll);
adminRouter.get('/tableOrderItemsByID/:order_id', OrderTableItemsByID);
adminRouter.get('/orderByID/:order_id', orderByID);
adminRouter.get('/tableOrder', orderTable);
adminRouter.get('/searchTableOrder', searchOrder);
adminRouter.get('/headerOrder', headerOrder);
adminRouter.put('/UpdateOrderItems', updateOrderitems);
adminRouter.delete('/deleleOrder/:DeleteOrderID', deleteOrder);
adminRouter.delete('/deleleSpec', deleteSpecification);
adminRouter.delete('/deleteOrderItems/:orderItemsID', deleteOrderItems);
adminRouter.put('/offerInsert', offerInsert)
adminRouter.get('/offerUpdate/:offerID', offerUpdate)
adminRouter.delete('/offerDelete/:offerID', offerDelete)
adminRouter.put('/updateVariants/:productVariantID', upload.array('productImages', 10), updateProductVariants);
adminRouter.post('/addNewVariants', upload.array('productImages', 10), addVariants)
adminRouter.post('/addNewSpecification', addNewSpecificate)


export default adminRouter;