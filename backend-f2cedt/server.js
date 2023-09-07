const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const battleRoomSchema = new mongoose.Schema({
    roomId: String,
    creator: String,
    opponent: String,
    active: Boolean,
});

const problemSchema = new mongoose.Schema({
    title: String,
    description: String,
    difficulty: String,
    testCases: [
        {
            input: String,
            output: String,
        },
    ],
    solution: String,
});

const BattleRoom = mongoose.model("BattleRoom", battleRoomSchema);
const Problem = mongoose.model("Problem", problemSchema);

app.post("/create-battle", async (req, res) => {
    const newRoomId = Math.random().toString(36).substring(2, 9);
    const newBattleRoom = new BattleRoom({
        roomId: newRoomId,
        creator: req.body.name,
        active: true,
    });
    await newBattleRoom.save();
    res.json({ roomId: newRoomId });
});

app.post("/join-battle", async (req, res) => {
    const roomIdToJoin = req.body.roomId;
    const battleRoom = await BattleRoom.findOne({
        roomId: roomIdToJoin,
        active: true,
    });
    if (battleRoom) {
        battleRoom.opponent = req.body.name;
        battleRoom.active = false;
        await battleRoom.save();
        res.status(200).send("Joined successfully");
    } else {
        res.status(404).send("Room not found or already full");
    }
});

app.get("/problems/:id", async (req, res) => {
    const problem = await Problem.findById(req.params.id);
    if (problem) {
        res.json(problem);
    } else {
        res.status(404).send("Problem not found");
    }
});

const submitSubmission = async (code, languageId, input, expectedOutput) => {
    const judge0BaseUrl = "http://54.175.132.186:2358/submissions";
    const data = {
        source_code: code,
        language_id: languageId,
        stdin: input,
        expected_output: expectedOutput,
    };
    const response = await fetch(judge0BaseUrl, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    });
    const jsonResponse = await response.json();
    return jsonResponse?.status?.description === "Accepted";
};

app.post("/submit-solution", async (req, res) => {
    const { roomId, code, languageId, problemId, name } = req.body;

    const problem = await Problem.findById(problemId);
    if (!problem) {
        return res.status(404).send("Problem not found");
    }

    const allTestCasesPassed = await Promise.all(
        problem.testCases.map((testCase) =>
            submitSubmission(code, languageId, testCase.input, testCase.output)
        )
    );

    if (allTestCasesPassed.every((result) => result)) {
        const battleRoom = await BattleRoom.findOne({ roomId });
        if (!battleRoom) {
            return res.status(404).send("Battle room not found");
        }
        battleRoom.active = false;
        await battleRoom.save();
        res.status(200).send(`${name} is the winner!`);
    } else {
        res.status(400).send("Solution did not pass all test cases");
    }
});

mongoose
    .connect("mongodb://localhost:27017/codingBattle", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is listening on port ${process.env.PORT}`);
        });
    })
    .catch((error) => console.log("Error connecting to MongoDB:", error));
