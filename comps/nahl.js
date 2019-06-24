var request = require('request');
var common = require('../common');

module.exports = {
    getTSV: async function () {
        //RS
        //season_id=168

        //PO
        //season_id=188

        var seasonId = '166';
        var url = 'https://lscluster.hockeytech.com/feed/index.php?feed=modulekit&view=schedule&season_id=' + seasonId + '&pageName=schedule&key=bb92e4a0d0be791d&client_code=nahl&site_id=0&league_id=1&league_code=nahl&lang=en&fmt=json';

        var response = await common.asyncGetJSONs([url]);

        var rowObjects = [];
        var games = response[0].SiteKit.Schedule;
        games.forEach(function (gameObject, i) {
            rowObjects.push({
                competition: 'nahl',
                season: '1718',
                stage: 'PO',
                date: games[i].date_played,
                team1: games[i].home_team_name.replace(',', ''),
                team2: games[i].visiting_team_name.replace(',', ''),
                score1: games[i].home_goal_count,
                score2: games[i].visiting_goal_count,
                attendance: games[i].attendance,
                //location: getLocation(games[i].venue_location),
                location: games[i].venue_name + ', ' + games[i].venue_location,
                source: 'https://lscluster.hockeytech.com/game_reports/official-game-report.php?client_code=nahl&game_id=' + games[i].game_id + '&lang_id=1'
            });
        });
        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getLocation(location) {
    location = location.split(',');
    return location[location.length - 2];
}
