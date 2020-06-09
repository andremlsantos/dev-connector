const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const connectDB = require("./config/db");

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

// Connect to database
connectDB();

app.get("/", (req, res) => {
    res.status(200).json({
        message: "API RUNNING",
    });
});
