const mongoose = require("mongoose");

const QRSchema = new mongoose.Schema({
    code: String,
    date: String
});

module.exports =
mongoose.models.QR || mongoose.model("QR", QRSchema);