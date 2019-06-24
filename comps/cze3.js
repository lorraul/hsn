var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        //RS
        //https://www.hokej.cz/2-liga/zapasy?t=j15vg7rg4nuslhrfldrk5obpm7gq9zopc1lv0vwe7rf4z10jqvlizd6&matchList-filter-season=2018&matchList-filter-competition=0
        var initUrl = 'https://www.hokej.cz/2-liga/zapasy?t=j15vg7rg4nuslhrfldrk5obpm7gq9zopc1lv0vwe7rf4z10jqvlizd6&matchList-filter-season=2018&matchList-filter-competition=0';

        var gameDoc = await common.asyncGetHTMLs([initUrl]);
        gameDoc = common.stringToDoc(gameDoc[0]);
        var gameRowNodes = common.getNodes(false, '//tr[contains(@class, \'js-preview__link\')]', gameDoc);
        var gameUrls = [];
        gameRowNodes.forEach(function (rowNode) {
            if (!rowNode.childNodes[5].attributes['colspan']) {
                gameUrls.push('https://hokej.cz/zapas/' + rowNode.attributes[0].value.split('/')[2]);
            }
        });

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = true;

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
                competition: 'cze3',
                season: '1819',
                stage: 'RS',
                date: formatDate(common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[18]/div/div[3]/div/div[1]/div/ul/li[2]', gameDoc, 1)),
                team1: common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[18]/div/div[3]/div/div[2]/div[1]/a/h2[1]', gameDoc),
                team2: common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[18]/div/div[3]/div/div[2]/div[3]/a/h2[1]', gameDoc),
                score1: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="snippet-matchOverview-score"]/div/span[1]', gameDoc),
                score2: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="snippet-matchOverview-score"]/div/span[3]', gameDoc),
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

function formatDate(date) {
    var dateArray = date.split(' ')[0].split('.');
    return [dateArray[2], (parseInt(dateArray[1]) + 100).toString().substring(1, 3), (parseInt(dateArray[0]) + 100).toString().substring(1, 3)].join('-');
}
