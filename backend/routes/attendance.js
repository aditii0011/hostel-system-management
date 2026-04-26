const router = require("express").Router();
const Attendance = require("../models/Attendance");
const User = require("../models/user");

function normalizeDate(value) {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getDateVariants(value) {
    const normalized = normalizeDate(value);
    const variants = new Set();

    if (normalized) {
        variants.add(normalized);

        const [year, month, day] = normalized.split("-");
        if (year && month && day) {
            variants.add(`${day}/${month}/${year}`);
        }
    }

    if (value) {
        variants.add(String(value).trim());
    }

    return Array.from(variants).filter(Boolean);
}

// mark attendance
router.post("/mark", async(req,res)=>{
    const normalizedDate = normalizeDate(req.body.date);
    const studentId = (req.body.studentId || "").trim();

    if (!studentId || !normalizedDate) {
        return res.status(400).send("studentId and date are required.");
    }

    const existingRecord = await Attendance.findOne({
        studentId,
        date: normalizedDate
    });

    if (existingRecord) {
        existingRecord.studentName = req.body.studentName || existingRecord.studentName;
        existingRecord.room = req.body.room ?? existingRecord.room;
        existingRecord.hostelName = req.body.hostelName || existingRecord.hostelName;
        existingRecord.status = req.body.status || existingRecord.status || "PRESENT";
        await existingRecord.save();

        return res.send("Attendance already marked for today.");
    }

    const record = new Attendance({
        ...req.body,
        studentId,
        date: normalizedDate
    });
    await record.save();

    res.send("Attendance marked");

});


// student attendance history
router.get("/student/:id", async(req,res)=>{

    const data = await Attendance.find({
        studentId:req.params.id
    }).sort({ date: -1, _id: -1 });

    res.send(data);

});


// warden attendance by date
router.get("/date/:date", async(req,res)=>{
    const dateVariants = getDateVariants(req.params.date);
    const hostel = (req.query.hostel || "").trim();

    const query = {
        date: { $in: dateVariants }
    };

    if(hostel){
        const hostelStudents = await User.find(
            { role: "student", hostelName: hostel },
            { studentId: 1, _id: 0 }
        ).lean();

        const hostelStudentIds = hostelStudents
            .map(student => student.studentId)
            .filter(Boolean);

        query.$or = [
            { hostelName: hostel },
            { hostelName: new RegExp(`^${hostel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }
        ];

        if (hostelStudentIds.length > 0) {
            query.$or.push({ studentId: { $in: hostelStudentIds } });
        }
    }

    const data = await Attendance.find(query).sort({ studentName: 1, _id: 1 });

    res.send(data);

});


module.exports = router;
