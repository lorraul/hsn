var request = require('request');
var common = require('./common');
const parse5 = require('parse5');
const xmlser = require('xmlserializer');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    main: async function () {
        request({
            url: 'https://web.api.digitalshift.ca/partials/stats/schedule/table?order=datetime&all=true&division_id=2055&start_id=g-84883&offset=1&limit=300',
            method: 'GET',
            headers: {
                Authorization: 'ticket="JnYnJc-0IdkfmoA7PeoaV1cBOZZRTF8RMyCno5UaXbSeFgrmS2Ge2Q8godyIYCqxK1mkV_j_fnjmAoJTsfdVPzyt"',
                Origin: 'https://www.federalhockey.com',
                Referer: 'https://web.api.digitalshift.ca/',
            }
        }, function (a, b, c) {
            console.log(a);
            console.log(b);
            console.log(c);
        });
    }
};
