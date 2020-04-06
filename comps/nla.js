var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        var pages = 20;
        var initUrls = [];
        /*
        1819
        RS: https://data.sihf.ch/Statistic/api/cms/cache300?alias=results&searchQuery=1,10//1,81&filterQuery=2019/1/3002/09.03.2019-23.03.2019&filterBy=Season,League,Phase,Date&orderBy=date&orderByDescending=false&take=20&callback=externalStatisticsCallback&skip=' + i + '&language=de
        FIN: https://data.sihf.ch/Statistic/api/cms/cache300?alias=results&searchQuery=1,10//1,81&filterQuery=2019/1/3071/11.04.2019-20.04.2019&filterBy=Season,League,Phase,Date&orderBy=date&orderByDescending=false&take=20&callback=externalStatisticsCallback&skip=-1&language=de
        */
        for (var i = 0; i < pages; i++) {
            initUrls.push('https://data.sihf.ch/Statistic/api/cms/cache300?alias=results&searchQuery=1,10//1,81&filterQuery=2020/1/3092/13.09.2019-29.02.2020&filterBy=Season,League,Phase,Date&orderBy=date&orderByDescending=false&take=20&callback=externalStatisticsCallback&skip=' + i + '&language=de');
        }

        //var initUrls = ['https://data.sihf.ch/Statistic/api/cms/cache300?alias=results&searchQuery=1,10//1,81&filterQuery=2019/1/3071/11.04.2019-20.04.2019&filterBy=Season,League,Phase,Date&orderBy=date&orderByDescending=false&take=20&callback=externalStatisticsCallback&skip=-1&language=de']

        var initResponses = await common.asyncGetJSONs(initUrls, null, "/**/ typeof externalStatisticsCallback === 'function' && externalStatisticsCallback(", ");");

        var gameUrls = [];
        initResponses.forEach(function (response) {
            if (response.data[0][0] === 'Keine Spiele gefunden!') {
                return;
            }
            var gameIds = response.data.map(o => o[9].gameId);
            for (var i = 0; i < gameIds.length; i++) {
                gameUrls.push('https://data.sihf.ch/statistic/api/cms/gameoverview15?alias=gameDetail&searchQuery=' + gameIds[i] + '&callback=externalStatisticsCallback&language=de');
            }
        });

        var gameObjects = await common.asyncGetJSONs(gameUrls, null, "/**/ typeof externalStatisticsCallback === 'function' && externalStatisticsCallback(", ");");

        var rowObjects = [];
        gameObjects.forEach(function (game, index) {
            rowObjects.push({
                competition: 'nla',
                season: '1920',
                stage: 'RS',
                date: game.status.startDateTime.substr(0, 10),
                team1: game.details.homeTeam.name,
                team2: game.details.awayTeam.name,
                score1: game.result.homeTeam,
                score2: game.result.awayTeam,
                scoretype: getScoretype(game.summary),
                attendance: game.details.venue.spectators,
                location: game.details.venue.name,
                source: 'https://www.sihf.ch/de/game-center/game/#/' + game.gameId
            });
            console.log('row ' + index + ' / ' + gameObjects.length + ' done');
        });
        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getScoretype(summary) {
    if (summary.periods.length == 3) {
        return 'RT';
    } else if (summary.periods.length == 4 && summary.shootout.shoots.length == 0) {
        return 'OT';
    } else if (summary.shootout.shoots.length > 0) {
        return 'SO';
    }
}
