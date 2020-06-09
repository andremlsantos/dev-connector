const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useCreateIndex: true,
        });

        console.log("MongoDb connected");
    } catch (err) {
        console.error(err, "MongoDb not connected");

        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;
