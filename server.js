const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const db = require('./database');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/league-data', async (req, res) => {
    try {
        const leagueId = 2166343;
        console.log(`Attempting to fetch data for league ID: ${leagueId}`);

        const response = await fetch(`https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('League data received:', {
            leagueName: data.league.name,
            leagueId: data.league.id,
            numberOfTeams: data.standings.results.length
        });

        // Get current gameweek
        const bootstrapResponse = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
        const bootstrapData = await bootstrapResponse.json();
        const currentGameweek = bootstrapData.events.find(event => event.is_current).id;

        console.log('Current Gameweek:', currentGameweek);

        // Clear existing data
        await db.run('DELETE FROM league_standings');
        await db.run('DELETE FROM gameweek_points');

        // Store data in the database
        const standings = data.standings.results;
        for (const entry of standings) {
            // Update league standings
            await db.run('INSERT INTO league_standings (player_id, player_name, total_points) VALUES (?, ?, ?)',
                [entry.entry, entry.player_name, entry.total]);

            // Fetch player's gameweek data
            const playerHistoryResponse = await fetch(`https://fantasy.premierleague.com/api/entry/${entry.entry}/history/`);
            const playerHistory = await playerHistoryResponse.json();

            if (playerHistory.current && playerHistory.current.length > 0) {
                for (const gw of playerHistory.current) {
                    // Store gameweek points
                    await db.run('INSERT INTO gameweek_points (player_id, gameweek, points, total_points) VALUES (?, ?, ?, ?)',
                        [entry.entry, gw.event, gw.points - gw.event_transfers_cost, gw.total_points]);
                }
            }
        }

        // Fetch all gameweek data from the database
        const rows = await db.all(`
            SELECT ls.player_id, ls.player_name, gp.gameweek, gp.points, gp.total_points,
                   ROW_NUMBER() OVER (PARTITION BY gp.gameweek ORDER BY gp.total_points DESC) as rank
            FROM league_standings ls
            JOIN gameweek_points gp ON ls.player_id = gp.player_id
            ORDER BY gp.gameweek, gp.total_points DESC
        `);

        console.log('Number of rows sent to client:', rows.length);
        res.json({
            currentGameweek,
            data: rows,
            leagueInfo: {
                name: data.league.name,
                id: data.league.id
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching league data', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});