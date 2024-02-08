const mongoose = require('mongoose');

// Define Userdata Schema
const UserdataSchema = new mongoose.Schema({
    user_id: { type: String, required: true }, // Assuming user_id is a string
    score: { type: Number, default: 0 },
    answerGiven: { type: String, default: '0' } // Assuming NUMBER_OF_QUESTIONS is predefined
});

// Define Question Schema
const QuestionSchema = new mongoose.Schema({
    qno: { type: Number, required: true },
    text: { type: String, required: true },
    testcaseno: { type: Number, required: true },
    samplein: { type: String, required: true },
    sampleout: { type: String, required: true },
    test_case1: { type: String },
    test_case1_sol: { type: String },
    test_case2: { type: String },
    test_case2_sol: { type: String },
    test_case3: { type: String },
    test_case3_sol: { type: String }
});

// Create models from the schemas
const Userdata = mongoose.model('Userdata', UserdataSchema);
const Question = mongoose.model('Question', QuestionSchema);

module.exports = { Userdata, Question };
