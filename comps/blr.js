var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {

        var gameUrls = [];
        //221-993
        //40-esével kell venni, hogy a szerver ne kuldjon vissza hibaüzenetet
        for (var i = 960; i < 1000; i++) {
            gameUrls.push('https://www.hockey.by/new-admin/games/' + i + '/?print=protocol');
        }

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        //some requests may return error page with status 200, so check again
        var tryAgainUrls = [];
        gameDocuments.forEach(function (gameDocString, index) {
            if (gameDocString == 'error') {
                tryAgainUrls.push(gameUrls[index]);
                console.error('Error 200 #1: ' + gameUrls[index]);
            }
        });

        if (tryAgainUrls.length > 0) {
            return;
        }

        recursiveGetHTML(gameDocuments, tryAgainUrls);

        async function recursiveGetHTML(gameDocuments, tryAgainUrls) {
            var gameDocuments2 = await common.asyncGetHTMLs(tryAgainUrls);

            var tryAgainUrls2 = [];
            gameDocuments2.forEach(function (gameDocString, index) {
                if (gameDocString == 'error') {
                    tryAgainUrls2.push(tryAgainUrls[index]);
                    console.error('Error 200: ' + tryAgainUrls[index])
                } else {
                    gameDocuments.push(gameDocString);
                }
            });

            recursiveGetHTML(gameDocuments, tryAgainUrls2);
        }

        /*
        var gameDocuments2 = await common.asyncGetHTMLs(tryAgainUrls);

        var tryAgainUrls2 = [];
        gameDocuments2.forEach(function (gameDocString, index) {
            if (gameDocString == 'error') {
                tryAgainUrls2.push(tryAgainUrls[index]);
                console.error('Error 200 #2: ' + tryAgainUrls[index])
            } else {
                gameDocuments.push(gameDocString);
            }
        });

        var gameDocuments3 = await common.asyncGetHTMLs(tryAgainUrls2);

        var tryAgainUrls3 = [];
        gameDocuments3.forEach(function (gameDocString, index) {
            if (gameDocString == 'error') {
                tryAgainUrls3.push(tryAgainUrls2[index]);
                console.error('Error 200 #3: ' + tryAgainUrls2[index])
            } else {
                gameDocuments.push(gameDocString);
            }
        });*/

        var rowObjects = [];
        var useXHTMLNamespace = false;

        /*
        var validUrls = [
            'https://www.hockey.by/new-admin/games/221/?print=protocol',
            'https://www.hockey.by/new-admin/games/223/?print=protocol',
            'https://www.hockey.by/new-admin/games/224/?print=protocol',
            'https://www.hockey.by/new-admin/games/233/?print=protocol',
            'https://www.hockey.by/new-admin/games/234/?print=protocol',
            'https://www.hockey.by/new-admin/games/235/?print=protocol',
            'https://www.hockey.by/new-admin/games/240/?print=protocol',
            'https://www.hockey.by/new-admin/games/241/?print=protocol',
            'https://www.hockey.by/new-admin/games/242/?print=protocol',
            'https://www.hockey.by/new-admin/games/260/?print=protocol',
            'https://www.hockey.by/new-admin/games/261/?print=protocol'
        ];
        
                console.log(gameDocuments.length);
        */

        gameDocuments.forEach(function (gameDocString, index) {
            /*
            if (validUrls.indexOf(gameUrls[index]) != -1) {
                console.log('=======================');
                console.log(gameUrls[index]);
            }*/
            if (!gameDocString) {
                return;
            }
            var gameDoc = common.stringToDoc(gameDocString);
            var competition = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="topinfo"]/tbody/tr[2]/td/table/tr[1]/td[2]', gameDoc);

            /*
                if (validUrls.indexOf(gameUrls[index]) != -1) {
                    console.log(competition);
                    if (!competition) {
                        console.log(gameDocString)
                    }
                }*/

            if (competition != 'Дивизион "А"') {
                return;
            }
            /*
            if (validUrls.indexOf(gameUrls[index]) != -1) {
                console.log('continue');
            }*/
            var score = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/table[4]/tbody/tr/td[1]/div/table/tbody/tr[6]/td[2]', gameDoc).split(':');
            if (score.length != 2) {
                score = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/table[4]/tbody/tr/td[1]/div/table/tbody/tr[5]/td[2]', gameDoc).split(':');
                if (score.length != 2) {
                    score = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/table[4]/tbody/tr/td[1]/div/table/tbody/tr[4]/td[2]', gameDoc).split(':');
                }
            }
            var attendance = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="topinfo"]/tbody/tr[2]/td/table/tr[2]/td[6]', gameDoc);
            var rowObject = {
                competition: 'blr',
                season: '1920',
                stage: 'RS',
                date: formatDate(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="topinfo"]/tbody/tr[2]/td/table/tr[1]/td[4]', gameDoc)),
                team1: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/table[2]/tbody/tr[1]/td[1]/div', gameDoc).trim()),
                team2: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/table[3]/tbody/tr[1]/td[1]/div', gameDoc).trim()),
                score1: score[0],
                score2: score[1],
                scoretype: getScoretype(common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/table[4]/tbody/tr/td[1]/div/table/tbody/tr[4]/td[1]', gameDoc), common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/table[4]/tbody/tr/td[1]/div/table/tbody/tr[5]/td[2]', gameDoc)),
                attendance: attendance ? attendance.trim().replace(/\D/g, '') : '',
                location: getLocation(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="topinfo"]/tbody/tr[2]/td/table/tr[2]/td[2]', gameDoc)),
                source: gameUrls[index]
            };
            rowObjects.push(rowObject);
            console.log('row ' + index + ' / ' + gameDocuments.length + ' done');
        });

        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getScoretype(string1, string2) {
    if (string1 == 'Всего') {
        return 'RT'
    }
    if (string2 == 'SO') {
        return 'SO'
    }
    return 'OT';
}

