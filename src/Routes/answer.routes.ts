import express from "express";
import answerController from "../Controllers/answer.controller";
// import AuthMiddleware from "../Middlewares/auth.middleware";

const router = express.Router();

// router.use(AuthMiddleware.authenticateToken);


router
.post("/:answerId", answerController.create)

export { router as answerRouter };
