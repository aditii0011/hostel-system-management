const router = require("express").Router();
const User = require("../models/user");
const HostelChangeRequest = require("../models/HostelChangeRequest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

console.log('Auth routes loaded'); // Debug log

// Register
router.post("/register", async (req, res) => {
    try {
        const hashed = await bcrypt.hash(req.body.password, 10);

        const user = new User({
            ...req.body,
            password: hashed
        });

        await user.save();
        res.send(user);

    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) return res.status(400).send("User not found");

        const valid = await bcrypt.compare(req.body.password, user.password);

        if (!valid) return res.status(400).send("Invalid password");

        res.send({ user });

    } catch (err) {
        res.status(500).send(err.message);
    }
});
// Get all students (Warden)
router.get("/students", async (req, res) => {
    const students = await User.find({ role: "student" });
    res.send(students);
});

// Create Warden (Admin only)
router.post("/create-warden", async (req,res)=>{
    try {
        const bcrypt = require("bcryptjs");
        const User = require("../models/user");

        const hashed = await bcrypt.hash(req.body.password,10);

        const user = new User({

        name:req.body.name,
        email:req.body.email,
        password:hashed,

        role:"warden",

        wardenId:req.body.wardenId,
        hostelName:req.body.hostelName

        });

        await user.save();

        res.json({ message: "Warden Created" });
    } catch (err) {
        res.status(500).send(err.message);
    }
});
router.get("/students/:hostel", async(req,res)=>{

const students = await User.find({

role:"student",
hostelName:req.params.hostel

});

res.send(students);

});

router.put("/update-warden/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== "warden") {
            return res.status(400).send("Invalid warden");
        }

        user.hostelName = req.body.hostelName;
        await user.save();
        res.send("Warden reassigned");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Update student room within current hostel
router.put("/update-student/:id", async (req, res) => {
    try {
        console.log('Update student request:', req.params.id, req.body);
        const student = await User.findById(req.params.id);
        console.log('Found student:', student);
        if (!student || student.role !== "student") {
            console.log('Invalid student:', student);
            return res.status(400).send("Invalid student.");
        }
        if (!req.body.room) {
            console.log('No room provided');
            return res.status(400).send("Room number is required.");
        }

        const roomNumber = Number(req.body.room);
        if (isNaN(roomNumber)) {
            console.log('Invalid room number:', req.body.room);
            return res.status(400).send("Room must be a valid number.");
        }

        student.room = roomNumber;
        await student.save();
        console.log('Student updated:', student);
        res.send("Student room updated.");
    } catch (err) {
        console.error('Error updating student:', err);
        res.status(500).send(err.message);
    }
});

// Get student details by ID (for parents to view ward info)
router.get("/student/:id", async (req, res) => {
    console.log('GET /student/:id called with id:', req.params.id);
    try {
        const lookupId = req.params.id;
        const studentQuery = {
            role: "student",
            $or: [{ studentId: lookupId }]
        };

        if (mongoose.Types.ObjectId.isValid(lookupId)) {
            studentQuery.$or.push({ _id: lookupId });
        }

        const student = await User.findOne(studentQuery);
        console.log('Found student:', student);
        if (!student) {
            return res.status(404).send("Student not found");
        }

        // Return only necessary information for parents
        res.send({
            _id: student._id,
            name: student.name || student.studentName,
            studentId: student.studentId,
            hostelName: student.hostelName,
            room: student.room,
            studentPhone: student.studentPhone,
            parentName: student.parentName,
            parentPhone: student.parentPhone
        });
    } catch (err) {
        console.error('Error in student route:', err);
        res.status(500).send(err.message);
    }
});

// Delete user
router.delete("/delete/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.send("User deleted successfully");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get("/all", async (req, res) => {
    const users = await User.find();
    res.send(users);
});

// Warden sends a hostel change request for a student
router.post("/request-hostel-change", async (req, res) => {
    try {
        const { studentId, requestedHostel, requestedRoom, wardenId, wardenName } = req.body;
        if (!studentId || !requestedHostel || !requestedRoom || !wardenId) {
            return res.status(400).json({ message: "Missing required request data." });
        }

        const student = await User.findOne({ _id: studentId, role: "student" });
        if (!student) {
            return res.status(400).json({ message: "Student not found." });
        }

        if (student.hostelName === requestedHostel) {
            return res.status(400).json({ message: "Requested hostel is the same as current hostel." });
        }

        const existing = await HostelChangeRequest.findOne({ studentId, status: "PENDING" });
        if (existing) {
            return res.status(400).json({ message: "A pending request already exists for this student." });
        }

        const request = new HostelChangeRequest({
            studentId,
            studentName: student.name || student.studentName || "Unknown",
            currentHostel: student.hostelName || "",
            currentRoom: student.room || "",
            requestedHostel,
            requestedRoom,
            wardenId,
            wardenName
        });

        await request.save();
        res.json({ message: "Hostel change request submitted." });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Admin fetches hostel change requests
router.get("/hostel-change-requests", async (req, res) => {
    try {
        const query = {};
        if (req.query.status) {
            query.status = req.query.status;
        }
        const requests = await HostelChangeRequest.find(query).sort({ createdAt: -1 });
        res.send(requests);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Approve hostel change request and update student hostel
router.put("/hostel-change-requests/:id/approve", async (req, res) => {
    try {
        const request = await HostelChangeRequest.findById(req.params.id);
        if (!request || request.status !== "PENDING") {
            return res.status(400).send("Invalid request or already processed.");
        }

        const student = await User.findOne({ _id: request.studentId, role: "student" });
        if (!student) {
            return res.status(400).send("Student not found.");
        }

        student.hostelName = request.requestedHostel;
        if (request.requestedRoom) {
            student.room = request.requestedRoom;
        }
        await student.save();

        request.status = "APPROVED";
        request.adminComment = req.body.adminComment || "Approved by admin.";
        request.updatedAt = new Date();
        await request.save();

        res.send("Hostel change approved and updated.");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Reject hostel change request
router.put("/hostel-change-requests/:id/reject", async (req, res) => {
    try {
        const request = await HostelChangeRequest.findById(req.params.id);
        if (!request || request.status !== "PENDING") {
            return res.status(400).send("Invalid request or already processed.");
        }

        request.status = "REJECTED";
        request.adminComment = req.body.adminComment || "Rejected by admin.";
        request.updatedAt = new Date();
        await request.save();

        res.send("Hostel change request rejected.");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
