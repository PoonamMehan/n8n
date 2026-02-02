import { Router } from "express";
import { signupHandler, loginHandler, signoutHandler, refreshJWTokens, getMe, generateTokenForWsConnection, googleAuthCallbackHandler, googleAuthRequestHandler, magicLinkHandler, startAuthHandler } from "../controllers/user.controller.js";
import { jwtHandler } from "../middlewares/authorizationMiddleware.js";

const router: Router = Router();

router.route("/signup").post(signupHandler);
router.route("/login").post(loginHandler);
router.route("/startAuth").post(startAuthHandler);
router.route("/signout").post(jwtHandler, signoutHandler);
router.route("/refreshToken").get(refreshJWTokens);
router.route("/me").get(getMe);
router.route("/generateTokenForWsConnection").post(generateTokenForWsConnection);
router.route("/google/login").get(googleAuthRequestHandler);
router.route("/google/callback").get(googleAuthCallbackHandler); //TODO: add jwtHandler middleware
router.route("/magic-login").get(magicLinkHandler);
router.route("/magic-verification").get(magicLinkHandler);

export default router; 