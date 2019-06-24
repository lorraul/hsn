var request = require('request');
var common = require('../common');

module.exports = {
    getTSV: async function () {
        //RS
        //https://api.hockeydata.net/data/ebel/Schedule?apiKey=175fe3ea6bf375c7c4cba4f747c33d84&lang=en&referer=www.alps.hockey&timestamp=1537968141000&widgetOptions=%7B%22semantic%22%3Atrue%2C%22noScorers%22%3Atrue%7D&divisionId=3468&_=1537968089816
        //PO: 
        //https://api.hockeydata.net/data/ebel/Schedule?apiKey=175fe3ea6bf375c7c4cba4f747c33d84&lang=en&referer=www.alps.hockey&timestamp=1556002197107&divisionId=3465&widgetOptions=%7B%22semantic%22%3Atrue%2C%22noScorers%22%3Atrue%7D&_=1556002195082
        var initUrl = 'https://api.hockeydata.net/data/ebel/Schedule?apiKey=175fe3ea6bf375c7c4cba4f747c33d84&lang=en&referer=www.alps.hockey&timestamp=1556002197107&divisionId=3465&widgetOptions=%7B%22semantic%22%3Atrue%2C%22noScorers%22%3Atrue%7D&_=1556002195082';

        var initResponse = await common.asyncGetJSONs([initUrl]);

        var gameUrls = [];
        for (var i = 0; i < initResponse[0].data.rows.length; i++) {
            gameUrls.push('https://api.hockeydata.net/data/ebel/GetGameReport?apiKey=6950a09aac511c08ec04ae39d33d345d&lang=en&referer=www.erstebankliga.at&timestamp=1536155591294&gameId=' + initResponse[0].data.rows[i].id);
        }

        var gameObjects = await common.asyncGetJSONs(gameUrls);

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
        return tsv;
    }
};

function getTeamName(name) {
    switch (name) {
        case 'HDD SIJ Acroni Jesenice':
            name = 'Acroni Jesenice';
            break;
        case 'S.G. Cortina Hafro':
            name = 'SG Cortina';
            break;
        case 'Red Bull Hockey Juniors':
            name = 'Red Bull Salzburg 2';
            break;
        case 'Migross Supermercati Asiago Hockey':
            name = 'Asiago Hockey';
            break;
        case 'EC KAC II':
            name = 'Klagenfurter AC 2';
            break;
        case "EC 'Die Adler' Stadtwerke Kitzbühel":
            name = 'EC Kitzbühel';
            break;
        case 'EHC Alge Elastic Lustenau':
            name = 'EHC Lustenau';
            break;
        case 'Rittner Buam':
            name = 'Ritten Sport';
            break;
        case 'HK SZ Olimpija':
            name = 'Olimpija Ljubljana';
            break;
        case 'HC Gherdeina valgardena.it':
            name = 'HC Gherdëina';
            break;
        case 'Wipptal Broncos Weihenstephan':
            name = 'WSV Sterzing Broncos';
            break;
        case 'Wipptal Broncos Weihenstephan':
            name = 'WSV Sterzing Broncos';
            break;
    }
    return name;
}
