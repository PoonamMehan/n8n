import {Router} from "express";
import {addCredentialHandler, deleteCredentialHandler, editCredentialHandler, getAllCredentialHandler, getACredentialHandler, getACredentialWithPlatformHandler} from "../controllers/credential.controller.js";
import { jwtHandler } from "../middlewares/authorizationMiddleware.js";

const router: Router = Router();

router.route("/").post(addCredentialHandler);
router.route("/").get( getAllCredentialHandler);
router.route("/:id").get( getACredentialHandler);
router.route("/:id").delete(deleteCredentialHandler); //TODO: extract the id from req.bdy that is passed by the jwt_handler
router.route("/").put(jwtHandler, editCredentialHandler);
router.route("/platform/:platform").get(getACredentialWithPlatformHandler);

export default router;