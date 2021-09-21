import { NextFunction, Request, Response } from "express";
import logging from "../Config/logging";
import { IAnswer } from "../Interfaces/answer.interface";
import Answer from "../Models/answer.model";
import Question from "../Models/question.model";

const create = async (req: Request, res: Response, next: NextFunction) => {
	const answerId = req.params.answerId;
	logging.info(`Attempting to create new answer to question ${answerId}`);
	const { Description, CreatedBy }: IAnswer = req.body;
	if (!Description || !CreatedBy || typeof Description !== "string" || typeof CreatedBy !== "string") {
		return res.status(400).json({ message: "Invalid request" });
	}
	try {
		const question = await Question.findById({ _id: answerId });
		if (!question) throw new Error("Question does not exist");
		else {
			const answer = await Answer.create({ Description, CreatedBy });
			console.log(answer);
			await Question.updateOne({ _id: answerId }, { $push: { Answers: answer } });
			logging.info(`New answer ${answer._id} created`);
			return res.status(201).json(answer);
		}
	} catch (error: any) {
		logging.error(error);
		return res.status(500).json({ message: error.message });
	}
};

const answerController = { create };

export default answerController;
