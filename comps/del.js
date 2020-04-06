var request = require('request');
var common = require('../common');

module.exports = {
    getTSV: async function () {
        var gameUrls = [];
        var shotUrls = [];
        //1428-2100
        for (var i = 1428; i < 2100; i++) {
            gameUrls.push('https://www.del.org/live-ticker/matches/' + i + '/game-header.json');
            shotUrls.push('https://www.del.org/live-ticker/visualization/shots/' + i + '.json');
        }

        var gameObjects = await common.asyncGetJSONs(gameUrls);
        var gameObjects2 = await common.asyncGetJSONs(shotUrls);

        var rowObjects = [];
        gameObjects.forEach(function (gameObject, index) {
            if (!gameObject || !gameObjects2[index]) {
                return;
            }
            rowObjects.push({
                competition: 'del',
                season: '1920',
                stage: 'RS',
                date: gameObjects2[index].match.date,
                team1: getTeamName(gameObject.teamInfo.home.name),
                team2: getTeamName(gameObject.teamInfo.visitor.name),
                score1: gameObject.results.score.final.score_home,
                score2: gameObject.results.score.final.score_guest,
                scoretype: getScoreType(gameObject.results),
                attendance: gameObject.numberOfViewers,
                location: gameObject.stadium
            });
            console.log('row ' + index + ' / ' + gameObjects.length + ' done');
        });
        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getTeamName(name) {
    switch (name) {
        case 'EHC Red Bull München':
            name = 'EHC München';
            break;
        case 'Pinguins Bremerhaven':
            name = 'Fischtown Pinguins';
            break;
        case 'Schwenninger Wild Wings':
            name = 'Schwenninger WW';
            break;
        case 'Thomas Sabo Ice Tigers':
            name = 'Nürnberg Ice Tigers';
            break;
    }
    return name;
}

function getScoreType(results) {
    if (results.shooting) {
        return 'SO';
    }
    if (results.extra_time) {
        return 'OT';
    }
    if (!results.shooting && !results.extra_time) {
        return 'RT';
    }
    return ''; //this should not happen
}
