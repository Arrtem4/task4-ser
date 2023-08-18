const express = require("express");
const session = require("cookie-session");
require("dotenv").config();
const helmet = require("helmet");
const hpp = require("hpp");
const db = require("./userModel");
const jwt = require("jsonwebtoken");
const port = 3001;
const app = express();
app.use(helmet());
app.use(hpp());
app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", true);
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
app.use(
    session({
        name: "session",
        secret: `task4`,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        // secure: true,
    })
);

const generateAccessToken = (id) => {
    const payload = {
        id,
    };
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "24h" });
};
const accessCheck = async (req) => {
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
        throw new Error("User blocked");
    }
};
const logOut = async (req) => {
    req.session.user = null;
};
app.post("/login", async (req, res) => {
    try {
        const response = await db.login(req.body);
        req.session.user = {
            JWT: generateAccessToken(response.rows[0].Id),
        };
        res.status(200).send(response);
    } catch (error) {
        const errorMessage = error.message;
        res.status(403).json({ errorMessage });
    }
});
app.get("/logOut", async (req, res) => {
    try {
        const response = await logOut(req);
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send(error);
    }
});
app.get("/auth", async (req, res) => {
    try {
        const response = await accessCheck(req);
        res.status(200).send(response);
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
