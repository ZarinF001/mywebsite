const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server Running");
});

app.listen(5000, () => {
    console.log("Server Running");
});
app.post("/signup", (req, res) => {
    const { name, email, password } = req.body;

    db.query(
        "INSERT INTO users(name,email,password) VALUES(?,?,?)",
        [name, email, password],
        (err, result) => {
            if (err) {
                res.status(400).json({
                    status: "error",
                    message: err.message
                });
            } else {
                res.status(201).json({
                    status: "ok",
                    message: "User Added"
                });
            }
        }
    );
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email = ? AND password = ?",
        [email, password],
        (err, result) => {
            if (err) {
                res.status(400).json({
                    status: "error",
                    message: err.message
                });
            } else if (result.length > 0) {
                res.status(200).json({
                    status: "ok",
                    message: "Login Successful",
                    user: result[0]
                });
            } else {
                res.status(401).json({
                    status: "error",
                    message: "Invalid Email or Password"
                });
            }
        }
    );
});

// Get all routines for a user
app.get("/routines/:userId", (req, res) => {
    const { userId } = req.params;

    db.query(
        "SELECT * FROM routines WHERE user_id = ? ORDER BY created_at DESC",
        [userId],
        (err, result) => {
            if (err) {
                res.status(400).json({
                    status: "error",
                    message: err.message
                });
            } else {
                res.status(200).json({
                    status: "ok",
                    routines: result
                });
            }
        }
    );
});

// Add a new routine
app.post("/routine", (req, res) => {
    const { userId, title, description, completed } = req.body;

    db.query(
        "INSERT INTO routines(user_id, title, description, completed) VALUES(?,?,?,?)",
        [userId, title, description, completed || false],
        (err, result) => {
            if (err) {
                res.status(400).json({
                    status: "error",
                    message: err.message
                });
            } else {
                res.status(201).json({
                    status: "ok",
                    message: "Routine Added",
                    routine: {
                        id: result.insertId,
                        user_id: userId,
                        title,
                        description,
                        completed: completed || false
                    }
                });
            }
        }
    );
});

// Update routine completion status
app.put("/routine/:id", (req, res) => {
    const { id } = req.params;
    const { completed, title, description } = req.body;

    db.query(
        "UPDATE routines SET completed = ?, title = ?, description = ? WHERE id = ?",
        [completed, title, description, id],
        (err, result) => {
            if (err) {
                res.status(400).json({
                    status: "error",
                    message: err.message
                });
            } else {
                res.status(200).json({
                    status: "ok",
                    message: "Routine Updated"
                });
            }
        }
    );
});

// Delete a routine
app.delete("/routine/:id", (req, res) => {
    const { id } = req.params;

    db.query(
        "DELETE FROM routines WHERE id = ?",
        [id],
        (err, result) => {
            if (err) {
                res.status(400).json({
                    status: "error",
                    message: err.message
                });
            } else {
                res.status(200).json({
                    status: "ok",
                    message: "Routine Deleted"
                });
            }
        }
    );
});