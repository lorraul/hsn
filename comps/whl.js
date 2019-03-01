var request = require('request');
var common = require('../common');

module.exports = {
    getTSV: async function () {
        var url = 'http://lscluster.hockeytech.com/feed/?feed=modulekit&view=schedule&key=41b145a848f4bd67&fmt=json&client_code=whl&lang=en&season_id=266&team_id=&league_code=&fmt=json';

        var response = await common.asyncGetJSONs([url]);

        var rowObjects = [];
        response[0].SiteKit.Schedule.forEach(function (gameObject) {
            rowObjects.push({
                competition: 'whl',
                season: '1819',
                stage: 'RS',
                date: gameObject.date_played,
                team1: gameObject.home_team_name.replace(',', ''),
                team2: gameObject.visiting_team_name.replace(',', ''),
                score1: gameObject.home_goal_count,
                score2: gameObject.visiting_goal_count,
                attendance: gameObject.attendance,
                location: getLocation(gameObject.venue_location),
                source: 'http://whl.ca/gamecentre/' + gameObject.game_id + '/boxscore'
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
