const request = require('request');
const colors = require('colors');
const xpath = require('xpath');
const dom = require('xmldom').DOMParser;

module.exports = {
    asyncGetJSONs: asyncGetJSONs,
    asyncGetHTMLs: asyncGetHTMLs,
    prepareRowObjects: prepareRowObjects,
    createTSV: createTSV,
    getFormattedDate: getFormattedDate,
    getTextFor: getTextFor,
    getTextFromDoc: getTextFromDoc,
    digitsOnly: digitsOnly,
    stringToDoc: stringToDoc,
    getNodes: getNodes
};

async function asyncGetJSONs(urls, callback) {
    var promises = [];
    for (var i = 0; i < urls.length; i++) {
        promises.push(new Promise((resolve, reject) => {
            request(urls[i], function (error, response, body) {
                var consoleText = response.statusCode + ' - ' + response.request.uri.href;
                if (response.statusCode != 200) {
                    console.log(consoleText.red);
                } else {
                    console.log(consoleText.green);
                }
                if (error) {
                    console.log('error');
                    resolve(null);
                } else {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        console.log(e);
                        resolve(undefined);
                    }
                }
            });
        }));
    }

    return Promise.all(promises).then(function (resolvedPromises) {
        console.log('Done');
        return resolvedPromises;
    }, function (error) {
        console.log('Error(s) while scraping!'.red);
    });
}

async function asyncGetHTMLs(urls, callback) {
    var promises = [];
    for (var i = 0; i < urls.length; i++) {
        promises.push(new Promise((resolve, reject) => {
            request(urls[i], function (error, response, body) {
                var consoleText = response.statusCode + ' - ' + response.request.uri.href;
                if (response.statusCode != 200) {
                    console.log(consoleText.red);
                } else {
                    console.log(consoleText.green);
                }
                if (error) {
                    console.log('error');
                    resolve(null);
                } else {
                    resolve(body);
                }
            });
        }));
    }

    return Promise.all(promises).then(function (resolvedPromises) {
        console.log('Done');
        return resolvedPromises;
    }, function (error) {
        console.log('Error(s) while scraping!'.red);
    });
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

function getTextFor(useXHTMLNamespace, path, xmlString, childNodeIndex) {
    const doc = new dom({
        errorHandler: {
            warning: (msg) => {},
            error: (msg) => {},
            fatalError: (msg) => {
                console.log(msg.red)
            },
        },
    }).parseFromString(xmlString);
    var nodes;
    if (useXHTMLNamespace) {
        const select = xpath.useNamespaces({
            "x": "http://www.w3.org/1999/xhtml"
        });
        nodes = select(path, doc);
    } else {
        nodes = xpath.select(path, doc);
    }
    if (nodes.length === 0) {
        return '';
    }
    if (childNodeIndex) {
        return nodes[0].childNodes[childNodeIndex].data
    }
    if (nodes[0].firstChild) {
        return nodes[0].firstChild.data;
    }
    return null;
}

function stringToDoc(xmlString) {
    var doc = new dom({
        errorHandler: {
            warning: (msg) => {},
            error: (msg) => {},
            fatalError: (msg) => {
                console.log(msg.red)
            },
        },
    }).parseFromString(xmlString);
    return doc;
}

function getTextFromDoc(useXHTMLNamespace, path, doc, childNodeIndex) {
    var nodes;
    if (useXHTMLNamespace) {
        const select = xpath.useNamespaces({
            "x": "http://www.w3.org/1999/xhtml"
        });
        nodes = select(path, doc);
    } else {
        nodes = xpath.select(path, doc);
    }
    if (nodes.length === 0) {
        return '';
    }
    if (childNodeIndex) {
        return nodes[0].childNodes[childNodeIndex].data
    }
    if (nodes[0].firstChild) {
        return nodes[0].firstChild.data;
    }
    return null;
}

function digitsOnly(text) {
    return text ? text.replace(/\D/g, '') : '';
}

function getNodes(useXHTMLNamespace, path, doc) {
    var nodes;
    if (useXHTMLNamespace) {
        const select = xpath.useNamespaces({
            "x": "http://www.w3.org/1999/xhtml"
        });
        nodes = select(path, doc);
    } else {
        nodes = xpath.select(path, doc);
    }
    return nodes;
}
