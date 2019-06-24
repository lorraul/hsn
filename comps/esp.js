var request = require('request');
var common = require('../common');

module.exports = {
    getTSV: async function () {
        var gameUrls = [];

        //RS: 1930-2000
        //PO: 2350-2370
        //http://www.server2.sidgad.es/fedhielo/fedhielo_gr_2361_31.php?tab=tab_acta_web
        for (var i = 2350; i < 2370; i++) {
            gameUrls.push('http://www.server2.sidgad.es/fedhielo/fedhielo_gr_' + i + '_31.php?tab=tab_acta_web');
        }
        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = false;

        gameDocuments.forEach(function (gameDoc, index) {
            if (!gameDoc) {
                return;
            }
            gameDoc = common.stringToDoc(gameDoc);
            rowObjects.push({
                competition: 'esp',
                season: '1819',
                stage: 'PO',
                date: getFormattedDate(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="div_acta"]/div[1]/table/tr[4]/td[2]', gameDoc)),
                team1: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="partido_data_ppal"]/table/tr/td[2]/div[2]', gameDoc)),
                team2: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="partido_data_ppal"]/table/tr/td[6]/div', gameDoc)),
                score1: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="home_score"]', gameDoc),
                score2: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="away_score"]', gameDoc),
                attendance: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="div_acta"]/div[1]/table/tr[8]/td[4]', gameDoc),
                location: getLocation(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="div_acta"]/div[1]/table/tr[3]/td[4]', gameDoc)),
                source: gameUrls[index]
            });
            console.log('row ' + index + ' / ' + gameDocuments.length + ' done');
        });

        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getFormattedDate(rawDate) {
    if (!rawDate) {
        return;
    }
    var dateArray = rawDate.split(' - ')[0].split('/');
    return [dateArray[2], dateArray[1], dateArray[0]].join('-');
}

function getTeamName(name) {
    switch (name) {
        case 'SAD MAJADAHONDA':
            name = 'SAD Majadahonda';
            break;
        case 'CG PUIGCERDA':
            name = 'CG Puigcerdà';
            break;
        case 'CHH TXURI URDIN IHT':
            name = 'CHH Txuri Urdin';
            break;
        case 'CH JACA':
            name = 'CH Jaca';
            break;
        case 'BARÇA HOQUEI GEL':
            name = 'FC Barcelona';
            break;
    }
    return name;
}

function getLocation(location) {
    switch (location) {
        case 'MAJADAHONDA':
            location = 'Majadahonda';
            break;
        case 'PUIGCERDÀ':
            location = 'Puigcerdà';
            break;
        case 'DONOSTIA-SAN SEBASTIÁN':
            location = 'San Sebastián';
            break;
        case 'JACA':
            location = 'Jaca';
            break;
        case 'BARCELONA':
            location = 'Barcelona';
            break;
    }
    return location;
}
