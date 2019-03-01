var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        var gameUrls = [];
        for (var i = 393543; i < 394000; i++) {
            gameUrls.push('http://stats.swehockey.se/Game/Events/' + i);
        }

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        gameDocuments.forEach(function (urlDoc, index) {
            if (!urlDoc) {
                return;
            }
            var comp = common.getTextFor('//*[@id="groupStandingResultContent"]/table/tr[1]/td/table/tr/td/table/tr[2]/td[2]/h3', urlDoc);
            if (comp !== 'HockeyAllsvenskan') {
                return;
            }

            var teams = common.getTextFor('//*[@id="groupStandingResultContent"]/table/tr[1]/td/table/tr/td/table/tr[1]/th/h2', urlDoc);
            var scores = common.getTextFor('//*[@id="groupStandingResultContent"]/table/tr[1]/td/table/tr/td/table/tr[3]/td[4]/div[1]', urlDoc);

            rowObjects.push({
                competition: 'allsv',
                season: '1819',
                stage: 'RS',
                date: common.getTextFor('//*[@id="groupStandingResultContent"]/table/tr[1]/td/table/tr/td/table/tr[2]/td[1]/h3', urlDoc).substr(0, 10),
                team1: getTeamName(teams.split('-')[0].trim()),
                team2: getTeamName(teams.split('-')[1].trim()),
                score1: scores.split('-')[0].trim(),
                score2: scores.split('-')[1].trim(),
                attendance: common.digitsOnly(common.getTextFor('//*[@id="groupStandingResultContent"]/table/tr[1]/td/table/tr/td/table/tr[3]/td[4]/div[4]', urlDoc).split(': ')[1]),
                location: common.getTextFor('//*[@id="groupStandingResultContent"]/table/tr[1]/td/table/tr/td/table/tr[2]/td[3]/h3/b', urlDoc),
                source: gameUrls[index]
            });
        });
        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getTeamName(name) {
    switch (name) {
        case 'MODO Hockey':
            name = 'Modo Hockey';
            break;
        case 'Karlskrona HK':
            name = 'Karlskrona';
            break;
        case 'Leksands IF':
            name = 'Leksand';
            break;
    }
    return name;
}
