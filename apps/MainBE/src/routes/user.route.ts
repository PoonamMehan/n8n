import { Router } from "express";
import { signupHandler, loginHandler, signoutHandler,  } from "../controllers/user.controller.js";
import { jwtHandler } from "../middlewares/authorizationMiddleware.js";

const router: Router = Router();

router.route("/signup").post(signupHandler);
router.route("/login").post(loginHandler);
router.route("/signout").post(signoutHandler);
router.route("/refreshToken").post(refreshJWTokens);

export default router;