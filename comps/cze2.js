var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        //RS
        //var initUrl = 'https://hokej.cz/chance-liga/zapasy?matchList-view-displayAll=1&matchList-filter-season=2018&matchList-filter-competition=6280';
        //po
        //var initUrl = 'https://hokej.cz/chance-liga/zapasy?matchList-filter-season=2018&matchList-filter-competition=6305';

        var initUrl = 'https://hokej.cz/chance-liga/zapasy?matchList-view-displayAll=1&matchList-filter-season=2019&matchList-filter-competition=6476';

        var gameDoc = await common.asyncGetHTMLs([initUrl]);
        gameDoc = common.stringToDoc(gameDoc[0]);
        var gameRowNodes = common.getNodes(false, '//tr[contains(@class, \'js-preview__link\')]', gameDoc);
        var gameUrls = [];
        gameRowNodes.forEach(function (rowNode) {
            if (!rowNode.childNodes[5].attributes['colspan']) {
                gameUrls.push('https://hokej.cz/zapas/' + rowNode.attributes[0].value.split('/')[2]);
            }
        });

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = true;

        gameDocuments.forEach(function (gameDoc, index) {
            if (!gameDoc) {
                return;
            }
            gameDoc = common.stringToDoc(gameDoc);
            var attendance = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[18]/div/div[5]/div/div[3]/div[1]/div/div[3]/span[2]', gameDoc);
            if (!attendance) {
                attendance = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[18]/div/div[5]/div/div[3]/div[1]/div/div[2]/span[2]', gameDoc);
            }
            if (!attendance) {
                attendance = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[18]/div/div[5]/div/div[4]/div[1]/div/div[3]/span[2]', gameDoc);
            }
            var location = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[18]/div/div[5]/div/div[3]/div[1]/div/div[3]/span[3]', gameDoc);
            if (!location) {
                location = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[18]/div/div[5]/div/div[4]/div[1]/div/div[3]/span[3]', gameDoc);
            }

            rowObjects.push({
                competition: 'cze2',
                season: '1920',
                stage: 'RS',
                date: formatDate(common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[18]/div/div[3]/div/div[1]/div/ul/li[2]', gameDoc, 1)),
                team1: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[18]/div/div[3]/div/div[2]/div[1]/a/h2[1]', gameDoc)),
                team2: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[18]/div/div[3]/div/div[2]/div[3]/a/h2[1]', gameDoc)),
                score1: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="snippet-matchOverview-score"]/div/span[1]', gameDoc),
                score2: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="snippet-matchOverview-score"]/div/span[3]', gameDoc),
                scoretype: getScoreType(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="snippet-matchOverview-score"]/div/div/span[1]', gameDoc)),
                attendance: attendance,
                location: location,
                source: gameUrls[index]
            });
            console.log('row ' + index + ' / ' + gameDocuments.length + ' done');
        });

        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function formatDate(date) {
    var dateArray = date.split(' ')[0].split('.');
    return [dateArray[2], (parseInt(dateArray[1]) + 100).toString().substring(1, 3), (parseInt(dateArray[0]) + 100).toString().substring(1, 3)].join('-');
}

function getScoreType(scoretype) {
    if (scoretype === 'konec po prodloužení') {
        return 'OT';
    }
    if (scoretype === 'konec po s.n.') {
        return 'SO';
    }
    return 'RT';
}

function getTeamName(name) {
    switch (name) {
        case 'AZ RESIDOMO Havířov':
            name = 'AZ Havířov';
            break;
        case 'ČEZ Motor České Budějovice':
            name = 'HC České Budějovice';
            break;
        case 'HC Dukla Jihlava':
            name = 'Dukla Jihlava';
            break;
        case 'HC RT TORAX Poruba 2011':
            name = 'HC Poruba';
            break;
        case 'HC ZUBR Přerov':
            name = 'HC Přerov';
            break;
        case 'Hokej Ústí nad Labem s.r.o.':
            name = 'HC Slovan Ústí nad Labem';
            break;
        case 'SK Trhači Kadaň':
            name = 'SK Kadaň';
            break;
        case 'VHK ROBE Vsetín':
            name = 'VHK Vsetín';
            break;
        case 'Č. Budějovice':
            name = 'HC České Budějovice';
            break;
        case 'Ústí nad Labem':
            name = 'HC Slovan Ústí nad Labem';
            break;
    }
    return name;
}
