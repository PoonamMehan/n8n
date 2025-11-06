import { Router } from "express";
import { signupHandler, loginHandler } from "../controllers/user.controller.js";

const router: Router = Router();

router.route("/signup").post(signupHandler);
router.route("/login").post(loginHandler);

export default router;