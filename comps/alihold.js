var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {

        /*
        1617
        RS: 27 1-216
        PO: 28 1-19
        
        1516
        RS: 25 1-216
        PO: 26 1-21
        
        1415
        RS: 23 1-215
        PO: 24 1-16
        
        1314
        RS: 21 1-168
        PO: 22 1-14
        
        1213
        RS: 19 1-147
        PO: 20 1-14
        
        1112
        RS: 17 1-126
        PO: 18 1-14
        
        1011
        RS: 15 1-126
        PO: 16 1-10
        */


        var gameUrls = [];
        var gameStageId = '16';

        for (var i = 1; i <= 10; i++) {
            gameUrls.push('http://www.alhockey.com/popup/' + gameStageId + '/game/prompt' + i + '.html');
        }

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = false;
        gameDocuments.forEach(function (urlDoc, index) {
            if (!urlDoc) {
                return;
            }
            urlDoc = common.stringToDoc(urlDoc);
            var scoretype;
            if (common.getTextFromDoc(useXHTMLNamespace, '//table/tr/td/table[2]/tr[4]/td', urlDoc) === '-') {
                scoretype = 'RT';
            } else if (common.getTextFromDoc(useXHTMLNamespace, '//table/tr/td/table[2]/tr[5]/td', urlDoc) === '-') {
                scoretype = 'OT';
            } else {
                scoretype = 'SO';
            }
            rowObjects.push({
                competition: 'alih',
                season: '1011',
                stage: 'PO',
                date: getFormattedDateAL(common.getTextFromDoc(useXHTMLNamespace, '//table/tr/td/table[1]/tr/th', urlDoc)),
                team1: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '//table/tr/td/table[2]/tr[1]/td[1]/span', urlDoc)),
                team2: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '//table/tr/td/table[2]/tr[1]/td[5]/span', urlDoc)),
                score1: common.getTextFromDoc(useXHTMLNamespace, '//table/tr/td/table[2]/tr[1]/td[2]', urlDoc),
                score2: common.getTextFromDoc(useXHTMLNamespace, '//table/tr/td/table[2]/tr[1]/td[4]', urlDoc),
                scoretype: scoretype,
                attendance: common.digitsOnly(common.getTextFromDoc(useXHTMLNamespace, '//table/tr/td/table[1]/tr/th', urlDoc, 4)),
                location: getLocationAL(common.getTextFromDoc(useXHTMLNamespace, '//table/tr/td/table[1]/tr/th', urlDoc, 2)),
                source: 'http://www.alhockey.com/sheet/' + gameStageId + '/game/ogs' + (index + 1) + '.html'
            });
            console.log('row ' + index + ' / ' + gameDocuments.length + ' done');
        });
        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getScoreType() {

}

function getTeamName(name) {
    var name = name.toLowerCase().split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');
    switch (name) {
        case 'Sakhalin':
            name = 'PSK Sakhalin';
            break;
        case 'High1 Icehockey Team':
            name = 'Gangwon High1';
            break;
    }
    return name;
}

function getFormattedDateAL(datestring) {
    var datearray = datestring.split(',');
    var year = '20' + datearray[1]
    datestring = datearray[0] + ', ' + year;
    return common.getFormattedDate(datestring);
}

function getLocationAL(locationString) {
    var stringtoarray = locationString.split(' ');
    return stringtoarray[1];
}
