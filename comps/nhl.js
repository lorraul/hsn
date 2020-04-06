var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        var gameUrls = [];
        for (var i = 20700; i < 21090; i++) {
            gameUrls.push('http://www.nhl.com/scores/htmlreports/20192020/GS0' + i + '.HTM');
        }

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = false;

        gameDocuments.forEach(function (doc, index) {
            if (!doc) {
                return;
            }
            doc = common.stringToDoc(doc);
            var scoretype;
            if (common.getTextFromDoc(useXHTMLNamespace, '//*[@id="MainTable"]/tr[9]/td/table/tr[2]/td/table/tr/td[1]/table/tr[5]/td[1]', doc) == 'TOT') {
                scoretype = 'RT';
            } else {
                var ot1score = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="MainTable"]/tr[9]/td/table/tr[2]/td/table/tr/td[1]/table/tr[5]/td[2]', doc);
                var ot2score = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="MainTable"]/tr[9]/td/table/tr[2]/td/table/tr/td[2]/table/tr[5]/td[2]', doc);
                if (ot1score != '0' || ot2score != '0') {
                    scoretype = 'OT';
                } else {
                    scoretype = 'SO';
                }
            }
            rowObjects.push({
                competition: 'nhl',
                season: '1920',
                stage: 'RS',
                date: common.getFormattedDate(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="GameInfo"]/tr[4]/td', doc)),
                team1: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="VPenaltySummary"]/tr/td[2]', doc)),
                team2: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="VPenaltySummary"]/tr/td[1]', doc)),
                score1: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="Home"]/tr[2]/td/table/tr/td[2]', doc),
                score2: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="Visitor"]/tr[2]/td/table/tr/td[2]', doc),
                scoretype: scoretype,
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
    location = location.split('at')[1] ? location.split('at')[1].trim() : location.split('at')[0].trim();
    if (location && location.trim() === 'N') {
        return 'Nationwide Arena';
    } else {
        return location;
    }
}
