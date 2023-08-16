const express = require("express");
const db = require("./userModel");
const port = 3001;
const app = express();
const jwt = require("jsonwebtoken");

app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
const generateAccessToken = (id) => {
    const payload = {
        id,
    };
    return jwt.sign(payload, `task4`, { expiresIn: "24h" });
};

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
            const token = generateAccessToken(response.rows[0].Id);
            const id = response.rows[0].Id;
            res.status(200).json({ token, id });
        })
        .catch((error) => {
            res.status(500).send(error);
        });
});
app.post("/login", (req, res) => {
    db.login(req.body)
        .then((response) => {
            const token = generateAccessToken(response.rows[0].Id);
            const id = response.rows[0].Id;
            res.status(200).json({ token, id });
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
