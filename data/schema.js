// db/schema.js

// Import SQLite library
const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database (or create if not exists)
const db = new sqlite3.Database('newdatabase.db');

// Create devotions table
db.run('BEGIN TRANSACTION;', function(err) {
    db.run(`
        CREATE TABLE IF NOT EXISTS devotions (
            devotion_name TEXT PRIMARY KEY,
            devotion_type TEXT,
            devotion_description TEXT NOT NULL
        );
        CREATE TABLE comments (
            comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            devotion_name TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (devotion_name) REFERENCES devotions (devotion_name)
        );



        CREATE TABLE IF NOT EXISTS courses (
            course_name TEXT PRIMARY KEY,
            course_subject TEXT NOT NULL,
            course_description TEXT,
            course_professor TEXT
        );
        CREATE TABLE courseComments (
            comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_name TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (course_name) REFERENCES courses (course_name)
        );
        CREATE TABLE IF NOT EXISTS courseLikes (
            like_id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_name TEXT NOT NULL,
            FOREIGN KEY (course_name) REFERENCES courses (course_name)
        );

        CREATE TABLE IF NOT EXISTS quotes (
            quote_id INTEGER PRIMARY KEY AUTOINCREMENT,
            quote_content TEXT NOT NULL,
            quote_author TEXT NOT NULL,
            quote_tag TEXT
        );
        CREATE TABLE IF NOT EXISTS quoteLikes (
            like_id INTEGER PRIMARY KEY AUTOINCREMENT,
            quote_id TEXT NOT NULL,
            FOREIGN KEY (quote_id) REFERENCES quotes (quote_id)
        );

    `, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Tables created successfully.');

        }
    });
});


// Debuggin
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='devotions';", (err, rows) => {
    if (err) {
        console.error("Error checking for devotions table:", err);
    } else {
        if (rows.length > 0) {
            console.log("Devotions table exists.");
        } else {
            console.log("Devotions table does not exist.");
        }
    }
});
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='courses';", (err, rows) => {
    if (err) {
        console.error("Error checking for courses table:", err);
    } else {
        if (rows.length > 0) {
            console.log("Courses table exists.");
        } else {
            console.log("Courses table does not exist.");
        }
    }
});

// data/devotions.js
// db.js

const path = require('path');

// ********************************************** DEVOTION FUNCTIONS **********************************************
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

// Function to get all data from comments table
function getAllDevComments(db, callback) {
    console.log('Inside getAllDevComments function');
    const sql = 'SELECT * FROM comments';

    db.all(sql, (err, rows) => {
        if (err) {
            console.error('Error getting data:', err.message);
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
}


//for comments
function getCommentsByDevotionName(db, devotionName, callback) {
    const sql = 'SELECT * FROM comments WHERE devotion_name = ?';
    db.all(sql, [devotionName], (err, rows) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
}

// ********************************************** COURSES FUNCTIONS **********************************************

// Function to get all data from courses table
function getAllCourses(db, callback) {
    console.log('Inside getAllData function');
    const sql = 'SELECT * FROM courses';

    db.all(sql, (err, rows) => {
        if (err) {
            console.error('Error getting data:', err.message);
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
}

// ********************************************** QUOTES FUNCTIONS **********************************************

// Function to get all data from courses table
function getAllQuotes(db, callback) {
    console.log('Inside getAllData function');
    const sql = 'SELECT * FROM quotes';

    db.all(sql, (err, rows) => {
        if (err) {
            console.error('Error getting data:', err.message);
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
}



module.exports = { getAllData, getAllDevComments, getCommentsByDevotionName, getAllCourses, getAllQuotes };

//getting devotions with comments



// Close the database connection
db.close();