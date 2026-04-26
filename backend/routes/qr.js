const router = require("express").Router();
const QR = require("../models/QR");
const qrcode = require("qrcode");

router.get("/generate", async (req,res)=>{

    try{

        const code = "HOSTEL-" + Date.now();

        const date = new Date().toISOString().split("T")[0];

        await QR.create({
            code,
            date
        });

        const qrImage = await qrcode.toDataURL(code);

        res.send({
            qrImage,
            code
        });

    }catch(err){

        res.status(500).send(err.message);

    }

});

module.exports = router;