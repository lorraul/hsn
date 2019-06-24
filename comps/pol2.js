var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        //rs
        //var initUrl = 'http://www.polskahokejliga.pl/1liga';
        //po
        var initUrl = 'http://www.polskahokejliga.pl/1liga';

        var gameListDocument = await common.asyncGetHTMLs([initUrl]);

        const doc = new dom({
            errorHandler: {
                warning: (msg) => {},
                error: (msg) => {},
                fatalError: (msg) => {
                    console.log(msg.red)
                },
            },
        }).parseFromString(gameListDocument[0]);
        const nodes = xpath.select('//td[contains(@class, \'text-center\')]', doc);
        var gameUrls = [];
        nodes.forEach(function (node, index) {
            gameUrls.push('http://www.polskahokejliga.pl' + node.childNodes[1].attributes[0].value);
        });

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = false;
        gameDocuments.forEach(function (gameDoc, index) {
            if (!gameDoc) {
                return;
            }
            gameDoc = common.stringToDoc(gameDoc);
            var score12 = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="page-top"]/section[1]/div/div[1]/div[2]/h1', gameDoc);
            var attendance = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="page-top"]/section[1]/div/div[2]/div/div/ul/li[12]/h4', gameDoc);
            rowObjects.push({
                competition: 'pol2',
                season: '1819',
                stage: 'RS',
                date: getFormattedDatePHL(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="page-top"]/section[1]/div/div[2]/div/div/ul/li[6]/h4', gameDoc)),
                team1: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="page-top"]/section[1]/div/div[1]/div[1]/h2/strong/a', gameDoc)),
                team2: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="page-top"]/section[1]/div/div[1]/div[3]/h2/strong/a', gameDoc)),
                score1: score12.split(':')[0].replace(/\D/g, ''),
                score2: score12.split(':')[1].replace(/\D/g, ''),
                attendance: attendance ? attendance.replace(/\D/g, '') : '',
                location: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="page-top"]/section[1]/div/div[2]/div/div/ul/li[9]/h4', gameDoc),
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
        case 'Kadra PZHL U23':
            name = 'SMS PZHL Katowice';
            break;
        case 'Tauron KH GKS Katowice':
            name = 'KH GKS Katowice';
            break;
        case 'TMH Polonia Bytom':
            name = 'Polonia Bytom';
            break;
        case 'Węglokoks Kraj Polonia Bytom':
            name = 'Polonia Bytom';
            break;
        case 'KS Unia Oświęcim':
            name = 'Unia Oświęcim';
            break;
        case 'PGE Orlik Opole':
            name = 'Orlik Opole';
            break;
        case 'TatrySki Podhale Nowy Targ':
            name = 'Podhale Nowy Targ';
            break;
        case 'KH Energa Toruń':
            name = 'KS Toruń';
            break;
        case 'Academy 1928 KTH Krynica':
            name = 'Academy 1928 KTH';
            break;
        case 'Naprzód Janów Katowice':
            name = 'Naprzód Janów';
            break;
        case 'PTH Koziołki Poznań':
            name = 'Hokej Poznań';
            break;
    }
    return name;
}

function getFormattedDatePHL(rawDate) {
    rawDate = rawDate.split('.');
    return [rawDate[2], rawDate[1], rawDate[0]].join('-');
}
