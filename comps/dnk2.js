var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        var gameDoc = await common.asyncGetHTMLs(['http://stats.sportsadmin.dk/schedule.aspx?tournamentID=1582']);
        gameDoc = common.stringToDoc(gameDoc[0]);
        var useXHTMLNamespace = false;
        var gameRowNodes = common.getNodes(useXHTMLNamespace, '//tr/td[last()]/a', gameDoc);

        var gameUrls = [];
        gameRowNodes.forEach(function (node) {
            gameUrls.push(node.attributes[0].nodeValue);
        });

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = false;

        gameDocuments.forEach(function (urlDoc, index) {
            if (!urlDoc) {
                return;
            }
            urlDoc = common.stringToDoc(urlDoc);
            if (common.getTextFromDoc(useXHTMLNamespace, '//*[@id="ctl00_ContentPlaceHolder1_lblDato"]', urlDoc) == '0') {
                return;
            }
            var attendance = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="ctl00_ContentPlaceHolder1_lblSpectators"]', urlDoc);
            rowObjects.push({
                competition: 'dnk2',
                season: '1920',
                stage: 'RS',
                date: getFormattedDateC(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="ctl00_ContentPlaceHolder1_lblDato"]', urlDoc).split('kl.')[0]),
                team1: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="ctl00_ContentPlaceHolder1_lblHjemmeHold"]', urlDoc)),
                team2: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="ctl00_ContentPlaceHolder1_lblUdeHold"]', urlDoc)),
                score1: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="ctl00_ContentPlaceHolder1_lblHomeGoalsHeader"]', urlDoc),
                score2: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="ctl00_ContentPlaceHolder1_lblAwayGoalsHeader"]', urlDoc),
                scoretype: getScoretype(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="ctl00_ContentPlaceHolder1_lblG4"]', urlDoc)),
                attendance: attendance ? attendance : '',
                location: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="ctl00_ContentPlaceHolder1_lblTurnering"]', urlDoc, 2),
                source: gameUrls[index]
            });
            console.log('row ' + index + ' / ' + gameDocuments.length + ' done');
        });

        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getScoretype(domtext) {
    if (domtext === '0 - 0') {
        return 'RT';
    }
    return 'OT/SO';
}

function getTeamName(name) {
    switch (name) {
        case 'Rungsted Seier Capital':
            name = 'Rungsted Ishockey';
            break;
        case 'SønderjyskE':
            name = 'SønderjyskE Vojens';
            break;
    }
    return name;
}

function getFormattedDateC(dateString) {
    dateString = dateString.trim();
    var dateArray = dateString.split('-');
    return [dateArray[2], dateArray[1], dateArray[0]].join('-');
}
