import { NextFunction, Request, Response } from "express";
import logging from "../Config/logging";
import { IQuestion } from "../Interfaces/question.interface";
import Answer from "../Models/answer.model";
import Question from "../Models/question.model";
import User from "../Models/user.model";

const create = async (req: Request, res: Response, next: NextFunction) => {
    logging.info("Attempting to create new question");
    const { Title, Description, CreatedBy, CreatedAt }: IQuestion = req.body;

    if (!Title || !CreatedBy || !Description || typeof Description !== "string" || typeof Title !== "string" || typeof CreatedBy !== "string") {
        return res.status(400).json({ message: "Invalid request" });
    }

    try {
        const question = await Question.create({ Title, Description, CreatedBy, Answers: [] });
        logging.info(`New Question ${question._id} created`);
        return res.status(201).json(question);
    } catch (error) {
        logging.error(error);
        return res.status(500).json({ error });
    }
};

const getQuestions = async (req: Request, res: Response, next: NextFunction) => {
    logging.info(`Incoming get request for all questions`);
    try {
        const questions = await Question.find().exec();
        return res.status(200).json({ questions, count: questions.length });
    } catch (error) {
        logging.error(error);
        return res.status(500).json({ error });
    }
};

const getQuestion = async (req: Request, res: Response, next: NextFunction) => {
    const questionId = req.params.questionId;
    logging.info(`Incoming get request for questions ${questionId}`);
    try {
        const question = await Question.findById(questionId);
        if (!question) return res.sendStatus(404).json({ message: "Question not found" });
        return res.status(200).json({ question });
    } catch (error) {
        logging.error(error);
        return res.status(500).json({ error });
    }
};

const updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
    const questionId = req.params.questionId;
    const { Title, Description }: IQuestion = req.body;
    logging.info(`Incoming put request for question ${questionId}`);
    if (!Title || !Description) return res.status(400).json({ message: "Invalid request" });
	const user = req?.user;
    try {
		const _question = await Question.findById(questionId);
		if (!_question) return res.status(404).json({ message: "Question does not exist" });
		const _user = await User.findById(user?._id);
		const isAuthorizedToUpdate = `${_user?.FirstName} ${_user?.LastName}` === _question?.CreatedBy;
		if(isAuthorizedToUpdate) {
			const _updatedQuestion = await _question.update({Title, Description}, {new: true});
			return res.status(200).json(_updatedQuestion);
		} else return res.status(400).json({message: "You are not authorized to edit this question"}) 
    } catch (error) {
        logging.error(error);
        return res.status(500).json({ error });
    }
};

const deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
    const questionId = req.params.questionId;
    logging.info(`Incoming delete request for question ${questionId}`);
	const user = req?.user;
    try {
		const _question = await Question.findById(questionId);
		if (!_question) return res.status(404).json({ message: "Question does not exist" });
		const _user = await User.findById(user?._id);
		const isAuthorizedToDelete = `${_user?.FirstName} ${_user?.LastName}` === _question?.CreatedBy
		if(isAuthorizedToDelete) {
			if (_question.Answers) {
				for (const answer of _question.Answers) {
					await Answer.findByIdAndDelete(answer._id);
				}
			}
			await _question.delete();
			// const question = await Question.findByIdAndDelete(questionId, { new: true });
			return res.status(200).json(_question);
		} else return res.status(400).json({message: "You are not authorized to delete this question"})
    } catch (error) {
        logging.error(error);
        return res.status(500).json({ error });
    }
};

const questionController = {
    create,
    getQuestion,
    getQuestions,
    deleteQuestion,
    updateQuestion,
};

export default questionController;
