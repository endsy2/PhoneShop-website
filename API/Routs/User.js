import { Router } from "express";
import { checkout } from "../Controllers/user/Order.js";
import upload from "../Utils/handleimg.js";
import { changePassword, getOrderByName, getUserInformation, updateUserInformation, uploadProfilePhoto } from "../Controllers/user/user.js";
import { validateToken_refresh_token } from "../Utils/jwt_validation_refresh_token.js";
import { generateQR, checkPayment, generateBakongToken } from "../Controllers/user/bakong.js";

const userRouter = Router();
userRouter.use(validateToken_refresh_token);
userRouter.post('/checkout', checkout)
userRouter.get('/userInfo', getUserInformation)
userRouter.put('/userInfo', upload.single('profile_picture'), updateUserInformation)
userRouter.post('/update-profile', upload.single('profile_picture'), updateUserInformation)
userRouter.post('/upload-photo', upload.single('profile_picture'), uploadProfilePhoto)
userRouter.post('/change-password', changePassword)
userRouter.get('/orderByName', getOrderByName)

// Bakong KHQR Payment
userRouter.post('/bakong/generate-qr', generateQR)
userRouter.post('/bakong/check-payment', checkPayment)
userRouter.post('/bakong/generate-token', generateBakongToken)

export default userRouter;