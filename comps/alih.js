var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        var gameUrls = [];
        //RS 1-136
        for (var i = 1; i < 17; i++) {
            //RS: 31
            //i: 1-136
            //PO: 32
            //i: 1-17
            gameUrls.push('http://www.alhockey.com/popup/32/game/prompt' + i + '.html');
        }

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = false;
        gameDocuments.forEach(function (urlDoc, index) {
            if (!urlDoc) {
                return;
            }
            urlDoc = common.stringToDoc(urlDoc);
            rowObjects.push({
                competition: 'alih',
                season: '1819',
                stage: 'PO',
                date: getFormattedDateAL(common.getTextFromDoc(useXHTMLNamespace, '//table/tr/td/table[1]/tr/th', urlDoc)),
                team1: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '//table/tr/td/table[2]/tr[1]/td[1]/span', urlDoc)),
                team2: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '//table/tr/td/table[2]/tr[1]/td[5]/span', urlDoc)),
                score1: common.getTextFromDoc(useXHTMLNamespace, '//table/tr/td/table[2]/tr[1]/td[2]', urlDoc),
                score2: common.getTextFromDoc(useXHTMLNamespace, '//table/tr/td/table[2]/tr[1]/td[4]', urlDoc),
                attendance: common.digitsOnly(common.getTextFromDoc(useXHTMLNamespace, '//table/tr/td/table[1]/tr/th', urlDoc, 4)),
                location: getLocationAL(common.getTextFromDoc(useXHTMLNamespace, '//table/tr/td/table[1]/tr/th', urlDoc, 2)),
                source: 'http://www.alhockey.com/sheet/32/game/ogs' + (index + 1) + '.html'
            });
            console.log('row ' + index + ' / ' + gameDocuments.length + ' done');
        });
        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

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
