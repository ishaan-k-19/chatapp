import { body, validationResult, param, check } from 'express-validator';
import { ErrorHandler } from '../utils/utitlity.js';
import User from '../models/user.js';

/**
 * Middleware to handle validation errors.
 * If there are validation errors, they are formatted and passed to the error handler.
 */
const validateHandler = (req, res, next) => {
    const errors = validationResult(req); // Get validation errors from the request

    // Format errors as a single string
    const errorMessages = errors
        .array()
        .map(error => error.msg)
        .join(", ");

    // If no errors, proceed to the next middleware; otherwise, throw an error
    if (errors.isEmpty()) return next();
    else next(new ErrorHandler(errorMessages, 400));
};

/**
 * Validator for user registration.
 * Ensures all required fields are provided and checks for unique email/username.
 */
const registerValidator = () => [
    body("name", "Please Enter Name").notEmpty(),
    body("username", "Please Enter UserName").notEmpty(),
    body('username').custom(async value => {
        const existingUser = await User.find({ username: value.toLowerCase() });
        if (existingUser.length !== 0) {
            throw new ErrorHandler('This username is already taken, Please try different username', 400);
        }
    }),
    body("email", "Please Enter Email").notEmpty(),
    body("email").custom(async value => {
        const existingUser = await User.find({ email: value.toLowerCase() });
        if (existingUser.length !== 0) {
            throw new ErrorHandler('The user from this email already exists, Please try different email', 400);
        }
    }),
    body("bio", "Please Enter Bio").notEmpty(),
    body("password").isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];

/**
 * Validator for updating user profile.
 * Ensures required fields are provided.
 */
const updateProfileValidator = () => [
    body("name", "Please Enter Name").notEmpty(),
    body("username", "Please Enter UserName").notEmpty(),
    body("bio", "Please Enter Bio").notEmpty(),
];

/**
 * Validator for user login.
 * Ensures email and password are provided.
 */
const loginValidator = () => [
    body("email", "Please Enter Email").notEmpty(),
    body("password", "Please Enter Password").notEmpty(),
];

/**
 * Validator for creating a new group chat.
 * Ensures group name and members array are valid.
 */
const newGroupValidator = () => [
    body("name", "Please Enter Group Name").notEmpty(),
    body("members")
        .isArray({ min: 2, max: 100 }).withMessage("Members must be between 2 and 100")
        .notEmpty().withMessage("Please Enter members"),
];

/**
 * Validator for adding members to a group chat.
 * Ensures chat ID and members array are valid.
 */
const addMembersValidator = () => [
    body("chatId", "Please Enter Chat ID").notEmpty(),
    body("members")
        .isArray({ min: 1, max: 97 }).withMessage("Members must be between 1 and 97")
        .notEmpty().withMessage("Please Enter members"),
];

/**
 * Validator for removing a member from a group chat.
 * Ensures chat ID and user ID are provided.
 */
const removeMemberValidator = () => [
    body("chatId", "Please Enter Chat ID").notEmpty(),
    body("userId", "Please Enter User ID").notEmpty(),
];

/**
 * Validator for updating a user's password.
 * Ensures old and new passwords are provided and meet requirements.
 */
const updatePasswordValidator = () => [
    body("oldPassword", "Please Enter Old Password").notEmpty(),
    body("newPassword").isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];

/**
 * Validator for leaving a group chat.
 * Ensures the chat ID is provided as a URL parameter.
 */
const leaveGroupValidator = () => [
    param("id", "Please Enter Chat ID").notEmpty(),
];

/**
 * Validator for sending attachments in a chat.
 * Ensures chat ID is provided.
 */
const sendAttachmentsValidator = () => [
    body("chatId", "Please Enter Chat ID").notEmpty(),
];

/**
 * Validator for validating a chat ID provided as a URL parameter.
 */
const chtIdValidator = () => [
    param("id", "Please Enter Chat ID").notEmpty(),
];

/**
 * Validator for renaming a group chat.
 * Ensures chat ID and new group name are provided.
 */
const renameGroupValidator = () => [
    param("id", "Please Enter Chat ID").notEmpty(),
    body("name", "Please Enter Group Name").notEmpty(),
];

/**
 * Validator for sending a friend request.
 * Ensures the user ID is provided.
 */
const sendRequestValidator = () => [
    body("userId", "Please Enter User ID").notEmpty(),
];

/**
 * Validator for accepting a friend request.
 * Ensures request ID and acceptance status are provided.
 */
const acceptRequestValidator = () => [
    body("requestId", "Please Enter Request ID").notEmpty(),
    body("accept")
        .notEmpty().withMessage("Please Select Accept")
        .isBoolean().withMessage("Accept must be a boolean"),
];

/**
 * Validator for admin login.
 * Ensures the secret key is provided.
 */
const adminLoginValidator = () => [
    body("secretKey", "Please Enter Secret Key").notEmpty(),
];


export {
    registerValidator,
    validateHandler, 
    loginValidator, 
    newGroupValidator, 
    addMembersValidator, 
    removeMemberValidator, 
    leaveGroupValidator, 
    sendAttachmentsValidator, 
    chtIdValidator, 
    renameGroupValidator, 
    sendRequestValidator, 
    acceptRequestValidator, 
    adminLoginValidator, 
    updateProfileValidator,
    updatePasswordValidator,
};