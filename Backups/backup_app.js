// Import necessary modules
const express = require('express');
const methodOverride = require('method-override');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { getAllData } = require('./data/schema');
const { getCommentsByDevotionName } = require('./data/schema');

const { getAllCourses } = require('./data/schema');
const { getCommentsByCourseName } = require('./data/schema');

//const { insertData } = require('./data/devotionsdb');


// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Setup SQLite database connection
const dbPath = path.join(__dirname, 'data', 'newdatabase.db'); // Adjust path as needed
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {ß
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});


// Database stuff 7/5/24
console.log(typeof db); // Should output 'object'
console.log(db.constructor.name);

//Initialize db structure
require('./data/schema.js');
const database = require('./data/index');
/*
old --> const { createTables } = require('./data/schema');

// Initialize database schema
createTables();
*/



// Middleware to serve static files (Bootstrap CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Define routes 7/7/24
//sign in
app.get('/', (req, res) => {
    res.render('signin');
});

app.post('/signin', (req, res) => {
    const { code } = req.body;

    // Validate username and password (dummy example)
    if (code === '2024') {
        res.redirect('/index');
    } else {
        res.send('Invalid code');
    }
});
app.get('/index', (req, res) => {
    res.render('index'); // Render views/index.ejs with data
});


// ****************************************************** DEVOTIONS ROUTES ******************************************************
// Route for /devotions
// Route for /devotions (GET and POST)
app.route('/devotions')
    .get((req, res) => {
        // Fetch data from database
        getAllData(db, (err, data) => {
            if (err) {
                console.error('Error fetching data:', err);
                res.status(500).send('Error fetching data');
            } else {
                // Render devotions page with fetched data
                res.render('devotions', { devotions: data });
            }
        });
    })
    .post((req, res) => {
        const { devotion_name, devotion_description } = req.body;
        const sql = `INSERT INTO devotions (devotion_name, devotion_description) VALUES (?, ?)`;
        const values = [devotion_name, devotion_description];
        
        // Insert data into database
        db.run(sql, values, function(err) {
            if (err) {
                console.error('Error inserting data:', err.message);
                res.status(500).send('Error inserting data into database.');
            } else {
                console.log(`A new row has been inserted with rowid ${this.lastID}`);
                res.redirect('/devotions'); // Redirect to /devotions page after insertion
            }
        });
    });

// Override with POST having ?_method=PUT or ?_method=DELETE
app.use(methodOverride('_method'));

// Route for handling form submission and rendering update form -- not used !!!!!!!!!!!!!!!!!!!!!!!!!!!
app.post('/update-form', (req, res) => {
    const { devotion_name } = req.body;

    // Fetch data for the selected ID
    db.get('SELECT * FROM devotions WHERE devotion_name = ?', [devotion_name], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        }
        res.render('devotions.ejs', { data: row });
    });
});
// Route for actual update
app.post('/devotions/update', (req, res) => {
    //const devotionName = req.params.devotion_name;
    const { devotion_description, devotion_type, devotion_name } = req.body;

    const sql = `UPDATE devotions 
                 SET devotion_description = ?, devotion_type = ?
                 WHERE devotion_name = ?`;
    db.run(sql, [ devotion_description, devotion_type, devotion_name], function(err) {
        if (err) {
            console.error('Error updating devotion:', err.message);
            res.status(500).send('Error updating devotion.');
        } else {
            console.log(`Devotion ${devotion_name} updated successfully.`);
            //res.status(200).send(`Devotion ${devotionName} updated successfully.`);
            res.redirect('/devotions');
        }
    });
});


