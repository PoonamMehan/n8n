import { Router } from "express";
import { addCredentialHandler, deleteCredentialHandler, editCredentialHandler, getAllCredentialHandler, getACredentialHandler, getACredentialWithPlatformHandler } from "../controllers/credential.controller.js";
import { jwtHandler } from "../middlewares/authorizationMiddleware.js";

const router: Router = Router();

router.route("/").post(jwtHandler, addCredentialHandler);
router.route("/").get(jwtHandler, getAllCredentialHandler);
router.route("/:id").get(jwtHandler, getACredentialHandler);
router.route("/:id").delete(jwtHandler, deleteCredentialHandler); //TODO: extract the id from req.bdy that is passed by the jwt_handler
router.route("/:id").put(jwtHandler, editCredentialHandler);
router.route("/platform/:platform").get(jwtHandler, getACredentialWithPlatformHandler);

export default router;