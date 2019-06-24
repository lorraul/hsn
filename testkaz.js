var request = require('request');
var common = require('./common');
const parse5 = require('parse5');
const xmlser = require('xmlserializer');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    main: async function () {
        var initUrl = 'https://icehockey.kz/professional-hockey/tournaments/3/6/calendar.html?page=1&filter-conference=&filter-stage=&filter-command=&filter-date1=&filter-date2=&filter-status=1';

        request({
            uri: initUrl,
            followAllRedirects: true
        }, function (error, response, body) {
            console.log(response);
        });
    }
};
