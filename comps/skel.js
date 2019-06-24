var request = require('request');
var common = require('../common');

module.exports = {
    getTSV: async function () {
        var gameUrls = [];
        //RS: 101458 - 103433
        //qr: 106287 - 106293
        //qf: 106297 - 106320
        //sf: 106330 - 106345
        //fin: 106325 - 106329

        for (var i = 106325; i <= 106329; i++) {
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
            //RS: var attendance = common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[2]/div/span[4]', gameDoc, 1);
            var attendance = common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[2]/div/span[5]', gameDoc, 1);

            rowObjects.push({
                competition: 'skel',
                season: '1819',
                stage: 'FIN',
                //RS: date: getFormattedDateSKEL(common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[2]/div/span[1]', gameDoc, 1)),
                date: getFormattedDateSKEL(common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[2]/div/span[2]', gameDoc, 1)),
                team1: getTeamName(common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[1]/div[1]/a', gameDoc).trim()),
                team2: getTeamName(common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[1]/div[3]/a', gameDoc).trim()),
                score1: score1,
                score2: score2,
                attendance: attendance ? attendance.replace(/\D/g, '') : '',
                //RS: location: common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[2]/div/span[3]', gameDoc, 1),
                location: common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[2]/div/span[4]', gameDoc, 1),
                source: gameUrls[index]
            });
            console.log('row ' + (index + 1) + ' / ' + gameDocuments.length + ' done');
        });
        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getFormattedDateSKEL(rawDate) {
    if (!rawDate) return;
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
