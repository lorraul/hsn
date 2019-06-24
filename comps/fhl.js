var request = require('request');
var common = require('../common');

module.exports = {
    getTSV: async function () {
        var initUrl = 'https://web.api.digitalshift.ca/partials/stats/schedule/table?order=datetime&all=true&division_id=2055&start_id=g-84883&offset=1&limit=300';

        var initResponse = await common.asyncGetJSONs([{
            url: initUrl,
            method: 'GET',
            headers: {
                Authorization: 'ticket="JnYnJc-0IdkfmoA7PeoaV1cBOZZRTF8RMyCno5UaXbSeFgrmS2Ge2Q8godyIYCqxK1mkV_j_fnjmAoJTsfdVPzyt"',
                Origin: 'https://www.federalhockey.com',
                Referer: 'https://web.api.digitalshift.ca/',
            }
        }]);

        var gameObjects = initResponse[0].schedule.length

        /*
         gameObjects.forEach(function (gameObject, index) {
            if (!gameObject) {
                return;
            }
            var gameData = gameObject.data.gameData;
            rowObjects.push({
                competition: 'ebel',
                season: '1819',
                stage: 'PO',
                date: gameData.scheduledDate.value,
                team1: getTeamName(gameData.homeTeamLongname),
                team2: getTeamName(gameData.awayTeamLongname),
                score1: gameData.homeTeamScore,
                score2: gameData.awayTeamScore,
                attendance: gameData.attendance,
                location: gameData.location.longname,
                source: 'https://www.erstebankliga.at/stats-ebel/spiel?gameId=' + gameData.id
            });
            console.log('row ' + index + ' / ' + gameObjects.length + ' done');
        });*/

        /*
        var rowObjects = [];
        gameObjects.forEach(function (gameObject, index) {
            if (!gameObject) {
                return;
            }
            var gameData = gameObject.data.gameData;
            rowObjects.push({
                competition: 'alpshl',
                season: '1819',
                stage: 'PO',
                date: gameData.scheduledDate.value,
                team1: getTeamName(gameData.homeTeamLongname),
                team2: getTeamName(gameData.awayTeamLongname),
                score1: gameData.homeTeamScore,
                score2: gameData.awayTeamScore,
                attendance: gameData.attendance,
                location: gameData.location.longname,
                source: 'https://alps.hockey/en/statistics/game/?gameId=' + gameData.id + '&divisionId=' + gameData.divisionId
            });
            console.log('row ' + index + ' / ' + gameObjects.length + ' done');
        });
        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;*/
    }
};

function getTeamName(name) {
    switch (name) {
        case 'HDD SIJ Acroni Jesenice':
            name = 'Acroni Jesenice';
            break;
    }
    return name;
}
