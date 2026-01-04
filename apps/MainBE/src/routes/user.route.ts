import { Router } from "express";
import { signupHandler, loginHandler, signoutHandler, refreshJWTokens, getMe } from "../controllers/user.controller.js";

const router: Router = Router();

router.route("/signup").post(signupHandler);
router.route("/login").post(loginHandler);
router.route("/signout").post(signoutHandler);
router.route("/refreshToken").post(refreshJWTokens);
router.route("/me").get(getMe);

export default router;