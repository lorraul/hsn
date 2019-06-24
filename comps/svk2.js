var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        var gameUrls = [];
        //RS 99950-100236
        //PO 100400 - 100456
        //POUT 100457 - 100468
        for (var i = 100400; i < 100456; i++) {
            gameUrls.push('https://stnliga.hockeyslovakia.sk/sk/stats/matches/669/st-nicolaus-1-hokejova-liga/match/' + i + '/stats');
        }

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = false;

        gameDocuments.forEach(function (gameDoc, index) {
            if (!gameDoc) {
                return;
            }
            gameDoc = common.stringToDoc(gameDoc);
            var validatorElem = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[3]/div/div[1]/div/div/header/div[1]/div[2]/span[2]/span', gameDoc);
            var validPage = (validatorElem && validatorElem.trim().length > 0) ? true : false;
            if (!validPage) {
                return;
            }

            var score1, score2, attendance, location;
            score1 = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[3]/div/div[1]/div/div/header/div[1]/div[2]/span[1]/span[1]', gameDoc);
            score2 = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[3]/div/div[1]/div/div/header/div[1]/div[2]/span[1]/span[2]', gameDoc);

            var stage = 'PO';

            if (stage == 'RS' || stage == 'POUT') {
                attendance = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[3]/div/div[1]/div/div/header/div[2]/div/span[4]', gameDoc, 1);
                location = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[3]/div/div[1]/div/div/header/div[2]/div/span[3]', gameDoc, 1);
            } else if (stage == 'PO') {
                attendance = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[3]/div/div[1]/div/div/header/div[2]/div/span[5]', gameDoc, 1);
                location = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[3]/div/div[1]/div/div/header/div[2]/div/span[4]', gameDoc, 1);
            }

            rowObjects.push({
                competition: 'svk2',
                season: '1819',
                stage: stage,
                date: getFormattedDateSVK2(common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[3]/div/div[1]/div/div/header/div[2]/div/span[@class="hidden-xs"]', gameDoc, 1)),
                team1: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[3]/div/div[1]/div/div/header/div[1]/div[1]/a', gameDoc).trim()),
                team2: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[3]/div/div[1]/div/div/header/div[1]/div[3]/a', gameDoc).trim()),
                score1: score1,
                score2: score2,
                attendance: attendance ? attendance.replace(/\D/g, '') : '',
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

function getFormattedDateSVK2(rawDate) {
    var dateArray = rawDate.trim().replace(',', '').split(' ')[1].split('.');
    return [dateArray[2], dateArray[1], dateArray[0]].join('-');
}

function getTeamName(name) {
    switch (name) {
        case 'HK ORANGE 20':
            name = 'HK Orange 20';
            break;
        case 'HC PREŠOV':
            name = 'HC Prešov';
            break;
        case 'HK Dukla Ingema Michalovce':
            name = 'HK Dukla Michalovce';
            break;
        case 'HC OSMOS Bratislava':
            name = 'HC Bratislava';
            break;
    }
    return name;
}
