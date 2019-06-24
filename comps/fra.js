var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        //rs: seasonid=18674
        //po: seasonid=19207
        var initUrl = 'http://ligue_magnus.wttstats.pointstreak.com/leagueschedule.html?leagueid=1426&seasonid=19207';

        var gameDoc = await common.asyncGetHTMLs([initUrl]);
        gameDoc = common.stringToDoc(gameDoc[0]);
        var gameRowNodes = common.getNodes(false, '//td[contains(@class, \'text-nowrap\')]', gameDoc);
        var gameUrls = [];
        gameRowNodes.forEach(function (rowNode) {
            gameUrls.push('http://ligue_magnus.wttstats.pointstreak.com/' + rowNode.childNodes[1].attributes[0].value);
        });

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = true;

        gameDocuments.forEach(function (gameDoc, index) {
            if (!gameDoc) {
                return;
            }
            gameDoc = common.stringToDoc(gameDoc);
            var score = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="summary"]/x:tr[2]/x:td[1]/x:table/x:tr[7]/x:td[2]', gameDoc).split(':');
            if (score.length != 2) {
                score = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="summary"]/x:tr[2]/x:td[1]/x:table/x:tr[6]/x:td[2]', gameDoc).split(':');
                if (score.length != 2) {
                    score = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="summary"]/x:tr[2]/x:td[1]/x:table/x:tr[5]/x:td[2]', gameDoc).split(':');
                }
            }
            rowObjects.push({
                competition: 'fra',
                season: '1819',
                stage: 'PO',
                date: formatDate(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="topinfo"]/x:tr[2]/x:td/x:table/x:tr/x:td[6]', gameDoc)),
                team1: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '/x:html/x:body/x:table[2]/x:tr[1]/x:td[1]/x:table[1]/x:tr/x:td[2]/x:strong', gameDoc).trim()),
                team2: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '/x:html/x:body/x:table[3]/x:tr[1]/x:td[1]/x:table[1]/x:tr/x:td[2]/x:strong', gameDoc).trim()),
                score1: score[0],
                score2: score[1],
                attendance: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="topinfo"]/x:tr[2]/x:td/x:table/x:tr/x:td[10]', gameDoc).trim().replace(/\D/g, ''),
                location: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="topinfo"]/x:tr[2]/x:td/x:table/x:tr/x:td[4]', gameDoc),
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
        case 'Grenoble':
            name = 'Grenoble Bruleurs de Loups';
            break;
        case 'Rouen':
            name = 'Rouen Dragons';
            break;
        case 'Nice':
            name = 'Nice Aigles';
            break;
        case 'Angers':
            name = 'Angers Ducs';
            break;
        case 'Bordeaux':
            name = 'Bordeaux Boxers';
            break;
        case 'Lyon':
            name = 'Lyon Lions';
            break;
        case 'Amiens':
            name = 'Amiens Gothiques';
            break;
        case 'Strasbourg':
            name = 'Strasbourg Étoile Noire';
            break;
        case 'Mulhouse':
            name = 'Mulhouse Scorpions';
            break;
        case 'Gap':
            name = 'Gap Rapaces';
            break;
        case 'Chamonix':
            name = 'Chamonix Pionniers';
            break;
        case 'Chamonix-Morzine':
            name = 'Chamonix Pionniers';
            break;
        case 'Anglet':
            name = 'Anglet Hormadi';
            break;
        case 'Epinal':
            name = 'Épinal Gamyo';
            break;
        case 'Dijon':
            name = 'Dijon Ducs';
            break;
        case 'HCMAG':
            name = 'Morzine-Avoriaz-Les Gets Pingouins';
            break;
        case 'Brest':
            name = 'Brest Albatros';
            break;
        case 'Briançon':
            name = 'Briançon Diables Rouges';
            break;
        case 'Caen':
            name = 'Caen Drakkars';
            break;
        case 'Villard de Lans':
            name = 'Villard de Lans Ours';
            break;
    }
    return name;
}

function formatDate(date) {
    var dateArray = date.split('.');
    return [dateArray[2], dateArray[1], dateArray[0]].join('-');
}
