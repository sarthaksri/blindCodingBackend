const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios');
const base64 = require('base-64');
const { Userdata, Question, ActivityLog } = require('./models');
app.use(express.json());
require("dotenv").config();
require("./db");
const connectToMongo = require('./db');
const bodyParser = require('body-parser');
connectToMongo();
const port = process.env.port||4000;

app.get("/",(req,res)=>{
    return res.json({
        success:true,
        message:"YOUR SERVER IS ACTIVATED"
    })
  })

  app.use((_req,res,next)=>{
    res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', '*');
      res.header('Access-Control-Allow-Methods', '*');
    next();
  })
  app.use(cors({
    origin:"*",
    credentials:true
  }))

app.get('/addQuestion',async (req,res) => {
    try{
        const question = new Question({
            qno: 1,
            text: "Print Judge0",
            testcaseno: 3,
            samplein: "Judge0",
            sampleout: "Judge0",
            test_case1: "Judge0",
            test_case1_sol: "Judge0",
            test_case2: "Judge0",
            test_case2_sol: "Judge0",
            test_case3: "Judge0",
            test_case3_sol: "Judge0"
        });
        await question.save();
        res.send("Question added successfully");
    }catch(error){
        console.error(error);
        res.status(500).json({ error: error.message });
    }
})
app.post('/runCode', async (req, res) => {
    try {
        const data = req.body;
        const user = req.user;
        console.log(`User ID: ${user.id}`);

        const question = await Question.findOne({ qno: data.qNo });
        let input_data = "";

        const source_code = data.source_code;
        const language_id = data.language;

        const result = await submitCode(source_code, input_data, language_id);

        const response_data = {
            output: result,
            timestamp: log_entry.timestamp
        };

        res.json(response_data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/submitQuestion', async (req, res) => {
    try {
        const postData = req.body;
        const que = await Question.findOne({ qno: postData.qno });
        postData.stdin = `3\n${que.test_case1}\n${que.test_case2}\n${que.test_case3}`;
        const language_id = postData.language;
        const resp = await submitCode(postData.source_code, postData.stdin, language_id);
        let result = {};
        if (resp.output.toLowerCase().includes('error')) {
            result.output = resp.output;
        } else {
            const answer = `${que.test_case1_sol}\n${que.test_case2_sol}\n${que.test_case3_sol}\n`;
            const currUser = await Userdata.findOne({ user_id: req.user });
            if (answer === resp.output) {
                result.output = 'Correct Answer';
                if (currUser.answerGiven[postData.qNo] === '0') {
                    currUser.score += 10;
                    await currUser.save();
                }
                currUser.answerGiven = currUser.answerGiven.substring(0, postData.qNo) + '1' + currUser.answerGiven.substring(postData.qNo + 1);
            } else {
                result.output = 'Wrong answer..';
            }
            await currUser.save();
            result.score = currUser.score;
        }
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

async function submitCode(source_code, input_data, language_id) {

    // lang codes
    // 71 - Python
    // 50 - C
    // 54 - C++
    // 62 - Java
    

    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    };

    const submission_url = "https://104e-112-196-126-3.ngrok-free.app/submissions";
    const submission_payload = {
        source_code: source_code,
        stdin: input_data,
        language_id: language_id,
    };

    const submission_response = await axios.post(submission_url, submission_payload, { headers });
    const submission_data = submission_response.data;
    const token = submission_data.token;

    if (!token) {
        return { output: "Error creating submission." };
    } 

    let status_description = "Queue";
    let output_data = {};
    while (status_description !== "Accepted") {
        if (status_description.includes("Error")) {
            return { output: `Error: ${status_description}` };
        }
        console.log(`Checking Submission Status\nstatus: ${status_description}`);
        const output_response = await axios.get(`http://localhost:2358/submissions/${token}?base64_encoded=true`, { headers });
        output_data = output_response.data;
        status_description = output_data.status?.description;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (output_data.stdout) {
        const output = base64.decode(output_data.stdout).toString("utf-8");
        const dat = `Results:\n${output}\nExecution Time: ${output_data.time} Secs\nMemory Used: ${output_data.memory} bytes`;
        console.log(dat);
        return { output };
    } else if (output_data.stderr) {
        const error = base64.decode(output_data.stderr).toString("utf-8");
        return { output: `Error: ${error}` };
    } else {
        const compilation_error = base64.decode(output_data.compile_output).toString("utf-8");
        return { output: `Error: ${compilation_error}` };
    }
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  })