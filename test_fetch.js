const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function fetchLeagueData(leagueId) {
    try {
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

        console.log('First 5 teams:');
        data.standings.results.slice(0, 5).forEach(team => {
            console.log(`${team.rank}. ${team.entry_name} (${team.player_name}) - ${team.total} points`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

// Test with your league ID
fetchLeagueData(27728);

// Test with the league ID you're unexpectedly receiving
fetchLeagueData(5573);