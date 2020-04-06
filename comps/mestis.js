var request = require('request');
var common = require('../common');

module.exports = {
    getTSV: async function () {
        //RS: http://www.mestis.fi/modules/mod_seriegameschedule/helper/getgames.php?stgid=168&levelid=65
        //PO: http://www.tilastopalvelu.fi/ih/beta/tilastointi/modules/mod_seriegameschedule/helper/getgames.php?stgid=3333&levelid=65&type=0&teamid=&season=2019
        var initUrl = 'http://www.tilastopalvelu.fi/ih/beta/tilastointi/modules/mod_seriegameschedule/helper/getgames.php?stgid=168&levelid=65&type=1&teamid=&season=2020';
        var initResponse = await common.asyncGetJSONs([initUrl]);
        var gameUrls = [];
        for (var i = 0; i < initResponse[0].games.length; i++) {
            if (initResponse[0].games[i].FinishedType !== 0) {
                gameUrls.push('http://www.tilastopalvelu.fi/ih/unsync/front1/statsapi/gamereports/getgamereportdata.php?gameid=' + initResponse[0].games[i].GameID);
            }
        }

        var gameObjects = await common.asyncGetJSONs(gameUrls);

        var rowObjects = [];
        gameObjects.forEach(function (gameObject, index) {
            if (!gameObject) {
                return;
            }
            rowObjects.push({
                competition: 'mestis',
                season: '1920',
                stage: 'RS',
                date: getFormattedDateMESTIS(gameObject.GamesUpdate[0].StartDate),
                team1: gameObject.GamesUpdate[0].HomeTeam.Name,
                team2: gameObject.GamesUpdate[0].AwayTeam.Name,
                score1: gameObject.GamesUpdate[0].HomeTeam.Goals,
                score2: gameObject.GamesUpdate[0].AwayTeam.Goals,
                scoretype: getScoretype(gameObject.PeriodSummary.PeriodGoals),
                attendance: gameObject.GamesUpdate[0].Spectators,
                location: gameObject.GamesUpdate[0].Arena,
                source: 'http://www.tilastopalvelu.fi/ih/gamereport/report/gamereport.php?gameid=' + gameObject.GamesUpdate[0].Id
            });
            console.log('row ' + index + ' / ' + gameObjects.length + ' done');
        });
        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getScoretype(periods) {
    if (periods.length === 4) {
        return 'RT';
    }
    if (periods.length === 5) {
        return 'OT';
    }
    if (periods.length === 6) {
        return 'SO';
    }
}

function getFormattedDateMESTIS(date) {
    var dateArray = date.split('.');
    return dateArray[2] + '-' + dateArray[1] + '-' + dateArray[0];
}
