const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./fpl_league.db', (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS league_standings (
                player_id INTEGER PRIMARY KEY,
                player_name TEXT,
                total_points INTEGER
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS gameweek_points (
                player_id INTEGER,
                gameweek INTEGER,
                points INTEGER,
                PRIMARY KEY (player_id, gameweek)
            )`);

            // Check if total_points column exists and add it if it doesn't
            db.all(`PRAGMA table_info(gameweek_points)`, (err, rows) => {
                if (err) {
                    console.error('Error checking table info:', err);
                } else {
                    console.log('Table info:', rows);
                    if (Array.isArray(rows)) {
                        const totalPointsColumn = rows.find(row => row.name === 'total_points');
                        if (!totalPointsColumn) {
                            db.run(`ALTER TABLE gameweek_points ADD COLUMN total_points INTEGER`, (alterErr) => {
                                if (alterErr) {
                                    console.error('Error adding total_points column:', alterErr);
                                } else {
                                    console.log('Added total_points column to gameweek_points table');
                                }
                            });
                        } else {
                            console.log('total_points column already exists');
                        }
                    } else {
                        console.error('Unexpected result from PRAGMA table_info:', rows);
                    }
                }
            });
        });
    }
});

module.exports = {
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) {
                    console.log('Error running sql ' + sql);
                    console.log(err);
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    },
    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    console.log('Error running sql: ' + sql);
                    console.log(err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
};