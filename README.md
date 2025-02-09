# FPL League Standings

A Fantasy Football League standings tracker that displays real-time league positions and historical data. The application fetches league data from an API, processes it by gameweek, and presents it in an interactive table format. Users can navigate through different gameweeks using a dropdown menu, with the table showing each player's rank, position changes (with visual indicators ▲▼), player names, total points, and gameweek points. The position changes are calculated by comparing current rankings with the previous gameweek, making it easy to track performance trends throughout the season. 

## Usage

1. Navigate to the application in your web browser
2. The current gameweek's standings will load automatically
3. Use the gameweek dropdown to view historical standings
4. Track position changes and points across different gameweeks

## API Endpoints

- `GET /api/league-data`: Fetches league data including current gameweek and standings

## Technical Stack

- Frontend: Vanilla JavaScript
- Backend: Node.js
- Data Storage: implementation details in database.js

## Acknowledgments

- Fantasy Premier League API
