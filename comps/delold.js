var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        var gameUrls = [];

        for (var i = 2872720; i <= 2872730; i++) {
            gameUrls.push('http://pointstreak.com/prostats/iihfgamesheet.html?gameid=' + i);
        }

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = true;

        gameDocuments.forEach(function (gameDoc, index) {
            if (!gameDoc) {
                return;
            }
            gameDoc = common.stringToDoc(gameDoc);
            var competition = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="topinfo"]/x:tr[1]/x:td[2]/x:h2', gameDoc);
            if (competition !== 'GER - DEL - Deutsche Eishockey Liga') {
                if (competition) console.log(competition);
                return;
            }
            var score = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="summary"]/x:tr[2]/x:td[1]/x:table/x:tr[7]/x:td[2]', gameDoc).split(':');
            if (score.length != 2) {
                score = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="summary"]/x:tr[2]/x:td[1]/x:table/x:tr[6]/x:td[2]', gameDoc).split(':');
                if (score.length != 2) {
                    score = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="summary"]/x:tr[2]/x:td[1]/x:table/x:tr[5]/x:td[2]', gameDoc).split(':');
                }
            }
            rowObjects.push({
                competition: 'del',
                season: '1516',
                stage: 'FIN',
                date: common.formatDateIIHF(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="topinfo"]/x:tr[2]/x:td/x:table/x:tr/x:td[6]', gameDoc)),
                team1: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '/x:html/x:body/x:table[2]/x:tr[1]/x:td[1]/x:table[1]/x:tr/x:td[2]/x:strong', gameDoc).trim()),
                team2: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '/x:html/x:body/x:table[3]/x:tr[1]/x:td[1]/x:table[1]/x:tr/x:td[2]/x:strong', gameDoc).trim()),
                score1: score[0],
                score2: score[1],
                attendance: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="topinfo"]/x:tr[2]/x:td/x:table/x:tr/x:td[10]', gameDoc).trim().replace(/\D/g, ''),
                location: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="topinfo"]/x:tr[2]/x:td/x:table/x:tr/x:td[4]', gameDoc),
                source: gameUrls[index]
            });
            console.log('row ' + (index + 1) + ' / ' + gameDocuments.length + ' done');
        });

        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getTeamName(name) {
    switch (name) {
        case 'EHC Red Bull München':
            name = 'EHC München';
            break;
        case 'Pinguins Bremerhaven':
            name = 'Fischtown Pinguins';
            break;
        case 'Schwenninger Wild Wings':
            name = 'Schwenninger WW';
            break;
        case 'Thomas Sabo Ice Tigers':
            name = 'Nürnberg Ice Tigers';
            break;
        case 'Grizzly Adams Wolfsburg':
            name = 'Grizzlys Wolfsburg';
            break;
        case 'DEG Metro Stars':
            name = 'Düsseldorfer EG';
            break;
    }
    return name;
}
