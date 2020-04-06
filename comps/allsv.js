var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        var gameUrls = [];
        //RS: 393543-394000
        //FIN: 399853-399857
        for (var i = 441269; i <= 441635; i++) {
            gameUrls.push('http://stats.swehockey.se/Game/Events/' + i);
        }

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = false;
        gameDocuments.forEach(function (urlDoc, index) {
            if (!urlDoc) {
                return;
            }
            urlDoc = common.stringToDoc(urlDoc);
            var comp = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="groupStandingResultContent"]/table/tr[1]/td/table/tr/td/table/tr[2]/td[2]/h3', urlDoc);
            if (comp !== 'HockeyAllsvenskan') {
                return;
            }

            var teams = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="groupStandingResultContent"]/table/tr[1]/td/table/tr/td/table/tr[1]/th/h2', urlDoc);
            var scores = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="groupStandingResultContent"]/table/tr[1]/td/table/tr/td/table/tr[3]/td[4]/div[1]', urlDoc);
            var scoretype = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="groupStandingResultContent"]/table/tr[1]/td/table/tr/td/table/tr[3]/td[4]/div[2]', urlDoc);

            rowObjects.push({
                competition: 'allsv',
                season: '1920',
                stage: 'RS',
                date: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="groupStandingResultContent"]/table/tr[1]/td/table/tr/td/table/tr[2]/td[1]/h3', urlDoc).substr(0, 10),
                team1: getTeamName(teams.split('-')[0].trim()),
                team2: getTeamName(teams.split('-')[1].trim()),
                score1: scores.split('-')[0].trim(),
                score2: scores.split('-')[1].trim(),
                scoretype: getScoretype(scoretype),
                attendance: common.digitsOnly(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="groupStandingResultContent"]/table/tr[1]/td/table/tr/td/table/tr[3]/td[4]/div[4]', urlDoc).split(': ')[1]),
                location: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="groupStandingResultContent"]/table/tr[1]/td/table/tr/td/table/tr[2]/td[3]/h3/b', urlDoc),
                source: gameUrls[index]
            });
            console.log('row ' + index + ' / ' + gameDocuments.length + ' done');
        });
        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getScoretype(scoretype) {
    var nr = scoretype.split("-").length - 1;
    if (nr == 5) {
        return 'SO';
    } else if (nr == 4) {
        return 'OT';
    }
    return 'RT';
}

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
        case 'Mora IK':
            name = 'Mora';
            break;
    }
    return name;
}
