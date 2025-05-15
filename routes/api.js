const express = require('express');
const router = express.Router();
const db = require('../config/db');


router.get('/stats', (_req, res) => {
    let avgAgeQuery = `SELECT ROUND(AVG(age), 1) AS average_age FROM \`${process.env.DB_TABLE}\``;
    // let pcQuery = "SELECT ROUND((COUNT(*) * 100.0) / (SELECT COUNT(*) FROM visitors WHERE stadtbezirk IS NOT NULL), 1) AS percentage_from_dresden FROM visitors WHERE stadtbezirk <> 'Nicht aus Dresden'";
    let pcParticipatingQuery = `SELECT ROUND((COUNT(*) * 100.0) / (SELECT COUNT(*) FROM \`${process.env.DB_TABLE}\` WHERE JSON_LENGTH(beteiligung) > 0), 1) AS pc_participating FROM \`${process.env.DB_TABLE}\` WHERE JSON_LENGTH(beteiligung) > 0 AND NOT JSON_CONTAINS(beteiligung, '"Gar nicht"')`;
    let totalQuery = `SELECT COUNT(*) AS total_responses FROM \`${process.env.DB_TABLE}\``;

    Promise.all([
        new Promise((resolve, reject) => {
            db.query(avgAgeQuery, (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(pcParticipatingQuery, (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(totalQuery, (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        })
    ])
        .then(([average_age, pc_participating, total_responses]) => {
            res.json({
                average_age,
                pc_participating,
                total_responses,
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Error retrieving stats");
        });
});

router.get('/channeldata', (_req, res) => {
    let channelQuery = `
    SELECT kanal, COUNT(*) as value
FROM (
    SELECT 
        JSON_UNQUOTE(JSON_EXTRACT(kanal, CONCAT('$[', numbers.n, ']'))) as kanal
    FROM 
        visitors
    JOIN (
        SELECT 0 as n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
        UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    ) numbers
    ON JSON_LENGTH(kanal) > numbers.n
    WHERE JSON_UNQUOTE(JSON_EXTRACT(kanal, CONCAT('$[', numbers.n, ']'))) IS NOT NULL
) as channel_list
WHERE kanal != 'erfolglos'
GROUP BY kanal;
  `;

    db.query(channelQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json(results);
    });
});


router.get('/participationdata', (_req, res) => {
    let channelQuery = `
    SELECT beteiligung, COUNT(*) as value
FROM (
    SELECT 
        JSON_UNQUOTE(JSON_EXTRACT(beteiligung, CONCAT('$[', numbers.n, ']'))) as beteiligung
    FROM 
        visitors
    JOIN (
        SELECT 0 as n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
        UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    ) numbers
    ON JSON_LENGTH(beteiligung) > numbers.n
    WHERE JSON_UNQUOTE(JSON_EXTRACT(beteiligung, CONCAT('$[', numbers.n, ']'))) IS NOT NULL
) as participation_list
GROUP BY beteiligung;
  `;

    db.query(channelQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json(results);
    });
});

router.get('/futurereachdata', (_req, res) => {
    let channelQuery = `
    SELECT erreichen_in_zukunft, COUNT(*) as value
FROM (
    SELECT 
        JSON_UNQUOTE(JSON_EXTRACT(erreichen_in_zukunft, CONCAT('$[', numbers.n, ']'))) as erreichen_in_zukunft
    FROM 
        visitors
    JOIN (
        SELECT 0 as n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
        UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    ) numbers
    ON JSON_LENGTH(erreichen_in_zukunft) > numbers.n
    WHERE JSON_UNQUOTE(JSON_EXTRACT(erreichen_in_zukunft, CONCAT('$[', numbers.n, ']'))) IS NOT NULL
) as reach_list
GROUP BY erreichen_in_zukunft
ORDER BY value DESC;
  `;

    db.query(channelQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json(results);
    });
});

router.get('/formatdata', (_req, res) => {
    let channelQuery = `
    SELECT beteiligungsformat, COUNT(*) as value
FROM (
    SELECT 
        JSON_UNQUOTE(JSON_EXTRACT(beteiligungsformat, CONCAT('$[', numbers.n, ']'))) as beteiligungsformat
    FROM 
        visitors
    JOIN (
        SELECT 0 as n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
        UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    ) numbers
    ON JSON_LENGTH(beteiligungsformat) > numbers.n
    WHERE JSON_UNQUOTE(JSON_EXTRACT(beteiligungsformat, CONCAT('$[', numbers.n, ']'))) IS NOT NULL
) as format_list
GROUP BY beteiligungsformat;
  `;

    db.query(channelQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json(results);
    });
});

router.get('/addata', (_req, res) => {
    let query = `
        SELECT 
            SUM(JSON_CONTAINS(analog_digital, '["analog"]')) AS analog_count,
            SUM(JSON_CONTAINS(analog_digital, '["digital"]')) AS digital_count
        FROM visitors
        WHERE JSON_LENGTH(analog_digital) > 0;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Error fetching data" });
        }

        const responseData = [
            { type: "analog", value: results[0].analog_count || 0 },
            { type: "digital", value: results[0].digital_count || 0 }
        ];

        res.json(responseData);
    });
});

router.get('/mapdata-or', (_req, res) => {
    let mapQuery = `SELECT stadtbezirk, COUNT(*) as visitor_count from \`${process.env.DB_TABLE}\` WHERE stadtbezirk != 'Nicht aus Dresden' GROUP BY stadtbezirk`;
    db.query(mapQuery, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.get('/agedata', (_req, res) => {
    let ageQuery = `
        SELECT
    CASE 
        WHEN age >= 70 THEN '70+'
        WHEN age >= 60 THEN '60-69'
        WHEN age >= 50 THEN '50-59'
        WHEN age >= 40 THEN '40-49'
        WHEN age >= 30 THEN '30-39'
        WHEN age >= 18 THEN '18-29'
        ELSE '0-17'
    END AS age_group,
    COUNT(*) AS count
FROM 
    visitors
WHERE 
    age IS NOT NULL  -- Exclude NULL values
GROUP BY 
    age_group
ORDER BY 
    CASE 
        WHEN age_group = '0-17' THEN 1
        WHEN age_group = '18-29' THEN 2
        WHEN age_group = '30-39' THEN 3
        WHEN age_group = '40-49' THEN 4
        WHEN age_group = '50-59' THEN 5
        WHEN age_group = '60-69' THEN 6
        WHEN age_group = '70+' THEN 7
    END;

    `;

    db.query(ageQuery, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});



router.get('/mapdata', (_req, res) => {
    let mapQuery = `SELECT stadtbezirk, COUNT(*) as visitor_count from visitors WHERE stadtbezirk != 'Nicht aus Dresden' GROUP BY stadtbezirk`;
    db.query(mapQuery, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.get('/placedata', (_req, res) => {
    let placeQuery = "SELECT lieblingsort, COUNT(*) AS value FROM visitors WHERE lieblingsort IS NOT NULL GROUP BY lieblingsort ORDER BY value DESC LIMIT 45";
    db.query(placeQuery, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.get('/icecreamdata', (_req, res) => {
    let icecreamQuery = "SELECT lieblingseis, COUNT(*) AS value FROM visitors WHERE lieblingseis IS NOT NULL GROUP BY lieblingseis ORDER BY value DESC";
    db.query(icecreamQuery, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.get('/transportdata', (_req, res) => {
    let transportQuery = "SELECT verkehrsmittel, COUNT(*) AS value FROM visitors WHERE verkehrsmittel IS NOT NULL GROUP BY verkehrsmittel ORDER BY value";
    db.query(transportQuery, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.get('/petdata', (_req, res) => {
    let petQuery = `
    SELECT pet, COUNT(*) as value
FROM (
    SELECT 
        JSON_UNQUOTE(JSON_EXTRACT(pet, CONCAT('$[', numbers.n, ']'))) as pet
    FROM 
        visitors
    JOIN (
        SELECT 0 as n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
        UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    ) numbers
    ON JSON_LENGTH(pet) > numbers.n
    WHERE JSON_UNQUOTE(JSON_EXTRACT(pet, CONCAT('$[', numbers.n, ']'))) IS NOT NULL
) as pet_list
GROUP BY pet;
  `;

    db.query(petQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json(results);
    });
});




module.exports = router;