import {Router} from "express";
import {addCredentialHandler, deleteCredentialHandler, editCredentialHandler} from "../controllers/credential.controller.js";

const router: Router = Router();

router.route("/").post(addCredentialHandler);
router.route("/").delete(deleteCredentialHandler);
router.route("/").put(editCredentialHandler);

export default router;