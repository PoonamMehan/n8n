import { Router } from "express";
import { signupHandler, loginHandler, signoutHandler, refreshJWTokens, getMe } from "../controllers/user.controller.js";
import { jwtHandler } from "../middlewares/authorizationMiddleware.js";

const router: Router = Router();

router.route("/signup").post(signupHandler);
router.route("/login").post(loginHandler);
router.route("/signout").post(jwtHandler, signoutHandler);
router.route("/refreshToken").get(refreshJWTokens);
router.route("/me").get(getMe);

export default router;