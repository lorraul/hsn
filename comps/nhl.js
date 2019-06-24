var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        var gameUrls = [];
        for (var i = 30411; i < 30420; i++) {
            gameUrls.push('http://www.nhl.com/scores/htmlreports/20182019/GS0' + i + '.HTM');
        }

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = false;

        gameDocuments.forEach(function (doc, index) {
            if (!doc) {
                return;
            }
            doc = common.stringToDoc(doc);
            rowObjects.push({
                competition: 'nhl',
                season: '1819',
                stage: 'FIN',
                date: common.getFormattedDate(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="GameInfo"]/tr[4]/td', doc)),
                team1: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="VPenaltySummary"]/tr/td[2]', doc)),
                team2: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="VPenaltySummary"]/tr/td[1]', doc)),
                score1: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="Home"]/tr[2]/td/table/tr/td[2]', doc),
                score2: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="Visitor"]/tr[2]/td/table/tr/td[2]', doc),
                attendance: common.digitsOnly(getAttendance(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="GameInfo"]/tr[5]/td', doc))),
                location: getLocation(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="GameInfo"]/tr[5]/td', doc)),
                source: gameUrls[index]
            });
            console.log('row ' + index + ' / ' + gameDocuments.length + ' done');
        });

        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getTeamName(rawName) {
    var name = rawName.toLowerCase().split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');
    switch (name) {
        case 'St. Louis Blues':
            name = 'St Louis Blues';
            break;
    }
    return name;
}

function getAttendance(attendance) {
    return attendance.split(' at ')[0].replace(/\D/g, '');
}

function getLocation(location) {
    location = location.split('at')[1].trim();
    if (location === 'N') {
        return 'Nationwide Arena';
    } else {
        return location;
    }
}
