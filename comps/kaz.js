var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        var pages = 1;

        var gameListUrls = [];
        for (var i = 1; i <= pages; i++) {
            gameListUrls.push('https://icehockey.kz/professional-hockey/tournaments/3/6/calendar.html?page=' + i + '&filter-conference=&filter-stage=&filter-command=&filter-date1=&filter-date2=&filter-status=1');
        }
        var initResponses = await common.asyncGetHTMLs(gameListUrls);

        console.log(initResponses);
        /*
        var useXHTMLNamespace = false;

        var gameUrls = [];
        initResponses.forEach(function (response) {
            var gameRowNodes = common.getNodes(useXHTMLNamespace, '//tr[contains(@class, \'table-row cursor\')]', gameDoc);
            nodes.forEach(function (node, index) {
                gameUrls.push(getUrl(thisNode.attributes['onclick'].value));
            });
        });

        console.log(gameUrls);
        */
        /*
                var gameObjects = await common.asyncGetJSONs(gameUrls, 'externalStatisticsCallback');

                var rowObjects = [];
                gameObjects.forEach(function (game, index) {
                    rowObjects.push({
                        competition: 'nla',
                        season: '1819',
                        stage: 'RS',
                        date: game.status.startDateTime.substr(0, 10),
                        team1: game.details.homeTeam.name,
                        team2: game.details.awayTeam.name,
                        score1: game.result.homeTeam,
                        score2: game.result.awayTeam,
                        attendance: game.details.venue.spectators,
                        location: game.details.venue.name,
                        source: 'https://www.sihf.ch/de/game-center/game/#/' + game.gameId
                    });
                    console.log('row ' + index + ' / ' + gameObjects.length + ' done');
                });
                rowObjects = common.prepareRowObjects(rowObjects);
                var tsv = common.createTSV(rowObjects);
                return tsv;*/
    }
};
/*
function getLocation(location) {
    location = location
        .replace('"', '')
        .trim();
    location = location.substring(location.indexOf('(') + 1, location.indexOf(')'));
    switch (location) {
        case 'Усть-Каменогорск':
            location = 'Ust-Kamenogorsk';
            break;
        case 'Астана':
            location = 'Astana';
            break;
        case 'Кокшетау':
            location = 'Kokshetau';
            break;
        case 'Петропавловск':
            location = 'Petropavlovsk';
            break;
        case 'Павлодар':
            location = 'Pavlodar';
            break;
        case 'Алматы':
            location = 'Almaty';
            break;
    }
    return location;
}

function getTeamName(name) {
    switch (name) {
        case 'Алматы':
            name = 'HC Almaty';
            break;
        case 'Ertis':
            name = 'Ertis Pavlodar';
            break;
        case 'Алтай-Торпедо':
            name = 'Altay-Torpedo';
            break;
        case 'Арлан':
            name = 'Arlan Kokshetau';
            break;
        case 'Номад':
            name = 'Nomad Astana';
            break;
        case 'Темиртау':
            name = 'HC Temirtau';
            break;
        case 'Бейбарыс':
            name = 'Beibarys Atyrau';
            break;
        case 'Горняк':
            name = 'Gornyak Rudny';
            break;
        case 'Кулагер':
            name = 'Kulager Petropavl';
            break;
        case 'Астана':
            name = 'HC Astana';
            break;
    }
    return name;
}

function getFormattedDateKAZ(rawDate) {
    rawDate = rawDate.replace('"', '').trim();
    var dateElemArray = rawDate.split(' ')[0].split('.');
    return [dateElemArray[2], dateElemArray[1], dateElemArray[0]].join('-');
}

function getMonthNr(month) {
    var months = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
    return (months.indexOf(month.toLowerCase()) + 101).toString().substring(1, 3);
}

function getUrl(attributeValue) {
    if (!attributeValue) {
        return;
    }
    return attributeValue.split('=')[1].slice(1, -1);
}
*/
