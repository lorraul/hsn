var request = require('request');
var common = require('./common');
const parse5 = require('parse5');
const xmlser = require('xmlserializer');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;


var main = async function () {
    var gameUrls = [];
    for (var i = 81790; i < 81791; i++) {
        gameUrls.push('https://en.khl.ru/game/851/' + i + '/protocol/');
    }

    var gameDocuments = await common.asyncGetHTMLs(gameUrls); // jshint ignore:line

    var rowObjects = [];
    var useXHTMLNamespace = false;

    gameDocuments.forEach(function (gameDoc, index) {
        if (!gameDoc) {
            return;
        }
        gameDoc = common.stringToDoc(gameDoc);
        var oooo = common.getNodes(useXHTMLNamespace, '//*[@id="wrapper"]/div[2]/div[2]/dl[2]/dt/h3', gameDoc);
        console.log('-------------------');
        console.log(oooo);
        console.log('-------------------');
    });
}