// Route for deleting a devotion (POST or DELETE)
app.post('/devotions/:id/delete', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM devotions WHERE id = ?`;
    
    // Delete data from database
    db.run(sql, id, function(err) {
        if (err) {
            console.error('Error deleting data:', err.message);
            res.status(500).send('Error deleting data from database.');
        } else {
            console.log(`Devotion ${id} deleted successfully`);
            res.redirect('/devotions'); // Redirect to /devotions page after deletion
        }
    });
});

// Route for searching devotions
app.get('/devotions/search', (req, res) => {
    const { devotion_name, devotion_type } = req.query;

    // Initialize SQL query
    let sql = `SELECT * FROM devotions WHERE 1`;

    // Array to hold parameters for SQLite query
    let params = [];

    // Conditionally add search criteria based on parameters
    if (devotion_name) {
        sql += ` AND devotion_name LIKE ?`;
        params.push(`%${devotion_name}%`);
    }

    if (devotion_type) {
        sql += ` AND devotion_type LIKE ?`;
        params.push(`%${devotion_type}%`);
    }

    // Execute the SELECT statement
    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Error executing query:', err.message);
            res.status(500).send('Error searching database.');
        } else {
            res.json(rows); // Send JSON response with search results
        }
    });
});

// comments route

app.get('/devotions/:devotionName/comments', (req, res) => {
    const devotionName = req.params.devotionName;

    // Fetch comments for the specific devotion
    getCommentsByDevotionName(db, devotionName, (err, data) => {
        if (err) {
            console.error('Error fetching comments:', err);
            res.status(500).send('Error fetching comments');
        } else {
            // Render comments page with fetched data and devotion name
            res.render('comments', { comments: data, devotionName: devotionName });
        }
    });
});


// Route to add a comment
app.post('/add-comment', (req, res) => {
    const { devotion_name, content } = req.body;

    if (!devotion_name || !content) {
        return res.status(400).send('Bad Request: Missing required fields');
    }

    const sql = 'INSERT INTO comments (devotion_name, content) VALUES (?, ?)';
    db.run(sql, [devotion_name, content], function(err) {
        if (err) {
            console.error('Error inserting comment:', err.message);
            return res.status(500).send('Internal Server Error');
        }

        // Redirect to the devotion page after adding the comment
        res.redirect(`/devotions/${devotion_name}/comments`);
    });
});


// Route to delete a comment
app.delete('/delete-comment/:commentId', (req, res) => {
    const commentId = req.params.commentId;

    const sql = 'DELETE FROM comments WHERE comment_id = ?';
    db.run(sql, [commentId], function(err) {
        if (err) {
            console.error('Error deleting comment:', err.message);
            return res.status(500).send('Internal Server Error');
        }

        // Redirect or send a response after successful deletion
        res.redirect(`/devotions/${devotion_name}/comments`);
    });
});

// ****************************************************** COURSES ROUTES ********************************************************
app.route('/courses')
    .get((req, res) => {
        // Fetch data from database
        getAllCourses(db, (err, data) => {
            if (err) {
                console.error('Error fetching data:', err);
                res.status(500).send('Error fetching data');
            } else {
                // Render devotions page with fetched data
                res.render('courses', { courses: data });
            }
        });
    })
    .post((req, res) => {
        const { course_name, course_subject } = req.body;
        const sql = `INSERT INTO devotions (course_name, course_subject) VALUES (?, ?)`;
        const values = [course_name, course_subject];
        
        // Insert data into database
        db.run(sql, values, function(err) {
            if (err) {
                console.error('Error inserting data:', err.message);
                res.status(500).send('Error inserting data into database.');
            } else {
                console.log(`A new row has been inserted with rowid ${this.lastID}`);
                res.redirect('/courses'); // Redirect to /devotions page after insertion
            }
        });
    });

// Override with POST having ?_method=PUT or ?_method=DELETE
app.use(methodOverride('_method'));

// Route for handling form submission and rendering update form -- not used !!!!!!!!!!!!!!!!!!!!!!!!!!!
app.post('/update-form', (req, res) => {
    const { devotion_name } = req.body;

    // Fetch data for the selected ID
    db.get('SELECT * FROM devotions WHERE devotion_name = ?', [devotion_name], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        }
        res.render('devotions.ejs', { data: row });
    });
});
// Route for actual update
app.post('/devotions/update', (req, res) => {
    //const devotionName = req.params.devotion_name;
    const { devotion_description, devotion_type, devotion_name } = req.body;

    const sql = `UPDATE devotions 
                 SET devotion_description = ?, devotion_type = ?
                 WHERE devotion_name = ?`;
    db.run(sql, [ devotion_description, devotion_type, devotion_name], function(err) {
        if (err) {
            console.error('Error updating devotion:', err.message);
            res.status(500).send('Error updating devotion.');
        } else {
            console.log(`Devotion ${devotion_name} updated successfully.`);
            //res.status(200).send(`Devotion ${devotionName} updated successfully.`);
            res.redirect('/devotions');
        }
    });
});


// Route for deleting a devotion (POST or DELETE)
app.post('/devotions/:id/delete', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM devotions WHERE id = ?`;
    
    // Delete data from database
    db.run(sql, id, function(err) {
        if (err) {
            console.error('Error deleting data:', err.message);
            res.status(500).send('Error deleting data from database.');
        } else {
            console.log(`Devotion ${id} deleted successfully`);
            res.redirect('/devotions'); // Redirect to /devotions page after deletion
        }
    });
});

