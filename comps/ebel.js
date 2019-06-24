var request = require('request');
var common = require('../common');

module.exports = {
    getTSV: async function () {
        var initUrl;
        //PR
        initUrl = 'https://api.hockeydata.net/data/ebel/Schedule?apiKey=6950a09aac511c08ec04ae39d33d345d&lang=en&referer=www.erstebankliga.at&timestamp=1550571644437&widgetOptions=%7B%22semantic%22%3Atrue%2C%22noScorers%22%3Atrue%7D&divisionId=4590&_=1550571641732';
        //QR
        initUrl = 'https://api.hockeydata.net/data/ebel/Schedule?apiKey=6950a09aac511c08ec04ae39d33d345d&lang=en&referer=www.erstebankliga.at&timestamp=1550571485931&widgetOptions=%7B%22semantic%22%3Atrue%2C%22noScorers%22%3Atrue%7D&divisionId=4591&_=1550571390295';

        var initUrls = [];
        //PR
        //initUrls.push('https://api.hockeydata.net/data/ebel/Schedule?apiKey=6950a09aac511c08ec04ae39d33d345d&lang=en&referer=www.erstebankliga.at&timestamp=1550571644437&widgetOptions=%7B%22semantic%22%3Atrue%2C%22noScorers%22%3Atrue%7D&divisionId=4590&_=1550571641732');
        //QR
        //initUrls.push('https://api.hockeydata.net/data/ebel/Schedule?apiKey=6950a09aac511c08ec04ae39d33d345d&lang=en&referer=www.erstebankliga.at&timestamp=1550571485931&widgetOptions=%7B%22semantic%22%3Atrue%2C%22noScorers%22%3Atrue%7D&divisionId=4591&_=1550571390295');
        //PO
        initUrls.push('https://api.hockeydata.net/data/ebel/Schedule?apiKey=6950a09aac511c08ec04ae39d33d345d&lang=en&referer=www.erstebankliga.at&timestamp=1556780584941&widgetOptions=%7B%22semantic%22%3Atrue%2C%22noScorers%22%3Atrue%7D&divisionId=4947&_=1556780584370');

        var initResponses = await common.asyncGetJSONs(initUrls);

        var gameUrls = [];
        for (var i = 0; i < initResponses[0].data.rows.length; i++) {
            gameUrls.push('https://api.hockeydata.net/data/ebel/GetGameReport?apiKey=6950a09aac511c08ec04ae39d33d345d&lang=en&referer=www.erstebankliga.at&timestamp=1536155591294&gameId=' + initResponses[0].data.rows[i].id);
        }
        /*for (var i = 0; i < initResponses[1].data.rows.length; i++) {
            gameUrls.push('https://api.hockeydata.net/data/ebel/GetGameReport?apiKey=6950a09aac511c08ec04ae39d33d345d&lang=en&referer=www.erstebankliga.at&timestamp=1536155591294&gameId=' + initResponses[1].data.rows[i].id);
        }*/

        var gameObjects = await common.asyncGetJSONs(gameUrls);

        var rowObjects = [];
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
        });
        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};


function getTeamName(name) {
    switch (name) {
        case 'Fehervar AV 19':
            name = 'Fehérvár AV19';
            break;
        case 'KHL Medvescak Zagreb':
            name = 'Medveščak Zagreb';
            break;
        case 'EHC Liwest Black Wings Linz':
            name = 'Black Wings Linz';
            break;
        case 'EC Red Bull Salzburg':
            name = 'Red Bull Salzburg';
            break;
        case 'EC-KAC':
            name = 'Klagenfurter AC';
            break;
        case 'EC Panaceo VSV':
            name = 'EC VSV';
            break;
        case 'HC Orli Znojmo':
            name = 'Orli Znojmo';
            break;
        case 'HCB Südtirol Alperia':
            name = 'HC Bolzano';
            break;
        case 'Moser Medical Graz99ers':
            name = 'Graz 99ers';
            break;
        case "HC TWK Innsbruck 'Die Haie'":
            name = 'TWK Innsbruck';
            break;
        case "spusu Vienna Capitals":
            name = 'Vienna Capitals';
            break;
    }
    return name;
}
