var sqlite3 = require('sqlite3').verbose();

const DBSOURCE = "db.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT, 
            email TEXT UNIQUE, 
            password TEXT,
            token TEXT,
            CONSTRAINT email_unique UNIQUE (email)
        )`, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Table "usuarios" a sido creada o ya existe');
                db.run(`CREATE TABLE IF NOT EXISTS anotaciones (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    anotacion TEXT,
                    FOREIGN KEY(user_id) REFERENCES usuarios(id)
                )`, (err) => {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log('Table "anotaciones" a sido creada o ya existe');
                    }
                });
            }
        });
    }
});

module.exports = db;