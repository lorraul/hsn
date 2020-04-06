var request = require('request');
var common = require('../common');

module.exports = {
    getTSV: async function () {
        //1819
        //RS: season_id=67
        //PO: season_id=70

        var url = 'https://lscluster.hockeytech.com/feed/index.php?feed=modulekit&view=schedule&team=-1&season_id=71&month=-1&location=homeaway&key=e828f89b243dc43f&client_code=ushl&site_id=0&league_id=1&division_id=-1&lang=en&fmt=json';

        var response = await common.asyncGetJSONs([url]);

        var games = response[0].SiteKit.Schedule;

        var rowObjects = [];
        games.forEach(function (gameObject, i) {
            if (gameObject.final == 0) {
                return;
            }
            var gameUrl = 'https://lscluster.hockeytech.com/game_reports/official-game-report.php?client_code=ushl&game_id=' + gameObject.id + '&lang_id=1';
            rowObjects.push({
                competition: 'ushl',
                season: '1920',
                stage: 'RS',
                date: games[i].date_played,
                team1: games[i].home_team_name.replace(',', ''),
                team2: games[i].visiting_team_name.replace(',', ''),
                score1: games[i].home_goal_count,
                score2: games[i].visiting_goal_count,
                scoretype: common.getScoretypeNA(gameObject.game_status),
                attendance: games[i].attendance,
                location: getLocation(games[i].venue_location),
                source: gameUrl
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
