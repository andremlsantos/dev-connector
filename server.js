const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const connectDB = require("./config/db");

// Connect to database
connectDB();

// Define routes
app.use("/api/users/", require("./routes/api/users"));
app.use("/api/posts/", require("./routes/api/posts"));
app.use("/api/auth/", require("./routes/api/auth"));
app.use("/api/profile/", require("./routes/api/profile"));

// Start listening
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
