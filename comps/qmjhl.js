var request = require('request');
var common = require('../common');

module.exports = {
    getTSV: async function () {
        //RS
        //http://lscluster.hockeytech.com/feed/?feed=modulekit&view=schedule&key=f322673b6bcae299&fmt=json&client_code=lhjmq&lang=en&season_id=190&team_id=&league_code=&fmt=json

        var initUrl = 'http://lscluster.hockeytech.com/feed/?feed=modulekit&view=schedule&key=f322673b6bcae299&fmt=json&client_code=lhjmq&lang=en&season_id=191&team_id=&league_code=&fmt=json';

        var response = await common.asyncGetJSONs([initUrl]);

        var rowObjects = [];
        response[0].SiteKit.Schedule.forEach(function (gameObject) {
            var url = 'http://theqmjhl.ca/gamecentre/' + gameObject.game_id + '/boxscore';
            rowObjects.push({
                competition: 'qmjhl',
                season: '1819',
                stage: 'RS',
                date: common.getFormattedDate(gameObject.date_played),
                team1: getTeamName(gameObject.home_team_name.replace(',', '')),
                team2: getTeamName(gameObject.visiting_team_name.replace(',', '')),
                score1: gameObject.home_goal_count,
                score2: gameObject.visiting_goal_count,
                attendance: gameObject.attendance,
                location: gameObject.venue_name,
                source: url
            });
        });
        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getTeamName(name) {
    switch (name) {
        case 'Sherbrooke Phœnix':
            name = 'Sherbrooke Phoenix';
            break;
    }
    return name;
}
