import { Document } from "mongoose";
import { IAnswer } from "./answer.interface";

export interface IQuestion extends Document {
	Title: string;
	Description?: string;
	CreatedBy: string;
	Answers?: IAnswer[];
	CreatedAt: Date;
}
