const express = require("express");
const cors = require("cors");
const session = require("cookie-session");
require("dotenv").config();

const db = require("./userModel");
const jwt = require("jsonwebtoken");
const port = 3001;
const app = express();

app.use(express.json());
app.use(
    session({
        name: "session",
        secret: process.env.SECRET_KEY,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        sameSite: "none",
        secure: true,
        httpOnly: true,
    })
);
app.use(
    cors({
        credentials: true,
        origin: "https://task-4-b9yf.onrender.com",
    })
);

const generateAccessToken = (id) => {
    const payload = {
        id,
    };
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "24h" });
};
const accessCheck = async (req) => {
    console.log(`access`, req.session.user);
    const token = req.session?.user?.JWT;
    if (!token) {
        throw new Error("No token");
    }
    const user = jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            throw new Error("Incorrect token");
        }
        return decoded;
    });
    const response = await db.getUser(user.id);
    if (response[0].Blocked) {
        req.session.user = null;
        throw new Error("User blocked");
    }
};

app.post("/login", async (req, res) => {
    try {
        const response = await db.login(req.body);
        req.session.user = {
            JWT: generateAccessToken(response.rows[0].Id),
        };
        res.status(200).send();
    } catch (error) {
        const errorMessage = error.message;
        res.status(403).json({ errorMessage });
    }
});
app.get("/logOut", async (req, res) => {
    try {
        delete req.session.user;
        res.status(200).send();
    } catch (error) {
        res.status(500).send(error);
    }
});
app.get("/auth", async (req, res) => {
    try {
        await accessCheck(req);
        res.status(200).send();
    } catch (error) {
        res.status(500).send(error);
    }
});
app.get("/getUsers", async (req, res) => {
    try {
        await accessCheck(req);
        const response = await db.getUsers();
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send(error);
    }
});
app.post("/registration", async (req, res) => {
    try {
        const response = await db.registration(req.body);
        req.session.user = {
            JWT: generateAccessToken(response.rows[0].Id),
        };
        res.status(200).send(response);
    } catch (error) {
        const errorMessage = error.message;
        res.status(403).json({ errorMessage });
    }
});
app.post("/blockUsers", async (req, res) => {
    try {
        await accessCheck(req);
        const response = await db.blockUsers(req.body.selectedUsers);
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send(error);
    }
});
app.post("/unblockUsers", async (req, res) => {
    try {
        await accessCheck(req);
        const response = await db.unblockUsers(req.body.selectedUsers);
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send(error);
    }
});
app.post("/deleteUsers", async (req, res) => {
    try {
        await accessCheck(req);
        const response = await db.deleteUsers(req.body.selectedUsers);
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send(error);
    }
});
app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});
