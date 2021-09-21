import { User as UserModel, PrismaClient, Prisma } from "@prisma/client";
import { IUserFormData } from "../Interfaces/user.interface";
import bcrypt from "bcryptjs";
import logging from "../Config/logging";

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
    }
    return emailExists;
};

const createUser = async (data: IUserFormData) => {
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
        throw new Error("Invalid request");
    try {
        const hashedPassword = await bcrypt.hash(Password, 10);
        return await User.create({
            data: { email: Email, lastName: LastName, firstName: FirstName, password: hashedPassword },
            select: userInfoWithoutPassword,
        });
    } catch (error) {
        const _error = error as Error;
        throw new Error(_error.message);
    }
};

const UserServices = { findIfUserEmailExists, createUser };

export default UserServices;