function getLocation(name) {
    switch (name) {
        case 'Бобруйск-Арена (Bobruisk)':
            name = 'Bobruisk Arena';
            break;
        case 'Дворец спорта г. Витебск':
            name = 'Ice Sports Palace, Vitebsk';
            break;
        case 'Дворец спорта г.Брест':
            name = 'Ice Sports Palace, Brest';
            break;
        case 'Дворец спорта Могилев':
            name = 'Sports Palace, Mogilev';
            break;
        case 'Ледовый дворец спорта г. Могилев':
            name = 'Ice Sports Center, Mogilev';
            break;
        case 'ДС и К Новополоцк':
            name = 'Palace of Sports and Culture';
            break;
        case 'ЛД Барановичи':
            name = 'Ice Sports Palace, Baranavichy';
            break;
        case 'ЛД Пинск':
            name = 'Ice arena of the Universal sports complex Volna';
            break;
        case 'ЛД Солигорск (Soligorsk)':
            name = 'Sports and Entertainment Complex';
            break;
        case 'Спортивно-развлекательный центр г. Солигорск':
            name = 'Sports and Entertainment Complex, Soligorsk';
            break;
        case 'Орша ЛД':
            name = 'Ice Sports Palace, Orsha';
            break;
        case 'Раубичи':
            name = 'Raubichi';
            break;
        case 'Чижовка-Арена':
            name = 'Chizhovka Arena';
            break;
        case 'Heliosarena':
            name = 'Heliosarena';
            break;
        case 'EHC Head Office':
            name = 'EHC Head Office';
            break;
        case 'Ледовый дворец г.Гомель':
            name = 'Ice Palace, Gomel';
            break;
        case 'ЛДС г. Гродно':
            name = 'Ice Sports Palace, Grodno';
            break;
        case 'Ледовый дворец спорта г. Лида':
            name = 'Ice Sports Palace, Grodno';
            break;
        case 'Ледовый дворец спорта г. Гродно':
            name = 'Ice Sports Palace, Grodno';
            break;
        case 'ЛД Металлург (Metallurg)':
            name = 'Ice Palace Metalurh';
            break;
        case 'Ледовый дворец «Металлург»':
            name = 'Ice Palace Metalurh';
            break;
        case 'Ледовый дворец г. Лида':
            name = 'Ice Palace, Lida';
            break;
        case 'ЛД Молодечно':
            name = 'Molodechno';
            break;
        case 'Малая арена Чижовка-Арена':
            name = 'Čyžoŭka-Arena Practice ice rink';
            break;
        case 'Крытый каток п.Горького':
            name = 'Gorky Park ice rink';
            break;
        case 'Крытый каток Раубичи':
            name = 'Raubichi';
            break;
        case 'ЛД Кобрин':
            name = 'Ice Palace, Kobryn';
            break;
        case 'Каток ХК Юность-Минск':
            name = 'Ice Palace Yunost Minsk';
            break;
        case 'ЛД Лиепаяс Металургс':
            name = 'LOC Ledus Halle Liepaja';
            break;
        case 'Ледовая арена Терминал':
            name = 'Ice Arena Terminal';
            break;
        case 'Минский ледовый Дворец спорта':
            name = 'Minsk Ice Palace';
            break;
        case 'ДС Минск':
            name = 'Minsk';
            break;
        case 'Чижовка-арена':
            name = 'Čyžoŭka-Arena';
            break;
        case 'Ледовый дворец г. Молодечно':
            name = 'Ledovyy Dvorets, Maladzyechna';
            break;
        case 'Ледовый дворец г. Гомель':
            name = 'Ice Palace, Gomel';
            break;
        default:
            name = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    };
    return name;
}

