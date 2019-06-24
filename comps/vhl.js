var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        var gameUrls = [];
        //RS
        //74000-74800
        //http://www.vhlru.ru/report/704/?idgame=
        //PO
        //80900-81710
        //http://www.vhlru.ru/report/707/?idgame=
        for (var i = 81600; i < 81710; i++) {
            gameUrls.push('http://www.vhlru.ru/report/707/?idgame=' + i);
        }

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        gameDocuments.forEach(function (gameDoc, index) {
            if (!gameDoc) {
                return;
            }
            gameDoc = common.stringToDoc(gameDoc);
            useXHTMLNamespace = true;
            var date = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="content"]/x:div[1]/x:div[2]/x:p[1]', gameDoc);
            if (!date) {
                return;
            }
            var team11 = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="content"]/x:div[1]/x:table[1]/x:tr[1]/x:td[1]/x:a[1]', gameDoc);
            var team12 = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="content"]/x:div[1]/x:table[1]/x:tr[1]/x:td[1]/x:div/x:strong', gameDoc);
            var team21 = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="content"]/x:div[1]/x:table[1]/x:tr[1]/x:td[3]/x:a[1]', gameDoc);
            var team22 = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="content"]/x:div[1]/x:table[1]/x:tr[1]/x:td[3]/x:div/x:strong', gameDoc);
            var score12 = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="content"]/x:div[1]/x:table[1]/x:tr[1]/x:td[2]/x:p/x:span', gameDoc);
            var attendance = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="content"]/x:div[1]/x:div[2]/x:p[2]', gameDoc);
            rowObjects.push({
                competition: 'vhl',
                season: '1819',
                stage: 'PO',
                date: getFormattedDateVHL(date),
                team1: getTeamName(team11, team12),
                team2: getTeamName(team21, team22),
                score1: score12.split(':')[0].replace(/\D/g, ''),
                score2: score12.split(':')[1].replace(/\D/g, ''),
                attendance: attendance ? attendance.replace(/\D/g, '') : '',
                location: '',
                source: gameUrls[index]
            });
            console.log('row ' + index + ' / ' + gameDocuments.length + ' done');
        });
        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getTeamName(name1, name2) {
    var name = name1 + ' ' + name2;
    switch (name) {
        case 'Динамо СПб (Санкт-Петербург)':
            name = 'Dynamo St. Petersburg';
            break;
        case 'СКА-Нева (Санкт-Петербург)':
            name = 'SKA-Neva St. Petersburg';
            break;
        case 'Ермак (Ангарск)':
            name = 'Yermak Angarsk';
            break;
        case 'ХК Тамбов (Тамбов)':
            name = 'HK Tambov';
            break;
        case 'Челмет (Челябинск)':
            name = 'Chelmet Chelyabinsk';
            break;
        case 'Молот-Прикамье (Пермь)':
            name = 'Molot-Prikamie Perm';
            break;
        case 'Рубин (Тюмень)':
            name = 'Rubin Tyumen';
            break;
        case 'Торос (Нефтекамск)':
            name = 'Toros Neftekamsk';
            break;
        case 'Сарыарка (Караганда)':
            name = 'Saryarka Karaganda';
            break;
        case 'ЦСК ВВС (Самара)':
            name = 'CSK VVS Samara';
            break;
        case 'Буран (Воронеж)':
            name = 'Buran Voronezh';
            break;
        case 'Дизель (Пенза)':
            name = 'Dizel Penza';
            break;
        case 'Барс (Казань)':
            name = 'Bars Kazan';
            break;
        case 'Ижсталь (Ижевск)':
            name = 'Izhstal Izhevsk';
            break;
        case 'Сокол Кр (Красноярск)':
            name = 'Sokol Krasnoyarsk';
            break;
        case 'Звезда (Москва)':
            name = 'Zvezda Moskva';
            break;
        case 'Химик Вс (Воскресенск)':
            name = 'Khimik Voskresensk';
            break;
        case 'Металлург Нк (Новокузнецк)':
            name = 'Metallurg Novokuznetsk';
            break;
        case 'Нефтяник Ал (Альметьевск)':
            name = 'Neftyanik Almetievsk';
            break;
        case 'Лада (Тольятти)':
            name = 'Lada Togliatti';
            break;
        case 'Зауралье (Курган)':
            name = 'Zauralie Kurgan';
            break;
        case 'Ценг Тоу (Цзилинь)':
            name = 'Tsen Tou Jilin';
            break;
        case 'Югра (Ханты-Мансийск)':
            name = 'Yugra Khanty-Mansiysk';
            break;
        case 'Торпедо У-К (Усть-Каменогорск)':
            name = 'Torpedo Ust-Kamenogorsk';
            break;
        case 'ХК Рязань (Рязань)':
            name = 'HK Ryazan';
            break;
        case 'Горняк (Учалы)':
            name = 'Gornyak Uchaly';
            break;
        case 'Южный Урал (Орск)':
            name = 'Yuzhny Ural Orsk';
            break;
        case 'КРС-ОЭРДЖИ (Пекин)':
            name = 'KRS Heilongjiang';
            break;
        case 'ХК Саров (Саров)':
            name = 'HK Sarov';
            break;
    }
    return name;
}
/*
    function getTextFor(xpath, doc, childNodeIndex) {
        return doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().childNodes[(childNodeIndex || 0)].nodeValue;
    };
*/
function getFormattedDateVHL(rawDate) {
    rawDate = rawDate.split(', ')[0].split('. ')[1].split(' ');
    return [rawDate[2], getMonthNr(rawDate[1]), rawDate[0]].join('-');
}

function getMonthNr(month) {
    var months = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
    return (months.indexOf(month.toLowerCase()) + 101).toString().substring(1, 3);
}
