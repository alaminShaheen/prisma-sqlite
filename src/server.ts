import config from "./Config/config";
import logging from "./Config/logging";
import cors from "cors";
import express from "express";
import http from "http";
import dotenv from "dotenv";
// import { answerRouter } from "./Routes/answer.routes";
import { authRouter } from "./Routes/auth.routes";
import { protectedRouter } from "./Routes/protected.routes";
// import { questionRouter } from "./Routes/question.routes";
import { testRouter } from "./Routes/test.routes";

const router = express();
dotenv.config();

// server handling
const httpServer = http.createServer(router);

// logging middleware
router.use((req, res, next) => {
    logging.info(`METHOD: '${req.method}' - URL: '${req.url}' - IP: '${req.socket.remoteAddress}'`);

    res.on("finish", () => {
        logging.info(`METHOD: '${req.method}' - URL: '${req.url}' - IP: '${req.socket.remoteAddress}' - STATUS: '${res.statusCode}'`);
    });
    next();
});

// parse the body
router.use(express.urlencoded({ extended: true }));
// allow server to read incoming requests and their body as JSON format
router.use(express.json());
router.use(cors());

// Routes
router.use("/", testRouter);
// router.use("/questions", questionRouter);
// router.use("/answers", answerRouter);
router.use("/auth", authRouter);
router.use("/", protectedRouter);

// Error handling
router.use((req, res, next) => {
    const error = new Error("Not found");
    return res.status(404).json({ message: error.message });
});

// Listen for requests
httpServer.listen(config.server.port, () => {
    logging.info(`Server is running at ${config.server.hostname}:${config.server.port} ...`);
});
