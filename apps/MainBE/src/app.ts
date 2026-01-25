import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import workflowRouter from "./routes/workflow.route.js";
import credentialRouter from "./routes/credential.route.js";
import webhookRouter from "./routes/webhookTrigger.route.js";
import { Kafka } from "kafkajs";
const app: Application = express();

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
})

export const producer = kafka.producer();

await producer.connect();

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
app.use("/webhook", webhookRouter);

export default app;