import { Router } from "express";
import { createWorkflow, getWorkflows, getParticularWorkflow, editParticularWorkflow, deleteAParticularWorkflow } from "../controllers/workflow.controller.js";
import { jwtHandler } from "../middlewares/authorizationMiddleware.js";


const router: Router = Router();

router.route("/").post(jwtHandler, createWorkflow); //TODO: JWT handler

router.route("/").get(jwtHandler, getWorkflows); // get all the entries in the workflow table

// router.route("/:id").get(jwtHandler, getParticularWorkflow);   // just get the particular workflow
router.route("/:id").get(jwtHandler, getParticularWorkflow);// just get the particular workflow
router.route("/:id").put(jwtHandler, editParticularWorkflow);
router.route("/:id").delete(jwtHandler, deleteAParticularWorkflow);
// TODO: deleteAParticularWorkflow    (get("/:id"));
// you start filling in the data to the workflow table to the fields "executing", "nodes", "connections"

export default router;