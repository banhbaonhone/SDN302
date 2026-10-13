const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
require("dotenv").config();

const connectDb = require("./config/db");
const db = require("./models");
const ApiRouter = require("./routes/api.route");

const app = express();
app.use(bodyParser.json());
app.use(morgan("dev"));

app.get("/", async (req, res) => {
    res.status(200).send({ message: "Welcome to Restful API server" });
});

// Receive request
app.use("/", ApiRouter);

// Unknown routes -> JSON 404
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message });
});

const PORT = process.env.PORT || 9999;

app.listen(PORT, "localhost", () => {
    console.log(`Server running at: http://localhost:${PORT}`);
    // Connect database
    connectDb();
});