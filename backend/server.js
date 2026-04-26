const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const User = require("./models/user");
const bcrypt = require("bcryptjs");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// ðŸ”¥ CREATE DEFAULT ADMIN
async function createAdmin(){
    const existing = await User.findOne({ email: "admin123@gmail.com" });

    if(!existing){
        const hashed = await bcrypt.hash("adminpass123", 10);

        const admin = new User({
            name: "Admin",
            email: "admin123@gmail.com",
            password: hashed,
            role: "admin"
        });

        await admin.save();
        console.log("Default Admin Created");
    } else {
        console.log("✅ Admin already exists");
    }
}

createAdmin();

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/leave", require("./routes/leave"));
app.use("/api/qr", require("./routes/qr"));
app.use("/uploads", express.static("uploads"));
app.use("/api/hostel", require("./routes/hostel"));
app.use("/api/room", require("./routes/room"));

app.listen(5000, () => console.log("Server running on 5000"));
