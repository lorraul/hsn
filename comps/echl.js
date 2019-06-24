var request = require('request');
var common = require('../common');

module.exports = {
    getTSV: async function () {
        var url = 'https://www.echl.com/api/s3?q=schedule-3a63eb2cd27d9ea4634084e4.json';

        var gameUrls = await new Promise(function (resolve, reject) {
            request(url, function (error, response, body) {
                if (error) {
                    console.log('error');
                    reject(error);
                } else {
                    var initResponse = JSON.parse(body);
                    var finishedGames = initResponse.data.filter(function (game) {
                        return new Date(game.startDate) < new Date();
                    });

                    var ids = finishedGames.map(function (game) {
                        return game._entityId;
                    });
                    var gameUrls = [];
                    for (var i = 0; i < ids.length; i++) {
                        gameUrls.push('https://www.echl.com/api/s3/live?q=match-' + ids[i] + '-scoreboard.json');
                    }
                    resolve(gameUrls);
                }
            });
        });

        var gameObjects = await common.asyncGetJSONs(gameUrls);

        var rowObjects = [];
        gameObjects.forEach(function (game, index) {
            if (!game) {
                return;
            }
            rowObjects.push({
                competition: 'echl',
                season: '1819',
                stage: 'PO',
                date: common.getFormattedDate(game.data.startDate),
                team1: game.data.teams.home.name,
                team2: game.data.teams.away.name,
                score1: game.data.results.scores.home,
                score2: game.data.results.scores.away,
                attendance: game.data.audience,
                location: game.data.venue.name,
                source: 'https://www.echl.com/en/matches/' + game.data._entityId + '/'
            });
            console.log('row ' + index + ' / ' + gameObjects.length + ' done');
        });
        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};
