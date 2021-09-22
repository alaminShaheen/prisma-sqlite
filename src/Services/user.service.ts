import { User as UserModel, PrismaClient, Prisma } from "@prisma/client";
import { IUserFormData } from "../Interfaces/user.interface";
import bcrypt from "bcryptjs";
import logging from "../Config/logging";
import HttpException from "../Exceptions/httpException";
import { StatusCodes } from "../Exceptions/ApiStatusCodes";

const { user: User } = new PrismaClient();

const userInfoWithoutPassword = Prisma.validator<Prisma.UserSelect>()({
    email: true,
    lastName: true,
    firstName: true,
    id: true,
});

const findIfUserEmailExists = async (email: string) => {
    let emailExists = false;
    try {
        const _user = await User.findUnique({ where: { email } });
        emailExists = !!_user;
    } catch (error) {
        logging.error(error);
        throw new HttpException(StatusCodes.INTERNAL_SERVER);
    }
    return emailExists;
};

const registerUser = async (data: IUserFormData) => {
    const { Email, LastName, FirstName, Password } = data;
    if (
        !Email ||
        !Password ||
        !LastName ||
        !FirstName ||
        typeof Email !== "string" ||
        typeof Password !== "string" ||
        typeof LastName !== "string" ||
        typeof FirstName !== "string"
    )
        throw new HttpException(StatusCodes.BAD_REQUEST, "Invalid request");
    try {
        const hashedPassword = await bcrypt.hash(Password, 10);
        return await User.create({
            data: { email: Email, lastName: LastName, firstName: FirstName, password: hashedPassword },
            select: userInfoWithoutPassword,
        });
    } catch (error) {
        logging.error(error);
        throw new HttpException(StatusCodes.INTERNAL_SERVER);
    }
};

const registerUser = async (data: IUserFormData) => {
    const { Email, LastName, FirstName, Password } = data;
    if (
        !Email ||
        !Password ||
        !LastName ||
        !FirstName ||
        typeof Email !== "string" ||
        typeof Password !== "string" ||
        typeof LastName !== "string" ||
        typeof FirstName !== "string"
    )
        throw new HttpException(StatusCodes.BAD_REQUEST, "Invalid request");
    try {
        const hashedPassword = await bcrypt.hash(Password, 10);
        return await User.create({
            data: { email: Email, lastName: LastName, firstName: FirstName, password: hashedPassword },
            select: userInfoWithoutPassword,
        });
    } catch (error) {
        logging.error(error);
        throw new HttpException(StatusCodes.INTERNAL_SERVER);
    }
};

const UserServices = { findIfUserEmailExists, createUser: registerUser };

export default UserServices;
