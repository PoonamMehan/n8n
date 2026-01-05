import express, {Application} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import workflowRouter from "./routes/workflow.route.js";
import credentialRouter from "./routes/credential.route.js";

const app: Application = express();

app.use(express.json());
app.use(cors({
    origin: '*',
    credentials: true
}))
app.use(express.urlencoded({}));
app.use(cookieParser());

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/workflow", workflowRouter);
app.use("/api/v1/credential", credentialRouter);

export default app;