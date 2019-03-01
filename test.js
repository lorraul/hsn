var request = require('request');
var common = require('./common');
const parse5 = require('parse5');
const xmlser = require('xmlserializer');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    main: async function () {
        var initUrl = 'http://stats.swehockey.se/Game/Events/393666';
        var gameDoc = await common.asyncGetHTMLs([initUrl]);
        gameDoc = common.stringToDoc(gameDoc[0]);
        var useXHTMLNamespace = false;
        var comp = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="groupStandingResultContent"]/table/tr[1]/td/table/tr/td/table/tr[2]/td[2]/h3', gameDoc);

        console.log(comp);
    }
};
