const request = require('request');
const colors = require('colors');
const xpath = require('xpath');
const dom = require('xmldom').DOMParser;
const path = require("path");
const fs = require('fs');

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
    getNodes: getNodes,
    asyncCustomJSONRequest: asyncCustomJSONRequest,
    createIndexList: createIndexList,
    formatDateIIHF: formatDateIIHF
};

async function asyncGetJSONs(urls, callbackName) {
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
                        if (response.statusCode != 200) {
                            resolve(undefined);
                        } else {
                            if (callbackName) {
                                var regex = new RegExp('^' + callbackName + '\\(|\\);$', 'g');
                                resolve(JSON.parse(body.replace(regex, '')));
                            } else {
                                resolve(JSON.parse(body));
                            }
                        }
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

async function asyncCustomJSONRequest(requestObjects) {
    var promises = [];
    for (var i = 0; i < requestObjects.length; i++) {
        promises.push(new Promise((resolve, reject) => {
            request(requestObjects[i], function (error, response, body) {
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
                    console.log(body);
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
                if (!response) {
                    console.log(error);
                    return;
                } else {
                    var consoleText = response.statusCode + ' - ' + response.request.uri.href;
                }
                if (response.statusCode != 200) {
                    console.log(consoleText.red);
                } else {
                    console.log(consoleText.green);
                }
                if (error) {
                    console.log(error);
                    resolve(null);
                } else {
                    if (response.statusCode && response.statusCode != 200) {
                        resolve(null);
                    }
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
    TSV += '\n';
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
    if (childNodeIndex && nodes[0].childNodes[childNodeIndex]) {
        return nodes[0].childNodes[childNodeIndex].data
    }
    if (path.endsWith('text()')) {
        return nodes[0].data;
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

//https://stackoverflow.com/questions/25460574/find-files-by-extension-html-under-a-folder-in-nodejs
function createIndexList(startPath, filter) {
    if (!fs.existsSync(startPath)) {
        console.log("no dir ", startPath);
        return;
    }

    var files = fs.readdirSync(startPath);
    var html = '<ul>';
    for (var i = 0; i < files.length; i++) {
        var comp = files[i].slice(0, files[i].length - 3);
        html += '<li><a href="http://localhost:3000/tsv/' + comp + '">' + comp + '</li>';
    };
    html += '</ul>'
    return html;
};

function formatDateIIHF(date) {
    var dateArray = date.split('.');
    return [dateArray[2], dateArray[1], dateArray[0]].join('-');
}