function getTeamName(name) {
    switch (name) {
        case 'U18':
            name = 'Belarus U18';
            break;
        case 'U20':
            name = 'Belarus U20';
            break;
        case 'Барановичи':
            name = 'Baranavichy';
            break;
        case 'Бобруйск':
            name = 'Bobruisk';
            break;
        case 'Шинник Бобруйск':
            name = 'Bobruisk';
            break;
        case 'ХК Брест':
            name = 'HK Brest';
            break;
        case 'Брест':
            name = 'HK Brest';
            break;
        case 'Витебск':
            name = 'HK Vitebsk';
            break;
        case 'ХК Витебск':
            name = 'HK Vitebsk';
            break;
        case 'Гомель':
            name = 'HK Gomel';
            break;
        case 'ХК Гомель':
            name = 'HK Gomel';
            break;
        case 'Динамо-Молодечно':
            name = 'Dinamo Molodechno';
            break;
        case 'Лида':
            name = 'HK Lida';
            break;
        case 'ХК Лида':
            name = 'HK Lida';
            break;
        case 'Локомотив-Орша':
            name = 'Lokomotiv Orsha';
            break;
        case 'Металлург-Жлобин':
            name = 'Metallurg Zhlobin';
            break;
        case 'Могилев':
            name = 'HK Mogilev';
            break;
        case 'Могилёв':
            name = 'HK Mogilev';
            break;
        case 'ХК Могилёв':
            name = 'HK Mogilev';
            break;
        case 'Неман':
            name = 'Neman Grodno';
            break;
        case 'Неман Гродно':
            name = 'Neman Grodno';
            break;
        case 'Пинские ястребы':
            name = 'Pinskiye Yastreby';
            break;
        case 'Химик':
            name = 'Khimik Novopolotsk';
            break;
        case 'Химик-СКА Новополоцк':
            name = 'Khimik Novopolotsk';
            break;
        case 'Шахтер Солигорск':
            name = 'Shakhtyor Soligorsk';
            break;
        case 'Шахтер-Солигорск':
            name = 'Shakhtyor Soligorsk';
            break;
        case 'Юность-Минск':
            name = 'Yunost Minsk';
            break;
        case 'Сокол Киев':
            name = 'Sokol Kiev';
            break;
        case 'Лиепаяc Металургc':
            name = 'Liepājas Metalurgs';
            break;
        case 'Динамо U-20':
            name = 'Dinamo U-20';
            break;
        case 'U 20':
            name = 'U20';
            break;
    };
    return name;
}

function formatDate(date) {
    var dateArray = date.split('.');
    return [dateArray[2], dateArray[1], dateArray[0]].join('-');
}
