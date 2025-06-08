import mongoose from 'mongoose';//Imports files from the mongoDB

//Creates a new schema for the Calander database
const calanderSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: true,
    },
    month: {
        type: String,
        required: true,
    },
    day: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },

}, { timestamps: true });

const Calander = mongoose.model('Calander', calanderSchema);//Creates a constant based for the calander database with schema information imported

export default Calander;//Outputs the calander object which has the database and schema