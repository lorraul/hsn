var request = require('request');
var common = require('../common');

module.exports = {
    getTSV: async function () {
        var gameUrls = [];
        //RS 671 71800-72400
        //PO 674
        for (var i = 80800; i < 81674; i++) {
            gameUrls.push('https://en.khl.ru/game/674/' + i + '/protocol/');
        }

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = false;

        gameDocuments.forEach(function (gameDoc, index) {
            if (!gameDoc) {
                return;
            }
            gameDoc = common.stringToDoc(gameDoc);
            var validPage = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="wrapper"]/div[2]/div[2]/dl[1]/dd/h3', gameDoc);
            if (!validPage) {
                return;
            }
            var team11 = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="wrapper"]/div[2]/div[2]/dl[1]/dd/h3', gameDoc);
            var team12 = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="wrapper"]/div[2]/div[2]/dl[1]/dd/p', gameDoc);
            var team21 = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="wrapper"]/div[2]/div[2]/dl[3]/dd/h3', gameDoc);
            var team22 = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="wrapper"]/div[2]/div[2]/dl[3]/dd/p', gameDoc);
            var score12 = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="wrapper"]/div[2]/div[2]/dl[2]/dt/h3/text()', gameDoc);
            score12 += common.getTextFromDoc(useXHTMLNamespace, '//*[@id="wrapper"]/div[2]/div[2]/dl[2]/dt/h3/*/text()', gameDoc);
            var attendance = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="wrapper"]/div[2]/div[2]/ul/li[2]/span[2]', gameDoc, 2);
            var location = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="wrapper"]/div[2]/div[2]/ul/li[2]/span[2]', gameDoc);
            rowObjects.push({
                competition: 'khl',
                season: '1819',
                stage: 'PO',
                date: getFormattedDate(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="wrapper"]/div[2]/div[2]/ul/li[1]/span[2]', gameDoc)),
                team1: getTeamName(team11, team12),
                team2: getTeamName(team21, team22),
                score1: score12.split('&ndash;&')[0].replace(/\D/g, ''),
                score2: score12.split('&ndash;&')[1].replace(/\D/g, ''),
                attendance: attendance ? attendance.replace(/\D/g, '') : '',
                location: location ? location.split(', ')[1] : '',
                source: gameUrls[index]
            });
            console.log('row ' + index + ' / ' + gameDocuments.length + ' done');
        });

        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getTeamName(name1, name2) {
    var name = name1 + ' ' + name2;
    switch (name) {
        case 'Dinamo Mn Minsk':
            name = 'Dinamo Minsk';
            break;
        case 'HC Sochi Sochi':
            name = 'HC Sochi';
            break;
        case 'Vityaz Moscow Region':
            name = 'Vityaz Podolsk';
            break;
        case 'Avangard Omsk Region':
            name = 'Avangard Omsk';
            break;
        case 'Dinamo R Riga':
            name = 'Dinamo Riga';
            break;
        case 'HC Dynamo M Moscow':
            name = 'Dynamo Moscow';
            break;
        case 'Sibir Novosibirsk Region':
            name = 'Sibir Novosibirsk';
            break;
        case 'Metallurg Mg Magnitogorsk':
            name = 'Metallurg Magnitogorsk';
            break;
        case 'Kunlun RS Beijing':
            name = 'Kunlun Red Star';
            break;
        case 'Torpedo Moscow':
            name = 'Torpedo Nizhny Novgorod';
            break;
        case 'Avtomobilist Ekaterinburg':
            name = 'Avtomobilist Yekaterinburg';
            break;
    }
    return name;
}

function getFormattedDate(rawDate) {
    var date = rawDate.split('.');
    return [date[2], date[1], date[0]].join('-');
}
