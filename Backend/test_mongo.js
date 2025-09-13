require("dotenv").config();
console.log("URI:", process.env.MONGODB_URI);
const mongoose = require("mongoose");
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected");
        return mongoose.connection.db.listCollections().toArray();
    })
    .then((cols) => {
        console.log(
            "Collections:",
            cols.map((c) => c.name)
        );
        mongoose.connection.close();
    })
    .catch((err) => {
        console.error("Error:", err.message);
        process.exit(1);
    });
