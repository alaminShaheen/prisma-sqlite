import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../Config/config";
import logging from "../Config/logging";
import { IUser } from "../Interfaces/user.interface";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "User not authenticated" });

    jwt.verify(token, config.token.accessTokenSecret, (err: any, user: any) => {
        if (err) {
            logging.error(err);
            return res.status(403).json({ message: "Token is invalid" });
        }
        logging.info("Token is verified and valid");
        req.user = user as IUser;
        next();
    });
};

const AuthMiddleware = {
    authenticateToken,
};

export default AuthMiddleware;
