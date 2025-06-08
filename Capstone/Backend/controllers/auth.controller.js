import User from '../Models/user.model.js'; //Imports the user Database Schema to use for MongoDB
import Portfolio from '../Models/portfolio.model.js'; 
import bcryptjs from 'bcryptjs'; //Imports the functions for encrypting passwords with a hash
import { errorHandler } from './error.controller.js';//Imports the Error handler function which can be used to define custom error messages
import jwt from 'jsonwebtoken';//Imports the JWT web token for authentication purposes

//Creates a function that sends data to database for creating a new account
export const signup = async (req, res, next) => {
    const { username, firstname, lastname, email, password } = req.body;
    const level = "User"; // Default user level

    try {
        //Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(errorHandler(400, 'User already exists'));
        }

        //Hash the password
        const hashedPassword = bcryptjs.hashSync(password, 10);

        //Create a new user in MongoDB
        const newUser = new User ({ username, firstname, lastname, email, password: hashedPassword, level });
        await newUser.save();

        //Automatically create a portfolio for the new user
        const newPortfolio = new Portfolio({
            userId: newUser._id,
            firstName: firstname,
            lastName: lastname,
            stocks: [],
            availableFunds: 0
        });
        await newPortfolio.save();

        res.status(201).json({ message: "New User Account and Portfolio Created", user: newUser });
    } catch (error) {
        next(error);
    }
};

//Creates a function that is used to authenticate user that is being signed in
export const signin = async (req, res, next) => {
    const { username, password } = req.body; // Get input username and password

    try {
        // Find the user in the database
        const validUser = await User.findOne({ username });
        if (!validUser) return next(errorHandler(401, 'User does not exist'));

        // Validate password
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) return next(errorHandler(403, 'Incorrect Password'));

        // Generate JWT token
        const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);

        // Ensure Portfolio Exists (Fix for "Portfolio Not Found" Error)
        let portfolio = await Portfolio.findOne({ userId: validUser._id });
        if (!portfolio) {
            console.warn("Portfolio missing, creating a new one...");
            portfolio = new Portfolio({
                userId: validUser._id,
                firstName: validUser.firstname,
                lastName: validUser.lastname,
                stocks: [],
                availableFunds: 0
            });
            await portfolio.save();
        }

        // Send user data to frontend
        const { password: hashedPassword, ...userData } = validUser._doc;
        res.cookie('Access_Token', token, { httpOnly: true })
            .status(200)
            .json({ 
                user: {
                    userId: validUser._id, 
                    firstname: validUser.firstname, 
                    lastname: validUser.lastname, 
                    email: validUser.email,
                    level: validUser.level, 
                    availableFunds: portfolio.availableFunds
                } 
            });

    } catch (error) {
        next(error);
    }
};

//Sign out a User
export const signout = (req, res) => {
    res.clearCookie('Access_Token').status(200).json("Signout Successful");
};