// data/devotions.js
// db.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const dbPath = './data/newdatabase.db';
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});


// Function to get all data from devotions table
function getAllData(db, callback) {
    console.log('Inside getAllData function');
    const sql = 'SELECT * FROM devotions';

    db.all(sql, (err, rows) => {
        if (err) {
            console.error('Error getting data:', err.message);
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
}
/*
const devotions = [
    {  devotion_id: 1, devotion_name: "rosary", devotion_type: "Mary", devotion_description: "Meditative Prayer usually prayed with beads. Details about plenary indulgence", devotion_instruction: "5 decades of 10 Hail Marys" }
];*/

//module.exports = devotions;

module.exports = { getAllData };

// Export functions
//module.exports = { insertData }; 
 
