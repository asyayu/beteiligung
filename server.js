require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const db = require('./config/db');
const apiRoutes = require('./routes/api');
const postRoutes = require('./routes/new');

const { cityDistricts, channels, participation, futureReach, formats } = require('./config/data');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use("/api", apiRoutes);
app.use("/new", postRoutes);

app.get('/dashboard', (req, res) => {
  db.query('SELECT * FROM visitors', (err, results) => {
    if (err) throw err;
    res.render('visitors', { visitors: results, cityDistricts, channels, participation, futureReach, formats });
  });
});

app.listen(5435, () => {
  console.log('Server running on port 5435');
});

