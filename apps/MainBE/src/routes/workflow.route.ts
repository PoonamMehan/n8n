import { Router } from "express";
import { createWorkflow, getWorkflows, getParticularWorkflow, editParticularWorkflow } from "../controllers/workflow.controller.js";

const router: Router = Router();

router.route("/").post(createWorkflow);

router.route("/").get(getWorkflows); // get all the entries in the workflow table

router.route("/:id").get(getParticularWorkflow);   // just get the particular workflow
router.route("/:id").put(editParticularWorkflow);
// you start filling in the data to the workflow table to the fields "enabled", "nodes", "connections"

export default router;