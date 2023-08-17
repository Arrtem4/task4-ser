const express = require("express");
const session = require("cookie-session");
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
    return jwt.sign(payload, "task4", { expiresIn: "24h" });
};
const accessCheck = async (req) => {
    const token = req.session?.user?.JWT;
    if (!token) {
        throw new Error("no token");
    }
    const user = jwt.verify(token, "task4", (err, decoded) => {
        if (err) {
            throw new Error("token error");
        }
        return decoded;
    });
    const response = await db.getUser(user.id);
    if (response[0].Blocked) {
        throw new Error("blocked");
    } else {
        return "ok";
    }
};
const logOut = async (req) => {
    req.session.user = null;
};

app.get("/logOut", (req, res) => {
    logOut(req)
        .then((response) => {
            res.status(200).send(response);
        })
        .catch((error) => {
            res.status(500).send(error);
        });
});
app.get("/auth", (req, res) => {
    accessCheck(req)
        .then((response) => {
            res.status(200).send(response);
        })
        .catch((error) => {
            res.status(500).send(error);
        });
});
app.get("/", (_, res) => {
    db.getUsers()
        .then((response) => {
            res.status(200).send(response);
        })
        .catch((error) => {
            res.status(500).send(error);
        });
});
app.get("/userId/:id", (req, res) => {
    db.getUser(req.params.id)
        .then((response) => {
            res.status(200).send(response);
        })
        .catch((error) => {
            res.status(500).send(error);
        });
});
app.post("/registration", (req, res) => {
    db.registration(req.body)
        .then((response) => {
            req.session.user = {
                JWT: generateAccessToken(response.rows[0].Id),
            };
            res.status(200).json({});
        })
        .catch((error) => {
            res.status(403).json({ error });
        });
});
app.post("/login", (req, res) => {
    db.login(req.body)
        .then((response) => {
            req.session.user = {
                JWT: generateAccessToken(response.rows[0].Id),
            };
            res.status(200).json({});
        })
        .catch((error) => {
            res.status(403).json({ error });
        });
});
// app.delete("/users/:id", (req, res) => {
//     users
//         .deleteUser(req.params.id)
//         .then((response) => {
//             res.status(200).send(response);
//         })
//         .catch((error) => {
//             res.status(500).send(error);
//         });
// });
app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});
