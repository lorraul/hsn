var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        var gameUrls = [];
        for (var i = 101458; i < 103433; i++) {
            gameUrls.push('https://www.hockeyslovakia.sk/sk/stats/matches/668/tipsport-liga/match/' + i + '/stats');
        }

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = false;

        gameDocuments.forEach(function (gameDoc, index) {
            if (!gameDoc) {
                return;
            }
            gameDoc = common.stringToDoc(gameDoc);
            var validatorElem = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[4]/div/div[1]/div/div/header/div[2]/div/span[3]', gameDoc, 1);
            var validPage = (validatorElem && validatorElem.trim().length > 0) ? true : false;
            if (!validPage) {
                return;
            }
            var score1 = common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[1]/div[2]/span[1]/span[1]', gameDoc);
            var score2 = common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[1]/div[2]/span[1]/span[2]', gameDoc);
            var attendance = common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[2]/div/span[4]', gameDoc, 1);

            rowObjects.push({
                competition: 'skel',
                season: '1819',
                stage: 'RS',
                date: getFormattedDateSKEL(common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[2]/div/span[1]', gameDoc, 1)),
                team1: getTeamName(common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[1]/div[1]/a', gameDoc).trim()),
                team2: getTeamName(common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[1]/div[3]/a', gameDoc).trim()),
                score1: score1,
                score2: score2,
                attendance: attendance ? attendance.replace(/\D/g, '') : '',
                location: common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[2]/div/span[3]', gameDoc, 1),
                source: gameUrls[index]
            });
            console.log('row ' + index + ' / ' + gameDocuments.length + ' done');
        });

        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getFormattedDateSKEL(rawDate) {
    var dateArray = rawDate.trim().replace(',', '').split(' ')[1].split('.');
    return [dateArray[2], dateArray[1], dateArray[0]].join('-');
}

function getTeamName(name) {
    switch (name) {
        case 'HK ORANGE 20':
            name = 'HK Orange 20';
            break;
        case 'MsHK DOXXbet Žilina':
            name = 'MsHK Žilina';
            break;
        case 'HC ‘05 iClinic Banská Bystrica':
            name = 'HC 05 Banská Bystrica';
            break;
        case 'HK DUKLA Trenčín':
            name = 'HK Dukla Trenčín';
            break;
        case 'MHC MIKRON Nové Zámky':
            name = 'HC Nové Zámky';
            break;
        case 'DVTK Jegesmedvék Miskolc':
            name = 'DVTK Jegesmedvék';
            break;
        case 'MAC Újbuda':
            name = 'MAC Budapest';
            break;
    }
    return name;
}
