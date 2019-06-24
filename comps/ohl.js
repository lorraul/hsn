var request = require('request');
var common = require('../common');

module.exports = {
    getTSV: async function () {

        //RS
        //http://lscluster.hockeytech.com/feed/?feed=modulekit&view=schedule&key=2976319eb44abe94&fmt=json&client_code=ohl&lang=en&season_id=63&team_id=&league_code=&fmt=json

        var initUrl = 'http://lscluster.hockeytech.com/feed/?feed=modulekit&view=schedule&key=2976319eb44abe94&fmt=json&client_code=ohl&lang=en&season_id=66&team_id=&league_code=&fmt=json';

        var response = await common.asyncGetJSONs([initUrl]);

        var rowObjects = [];
        response[0].SiteKit.Schedule.forEach(function (gameObject) {
            var url = 'http://ontariohockeyleague.com/gamecentre/' + gameObject.game_id + '/play_by_play';
            rowObjects.push({
                competition: 'ohl',
                season: '1819',
                stage: 'R16',
                date: common.getFormattedDate(gameObject.date_played),
                team1: gameObject.home_team_name.replace(',', ''),
                team2: gameObject.visiting_team_name.replace(',', ''),
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
