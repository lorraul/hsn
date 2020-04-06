var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        //RS: http://liiga.fi/fi/ottelut/2018-2019/runkosarja/
        //PO: https://liiga.fi/fi/ottelut/2018-2019/playoffs/
        var initUrl = 'https://liiga.fi/fi/ottelut/2019-2020/runkosarja/';

        var gameDoc = await common.asyncGetHTMLs([initUrl]);
        gameDoc = common.stringToDoc(gameDoc[0]);
        var useXHTMLNamespace = false;
        var gameRowNodes = common.getNodes(useXHTMLNamespace, '//tr[contains(@data-time, \'20\')]', gameDoc);

        var rowObjects = [];
        gameRowNodes.forEach(function (rowNode) {
            var teams = rowNode.childNodes[7].childNodes[1].firstChild.data.trim().split('-');
            var score = rowNode.childNodes[11].firstChild.data.trim().split('&mdash;');
            var link = rowNode.childNodes[9].childNodes[5].attributes[0].nodeValue;
            var scoretype = rowNode.childNodes[13].firstChild.data;
            var att = rowNode.childNodes[15].firstChild.data;
            rowObjects.push({
                competition: 'sml',
                season: '1920',
                stage: 'RS',
                date: getFormattedDateSML(rowNode.attributes[0].value),
                team1: getTeamName(teams[0].replace(/\W/g, '')),
                team2: getTeamName(teams[1].replace(/\W/g, '')),
                score1: score[0],
                score2: score[1],
                scoretype: getScoreType(scoretype),
                attendance: att.replace(/\D/g, ''),
                location: '',
                source: 'https://liiga.fi' + link
            });
        });
        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getScoreType(scoretype) {
    if (scoretype.indexOf('VL') != -1) {
        return 'SO';
    } else if (scoretype.indexOf('JA') != -1) {
        return 'OT';
    }
    return 'RT';
}

function getTeamName(name) {
    switch (name) {
        case 'JYP':
            name = 'JYP Jyväskylä';
            break;
        case 'HIFK':
            name = 'IFK Helsinki';
            break;
        case 'Lukko':
            name = 'Lukko Rauma';
            break;
        case 'sst':
            name = 'Ässät';
            break;
        case 'Sport':
            name = 'Vaasan Sport';
            break;
        case 'Pelicans':
            name = 'Lahti Pelicans';
            break;
        case 'Tappara':
            name = 'Tappara Tampere';
            break;
        case 'TPS':
            name = 'TPS Turku';
            break;
        case 'Krpt':
            name = 'Kärpät Oulu';
            break;
    }
    return name;
}

function getFormattedDateSML(rawDate) {
    return [rawDate.substring(0, 4), rawDate.substring(4, 6), rawDate.substring(6, 8)].join('-')
}
