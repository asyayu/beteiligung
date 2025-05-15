const express = require('express');
const router = express.Router();
const db = require('../config/db');

const { cityDistricts, channels, participation, futureReach, formats } = require('../config/data');


router.get("/visitor", (req, res) => {
    res.render("new", { cityDistricts, channels, participation, futureReach, formats });
});

router.post("/visitor", (req, res) => {
    console.log("Received request body:", req.body)
    try {

        // CHANNEL
        let channel = req.body.channel ? JSON.stringify(req.body.channel) : null

        // PARTICIPATION
        let participationMode = req.body.participationMode ? JSON.stringify(req.body.participationMode) : null

        // FUTURE REACH
        let futureReachMode = req.body.futureReachMode ? JSON.stringify(req.body.futureReachMode) : null

        // FORMAT
        let format = req.body.format ? JSON.stringify(req.body.format) : null

        // ANALOG/DIGITAL
        let { analogueOrDigital } = req.body;
        let aOrD = [];

        if (analogueOrDigital === "analog") {
            aOrD = ["analog"];
        } else if (analogueOrDigital === "digital") {
            aOrD = ["digital"];
        } else if (analogueOrDigital === "beides") {
            aOrD = ["analog", "digital"];
        }

        aOrD = JSON.stringify(aOrD);

        // AGE
        let age = req.body.age === '' ? null : Number(req.body.age);
        console.log("Received age:", req.body.age, "Converted age:", age);
        if (age !== null && (isNaN(age) || age < 0 || age > 110)) {
            return res.status(400).json({ error: 'Ungültiges Alter.' });
        }

        // CITY DISTRICT
        let stadtbezirk = req.body.notFromDD ? 'Nicht aus Dresden' : (req.body.stadtbezirk === '' ? null : req.body.stadtbezirk);
        if (req.body.stadtbezirk && req.body.notFromDD) {
            return res.status(400).json({ error: 'Ungültige Auswahl.' });
        }

        const insertQuery = `INSERT INTO \`${process.env.DB_TABLE}\` (age, stadtbezirk, kanal, beteiligung, erreichen_in_zukunft, beteiligungsformat, analog_digital) VALUES (?,?,?,?,?,?,?)`;
        const insertValues = [age, stadtbezirk, channel, participationMode, futureReachMode, format, aOrD];

        db.query(insertQuery, insertValues, (err, result) => {
            if (err) {
                console.error('Error saving data to the database: ', err.stack);
                return res.status(500).json({ error: 'Server error occurred while saving data.' });
            }
            console.log('Data saved to the database:', result);
            return res.status(200).json({ success: true, message: 'Visitor data successfully saved.' });
        })
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});

module.exports = router;