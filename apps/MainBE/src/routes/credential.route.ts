import {Router} from "express";
import {addCredentialHandler, deleteCredentialHandler, editCredentialHandler, getAllCredentialHandler, getACredentialHandler, getACredentialWithPlatformHandler} from "../controllers/credential.controller.js";
import { jwtHandler } from "../middlewares/authorizationMiddleware.js";

const router: Router = Router();

router.route("/").post(jwtHandler, addCredentialHandler);
router.route("/").get(jwtHandler, getAllCredentialHandler);
router.route("/:id").get(jwtHandler, getACredentialHandler);
router.route("/").delete(jwtHandler, deleteCredentialHandler);
router.route("/").put(jwtHandler, editCredentialHandler);
router.route("/platform/:platform").get(getACredentialWithPlatformHandler);

export default router;