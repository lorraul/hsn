var request = require('request');

module.exports = {
    asyncGetJSONs: asyncGetJSONs,
    prepareRowObjects: prepareRowObjects,
    createTSV: createTSV,
    getFormattedDate: getFormattedDate
};

async function asyncGetJSONs(urls, callback) {
    var promises = [];
    for (var i = 0; i < urls.length; i++) {
        promises.push(new Promise((resolve, reject) => {
            request(urls[i], function (error, response, body) {
                console.log(response.statusCode + ' - ' + response.request.uri.href);
                if (error) {
                    console.log('error');
                    resolve(null);
                } else {
                    resolve(JSON.parse(body));
                }
            });
        }));
    }

    return Promise.all(promises);
}

function prepareRowObjects(rowObjects) {
    //remove empty lines
    rowObjects = rowObjects.filter(n => n);

    //sort by date
    rowObjects.sort(function (a, b) {
        return new Date(a.date) - new Date(b.date);
    });

    //remove future games games
    rowObjects = rowObjects.filter(function (game) {
        return (new Date(game.date)) < (new Date().setDate((new Date()).getDate() - 1));
    });

    return rowObjects;
}

function createTSV(rowObjects) {
    var TSV = '<pre>';
    rowObjects.forEach(function (rowObject) {
        var rowString = ['', rowObject.competition, rowObject.season, rowObject.stage, rowObject.date, rowObject.team1, rowObject.team2, rowObject.score1, rowObject.score2, rowObject.attendance, rowObject.location, rowObject.source, rowObject.alt, rowObject.note].join('\t') + '\n';
        TSV += rowString;
    });
    TSV += '</pre>';
    return TSV;
}

function getFormattedDate(dateString) {
    var dateObject = new Date(dateString);
    return [dateObject.getFullYear(), (dateObject.getMonth() + 101).toString().substring(1, 3), (dateObject.getDate() + 100).toString().substring(1, 3)].join('-');
}
