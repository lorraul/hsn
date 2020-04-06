var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {

        //1920 RS: https://hokej.cz/tipsport-extraliga/zapasy?matchList-filter-season=2019&matchList-filter-competition=6475&matchList-view-displayAll=1

        var initUrl = 'https://hokej.cz/tipsport-extraliga/zapasy?matchList-filter-season=2019&matchList-filter-competition=6619';

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
        const nodes = xpath.select('//tr[contains(@class, \'js-preview__link\')]', doc);
        var gameUrls = [];
        nodes.forEach(function (node, index) {
            gameUrls.push('https://hokej.cz/zapas/' + nodes[index].attributes[0].value.split('/')[2]);
        });

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = false;
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
                competition: 'czel',
                season: '1920',
                stage: 'PO',
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

function getTeamName(name) {
    switch (name) {
        case 'Aukro Berani Zlín':
            name = 'HC Zlín';
            break;
        case 'HC Dynamo Pardubice':
            name = 'Dynamo Pardubice';
            break;
        case 'HC Dukla Jihlava':
            name = 'Dukla Jihlava';
            break;
        case 'HC Kometa Brno':
            name = 'Kometa Brno';
            break;
        case 'HC Oceláři Třinec':
            name = 'Oceláři Třinec';
            break;
        case 'HC Škoda Plzeň':
            name = 'HC Plzeň';
            break;
        case 'HC Sparta Praha':
            name = 'Sparta Praha';
            break;
        case 'HC VÍTKOVICE RIDERA':
            name = 'HC Vítkovice';
            break;
        case 'HC VERVA Litvínov':
            name = 'HC Litvínov';
            break;
        case 'Mountfield HK':
            name = 'HK Hradec Králové';
            break;
        case 'HC Energie Karlovy Vary':
            name = 'HC Karlovy Vary';
            break;
        case 'PSG Berani Zlín':
            name = 'HC Zlín';
            break;
    }
    return name;
}

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
