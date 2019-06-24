var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        var gameUrls = [];
        //RS: 393400-393900
        for (var i = 423830; i <= 423890; i++) {
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
            if (comp !== 'SM-slutspel') {
                return;
            }
            var teams = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="groupStandingResultContent"]/table/tr[1]/td/table/tr/td/table/tr[1]/th/h2', urlDoc);
            var scores = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="groupStandingResultContent"]/table/tr[1]/td/table/tr/td/table/tr[3]/td[4]/div[1]', urlDoc);

            rowObjects.push({
                competition: 'shl',
                season: '1819',
                stage: 'PO',
                date: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="groupStandingResultContent"]/table/tr[1]/td/table/tr/td/table/tr[2]/td[1]/h3', urlDoc).substr(0, 10),
                team1: getTeamName(teams.split('-')[0].trim()),
                team2: getTeamName(teams.split('-')[1].trim()),
                score1: scores.split('-')[0].trim(),
                score2: scores.split('-')[1].trim(),
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

function getTeamName(name) {
    switch (name) {
        case 'Djurgården':
            name = 'Djurgårdens IF';
            break;
        case 'Färjestad':
            name = 'Färjestad BK';
            break;
        case 'Frölunda':
            name = 'Frölunda HC';
            break;
        case 'HV 71':
            name = 'HV71 Jönköping';
            break;
        case 'Linköping':
            name = 'Linköping HC';
            break;
        case 'Luleå':
            name = 'Luleå HF';
            break;
        case 'IF Malmö Redhawks':
            name = 'Malmö Redhawks';
            break;
        case 'Skellefteå':
            name = 'Skellefteå AIK';
            break;
        case 'Växjö Lakers HC':
            name = 'Växjö Lakers';
            break;
        case 'Timrå':
            name = 'Timrå IK';
            break;
        case 'Rögle BK':
            name = 'Rögle';
            break;
        case 'Örebro HK':
            name = 'Örebro';
            break;
        case 'Mora IK':
            name = 'Mora';
            break;
        case 'Brynäs IF':
            name = 'Brynäs';
            break;
    }
    return name;
}
