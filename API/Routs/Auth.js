import { Router } from "express";
import { adminLogin, adminRegister } from "../Controllers/auth/authAdminController.js"
import { handlelogin, logout, register } from "../Controllers/auth/authUserController.js";
import { validateToken_refresh_token } from "../Utils/jwt_validation_refresh_token.js";
import { authorize } from "../Utils/rbac.js";

const AuthRouter = Router();

AuthRouter.post("/login", handlelogin);
AuthRouter.post("/register", register);
AuthRouter.post("/logout", logout);
AuthRouter.post("/adminLogin", adminLogin);
// Creating staff accounts is admin-only; there is no public admin sign-up.
AuthRouter.post("/adminRegister", validateToken_refresh_token, authorize("staff:manage"), adminRegister);
AuthRouter.post("/adminLogout", logout);
export default AuthRouter;
