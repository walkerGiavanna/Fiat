// Import necessary modules
const express = require('express');
const methodOverride = require('method-override');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { getAllData } = require('./data/schema');
const { getCommentsByDevotionName } = require('./data/schema');

const { getAllCourses } = require('./data/schema');
const { getCommentsByCourseName } = require('./data/schema');

const { getAllQuotes } = require('./data/schema');

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
                console.log(data); 
                res.render('devotions', { devotions: data });
            }
        });
    })
    .post((req, res) => {
        const { devotion_name, devotion_description, devotion_type } = req.body;
        const sql = `INSERT INTO devotions (devotion_name, devotion_description, devotion_type) VALUES (?, ?, ?)`;
        const values = [devotion_name, devotion_description, devotion_type];
        
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


// Route for deleting devotion
app.post('/devotions/delete', (req, res) => {
    const { devotion_name } = req.body; // Extract devotion_name from request body
    const sql = `DELETE FROM devotions WHERE devotion_name = ?`;
    
    // Delete data from the database
    db.run(sql, devotion_name, function(err) {
        if (err) {
            console.error('Error deleting data:', err.message);
            res.status(500).send('Error deleting data from database.');
        } else {
            console.log(`Devotion ${devotion_name} deleted successfully`);
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
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }

        res.json({ success: true });
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
        const { course_name, course_subject, course_professor, course_description } = req.body;
        const sql = `INSERT INTO courses (course_name, course_subject, course_professor, course_description) VALUES (?, ?, ?, ?)`;
        const values = [course_name, course_subject, course_professor, course_description];
        
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
    const { course_name } = req.body;

    // Fetch data for the selected ID
    db.get('SELECT * FROM courses WHERE course_name = ?', [course_name], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        }
        res.render('courses.ejs', { data: row });
    });
});
// Route for actual update
app.post('/courses/update', (req, res) => {
    const { course_description, course_subject, course_professor, course_name } = req.body;

    const sql = `UPDATE courses 
                 SET course_description = ?, course_subject = ?, course_professor = ?
                 WHERE course_name = ?`;
    db.run(sql, [ course_description, course_subject, course_professor, course_name], function(err) {
        if (err) {
            console.error('Error updating course:', err.message);
            res.status(500).send('Error updating course.');
        } else {
            console.log(`Course ${course_name} updated successfully.`);
            res.redirect('/courses');
        }
    });
});


// Route for deleting course
app.post('/courses/delete', (req, res) => {
    const { course_name } = req.body;
    const sql = `DELETE FROM courses WHERE course_name = ?`;
    
    // Delete data from the database
    db.run(sql, course_name, function(err) {
        if (err) {
            console.error('Error deleting data:', err.message);
            res.status(500).send('Error deleting data from database.');
        } else {
            console.log(`Course ${course_name} deleted successfully`);
            res.redirect('/courses'); // Redirect to /courses page after deletion
        }
    });
});

// Route for searching devotions
app.get('/courses/search', (req, res) => {
    const { course_name, course_subject, course_professor } = req.query;

    // Initialize SQL query
    let sql = `SELECT * FROM courses WHERE 1`;

    // Array to hold parameters for SQLite query
    let params = [];

    // Conditionally add search criteria based on parameters
    if (course_name) {
        sql += ` AND course_name LIKE ?`;
        params.push(`%${course_name}%`);
    }

    if (course_subject) {
        sql += ` AND course_subject LIKE ?`;
        params.push(`%${course_subject}%`);
    }

    if (course_professor) {
        sql += ` AND course_professor LIKE ?`;
        params.push(`%${course_professor}%`);
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

// ****************************************************** QUOTES ROUTES *********************************************************
// Route for /quotes
// Route for /quotes (GET and POST)
app.route('/quotes')
    .get((req, res) => {
        // Fetch data from database
        getAllQuotes(db, (err, data) => {
            if (err) {
                console.error('Error fetching data:', err);
                res.status(500).send('Error fetching data');
            } else {
                // Render devotions page with fetched data
                console.log(data); 
                res.render('quotes', { quotes: data });
            }
        });
    })
    .post((req, res) => {
        const { quote_content, quote_author, quote_tag } = req.body;
        const sql = `INSERT INTO quotes (quote_content, quote_author, quote_tag) VALUES (?, ?, ?)`;
        const values = [quote_content, quote_author, quote_tag];
        
        // Insert data into database
        db.run(sql, values, function(err) {
            if (err) {
                console.error('Error inserting data:', err.message);
                res.status(500).send('Error inserting data into database.');
            } else {
                console.log(`A new row has been inserted with rowid ${this.lastID}`);
                res.redirect('/quotes'); // Redirect to /devotions page after insertion
            }
        });
    });

// Override with POST having ?_method=PUT or ?_method=DELETE
app.use(methodOverride('_method'));


// Route for deleting quote
app.post('/quotes/delete', (req, res) => {
    const { quote_id } = req.body; // Extract quote_id from request body
    const sql = `DELETE FROM quotes WHERE quote_id = ?`;
    
    // Delete data from the database
    db.run(sql, quote_id, function(err) {
        if (err) {
            console.error('Error deleting data:', err.message);
            res.status(500).send('Error deleting data from database.');
        } else {
            console.log(`Quote ${quote_id} deleted successfully`);
            res.redirect('/quotes');
        }
    });
});


// Route for searching quotes
app.get('/quotes/search', (req, res) => {
    const { quote_author, quote_tag } = req.query;
    console.log('Quote Tag:', quote_tag);
    console.log('Quote Author:', quote_author);

    // Initialize SQL query
    let sql = `SELECT * FROM quotes WHERE 1`;

    // Array to hold parameters for SQLite query
    let params = [];

    // Conditionally add search criteria based on parameters
    if (quote_author) {
        sql += ` AND quote_author LIKE ?`;
        params.push(`%${quote_author}%`);
    }

    if (quote_tag) {
        sql += ` AND quote_tag LIKE ?`;
        params.push(`%${quote_tag}%`);
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
