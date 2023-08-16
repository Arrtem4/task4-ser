const express = require("express");
const session = require("cookie-session");
const hpp = require("hpp");
const db = require("./userModel");
const jwt = require("jsonwebtoken");
const port = 3001;
const app = express();

app.use(hpp());
app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
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

const accessCheck = (req, res) => {
    const token = req.session?.user?.JWT;
    if (!token) {
        return res.status(401).send("Unauthorized request");
    }
    jwt.verify(token, "task4", (err, decoded) => {
        if (err) {
            return res.status(401).send("Unauthorized request");
        }
        console.log(decoded);
        db.getUser(decoded.id)
            .then((response) => {
                console.log("1weew");
                console.log(response);
                if (response[0].Blocked) {
                    console.log(`3`)
                     res.status(401).send("Unauthorized request");
                }
            })
            .catch((error) => {
                console.log("2");
                 res.status(500).send(error);
            });
    });
    return true;
};

const generateAccessToken = (id) => {
    const payload = {
        id,
    };
    return jwt.sign(payload, "task4", { expiresIn: "24h" });
};

app.get("/auth", (req, res) => {
    if (!accessCheck(req, res)) {
        return res.status(500).send(`undefined error`);
    }
    return res.status(200).send();
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
app.get("/user/:email", (req, res) => {
    db.CheckEmail(req.params.email)
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
            res.status(200);
        })
        .catch((error) => {
            res.status(403).send(error);
        });
});
app.post("/login", (req, res) => {
    db.login(req.body)
        .then((response) => {
            req.session.user = {
                JWT: generateAccessToken(response.rows[0].Id),
            };
            console.log(req.session.user);
            res.status(200).send(`ok`);
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
