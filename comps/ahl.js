var request = require('request');
var common = require('../common');

module.exports = {
    getTSV: async function () {
        var url = 'https://lscluster.hockeytech.com/feed/index.php?feed=modulekit&view=schedule&team=-1&season_id=61&month=-1&location=homeaway&key=50c2cd9b5e18e390&client_code=ahl&site_id=1&league_id=4&division_id=-1&lang=en&fmt=json';

        var response = await common.asyncGetJSONs([url]);

        var rowObjects = [];
        response[0].SiteKit.Schedule.forEach(function (gameObject) {
            if (gameObject.final == 0) {
                return;
            }
            var gameUrl = 'https://lscluster.hockeytech.com/game_reports/official-game-report.php?client_code=ahl&game_id=' + gameObject.id + '&lang_id=1';
            rowObjects.push({
                competition: 'ahl',
                season: '1819',
                stage: 'RS',
                date: common.getFormattedDate(gameObject.date_time_played),
                team1: gameObject.home_team_name,
                team2: gameObject.visiting_team_name,
                score1: gameObject.home_goal_count,
                score2: gameObject.visiting_goal_count,
                attendance: gameObject.attendance,
                location: gameObject.venue_name + ', ' + gameObject.venue_location,
                source: gameUrl
            });
        });
        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};
