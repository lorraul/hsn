var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        var initUrls = ['https://www.championshockeyleague.com/api/s3?q=schedule-21ec9dad81abe2e0240460d0-8f7d5c9a161f121955e7a148.json']

        var initResponses = await common.asyncGetJSONs(initUrls, 'externalStatisticsCallback');

        var gameUrls = [];
        initResponses.forEach(function (response) {
            response.data.forEach(function (game) {
                if (game.status === 'finished') {
                    //gameUrls.push('https://www.championshockeyleague.com/en/' + game.link.url);
                    gameUrls.push('https://www.championshockeyleague.com/api/s3/live?q=live-event-' + game._entityId + '-scoreboard.json');
                }
            });
        });

        var gameObjects = await common.asyncGetJSONs(gameUrls);

        var rowObjects = [];
        gameObjects.forEach(function (game, index) {
            game = game.data;
            rowObjects.push({
                competition: 'chl',
                season: '1920',
                stage: 'GS',
                date: game.startDate.substr(0, 10),
                team1: getTeamName(game.teams.home.name),
                team2: getTeamName(game.teams.away.name),
                score1: game.results.scores.home,
                score2: game.results.scores.away,
                scoretype: getScoreType(game.state.shortName),
                attendance: game.audience,
                location: game.venue.name,
                source: 'https://www.championshockeyleague.com/en' + game.link.url
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
        case 'HPK Hämeenlinna':
            name = 'HPK';
            break;
        case 'Grenoble':
            name = 'Grenoble Bruleurs de Loups';
            break;
        case 'Frölunda Indians':
            name = 'Frölunda HC';
            break;
        case 'Red Bull Munich':
            name = 'EHC München';
            break;
        case 'KAC Klagenfurt':
            name = 'Klagenfurter AC';
            break;
        case 'Graz99ers':
            name = 'Graz 99ers';
            break;
        case 'Mountfield HK':
            name = 'HK Hradec Králové';
            break;
        case 'Rungsted Seier Capital':
            name = 'Rungsted Ishockey';
            break;
        case 'Djurgården Stockholm':
            name = 'Djurgårdens IF';
            break;
        case 'HC05 Banská Bystrica':
            name = 'HC 05 Banská Bystrica';
            break;
    }
    return name;
}

function getScoreType(scoretype) {
    if (scoretype === 'F/OT') {
        return 'OT';
    }
    if (scoretype === 'F/SO') {
        return 'SO';
    }
    return 'RT';
}
