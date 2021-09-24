export interface IUserFormData {
    Email: string;
    Password: string;
    LastName: string;
    FirstName: string;
}

export interface IUser {
    email: string;
    lastName: string;
    firstName: string;
    createdAt: Date;
    updatedAt: Date;
    id: string;
}
