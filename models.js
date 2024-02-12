const mongoose = require('mongoose');

// Define Userdata Schema
const UserdataSchema = new mongoose.Schema({
    score: { type: Number, default: 0 },
    password : {type : String, required : true},
    name : {type : String, required : true},
    email : {type : String, required : true, unique:true}
});

// Define Question Schema
const QuestionSchema = new mongoose.Schema({
    qno: { type: Number, required: true },
    text: { type: String, required: true },
    testcaseno: { type: Number, required: true },
    samplein: { type: String, required: true },
    sampleout: { type: String},
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