// Route for searching devotions
app.get('/devotions/search', (req, res) => {
    const { devotion_name, devotion_type } = req.query;

    // Initialize SQL query
    let sql = `SELECT * FROM devotions WHERE 1`;

    // Array to hold parameters for SQLite query
    let params = [];

    // Conditionally add search criteria based on parameters
    if (devotion_name) {
        sql += ` AND devotion_name LIKE ?`;
        params.push(`%${devotion_name}%`);
    }

    if (devotion_type) {
        sql += ` AND devotion_type LIKE ?`;
        params.push(`%${devotion_type}%`);
    }

    // Execute the SELECT statement
    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Error executing query:', err.message);
            res.status(500).send('Error searching database.');
        } else {
            res.json(rows); // Send JSON response with search results
        }
    });
});

// comments route

app.get('/devotions/:devotionName/comments', (req, res) => {
    const devotionName = req.params.devotionName;

    // Fetch comments for the specific devotion
    getCommentsByDevotionName(db, devotionName, (err, data) => {
        if (err) {
            console.error('Error fetching comments:', err);
            res.status(500).send('Error fetching comments');
        } else {
            // Render comments page with fetched data and devotion name
            res.render('comments', { comments: data, devotionName: devotionName });
        }
    });
});


// Route to add a comment
app.post('/add-comment', (req, res) => {
    const { devotion_name, content } = req.body;

    if (!devotion_name || !content) {
        return res.status(400).send('Bad Request: Missing required fields');
    }

    const sql = 'INSERT INTO comments (devotion_name, content) VALUES (?, ?)';
    db.run(sql, [devotion_name, content], function(err) {
        if (err) {
            console.error('Error inserting comment:', err.message);
            return res.status(500).send('Internal Server Error');
        }

        // Redirect to the devotion page after adding the comment
        res.redirect(`/devotions/${devotion_name}/comments`);
    });
});


// Route to delete a comment
app.delete('/delete-comment/:commentId', (req, res) => {
    const commentId = req.params.commentId;

    const sql = 'DELETE FROM comments WHERE comment_id = ?';
    db.run(sql, [commentId], function(err) {
        if (err) {
            console.error('Error deleting comment:', err.message);
            return res.status(500).send('Internal Server Error');
        }

        // Redirect or send a response after successful deletion
        res.redirect(`/devotions/${devotion_name}/comments`);
    });
});


// ****************************************************** QUOTES ROUTES *********************************************************
// ****************************************************** BOOKS ROUTES **********************************************************
// ****************************************************** MOVIES ROUTES *********************************************************
// ****************************************************** ORGANIZATIONS ROUTES **************************************************





// Home route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
