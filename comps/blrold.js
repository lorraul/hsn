var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        var initUrl = 'http://extraliga.stats.pointstreak.com/leagueschedule.html?leagueid=684&seasonid=19199';

        var gameDoc = await common.asyncGetHTMLs([initUrl]);
        gameDoc = common.stringToDoc(gameDoc[0]);
        var gameRowNodes = common.getNodes(false, '//td[contains(@align, \'center\')]', gameDoc);
        var gameUrls = [];
        gameRowNodes.forEach(function (rowNode) {
            if (rowNode.childNodes.length !== 5) return;
            //if (gameUrls.length > 50) return;
            gameUrls.push('http://extraliga.stats.pointstreak.com/' + rowNode.childNodes[1].attributes[0].value);
        });

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = true;

        gameDocuments.forEach(function (gameDoc, index) {
            if (!gameDoc) {
                return;
            }
            gameDoc = common.stringToDoc(gameDoc);
            var score = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="summary"]/x:tr[2]/x:td[1]/x:table/x:tr[7]/x:td[2]', gameDoc).split(':');
            if (score.length != 2) {
                score = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="summary"]/x:tr[2]/x:td[1]/x:table/x:tr[6]/x:td[2]', gameDoc).split(':');
                if (score.length != 2) {
                    score = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="summary"]/x:tr[2]/x:td[1]/x:table/x:tr[5]/x:td[2]', gameDoc).split(':');
                }
            }
            rowObjects.push({
                competition: 'blr',
                season: '1920',
                stage: 'RS',
                date: formatDate(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="topinfo"]/x:tr[2]/x:td/x:table/x:tr/x:td[6]', gameDoc)),
                team1: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '/x:html/x:body/x:table[2]/x:tr[1]/x:td[1]/x:table[1]/x:tr/x:td[2]/x:strong', gameDoc).trim()),
                team2: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '/x:html/x:body/x:table[3]/x:tr[1]/x:td[1]/x:table[1]/x:tr/x:td[2]/x:strong', gameDoc).trim()),
                score1: score[0],
                score2: score[1],
                scoretype: '',
                attendance: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="topinfo"]/x:tr[2]/x:td/x:table/x:tr/x:td[10]', gameDoc).trim().replace(/\D/g, ''),
                location: getLocation(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="topinfo"]/x:tr[2]/x:td/x:table/x:tr/x:td[4]', gameDoc)),
                source: gameUrls[index]
            });
            console.log('row ' + index + ' / ' + gameDocuments.length + ' done');
        });

        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

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
        case 'ЛД Металлург (Metallurg)':
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
