import mongoose from 'mongoose';//Imports files from the mongoDB

//Creates a new schema for the user database
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
    },
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    level: {
        type: String,
        required: true,
    }
}, {timestamps: true});

const User = mongoose.model('User', userSchema);//Creates a constant based for the user database with schema information imported

export default User;//Outputs the user object which has the database and user schema information
