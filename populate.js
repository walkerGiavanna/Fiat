// populate.js
// run node populate.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const devotionsData = require('./data/devotionsdb'); // Import your data source

const dbPath = path.resolve(__dirname, 'newdatabase.db');
const db = new sqlite3.Database(dbPath);

// Ensure database is connected
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS devotions (
            devotion_name TEXT PRIMARY KEY,
            devotion_type TEXT,
            devotion_description TEXT
        )
    `);


    // Insert data into devotions table
    const insertStmt = db.prepare('INSERT INTO devotions (devotion_name, devotion_type, devotion_description) VALUES (?, ?, ?)');
    let devotionsData = [ {  devotion_name: "Scriptual Rosary", devotion_type: "Marian", devotion_description: "Meditative Prayer usually prayed with beads. Details about plenary indulgence" } ];
    devotionsData.forEach(devotion => {
        insertStmt.run("rosary", "Mary; Mediation", "10 Hail Mary after 1 Our Father x5");
    });
    insertStmt.finalize(); // Finalize the statement to ensure all data is inserted

    console.log('Data inserted successfully');

    // Close database connection
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Database connection closed');
    });
});
