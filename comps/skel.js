var request = require('request');
var common = require('../common');

module.exports = {
    getTSV: async function () {

        /*
        1920: https://www.hockeyslovakia.sk/sk/stats/matches/736/tipsport-liga/match/' + i
        RS 109746-110110
        PR 114000-114020
        QR 114030-114050
        
        1819: https://www.hockeyslovakia.sk/sk/stats/matches/668/tipsport-liga/match/' + i + '/stats
        RS: 101458 - 103433
        qr: 106287 - 106293
        qf: 106297 - 106320
        sf: 106330 - 106345
        fin: 106325 - 106329
        
        1516: https://www.hockeyslovakia.sk/sk/stats/matches/525/extraliga-sr/match/' + i
        RS 83430-83719
        QF 87573-87592
        SF 87625-87634
        FIN 87639-87644
        
        1415: https://www.hockeyslovakia.sk/sk/stats/matches/472/tipsport-extraliga/match/75534
        RS 75534-75803-75823
        QF 82364-82391
        SF 82406-82419
        FIN 82399-82404
        
        1314: https://www.hockeyslovakia.sk/sk/stats/matches/393/tipsport-extraliga/match/68642
        RS 68642-68911
        QF 74244-74266
        SF 74272-74282
        FIN 74286-74292
        
        1213: https://www.hockeyslovakia.sk/sk/stats/matches/345/tipsport-extraliga/match/62820
        RS 62820-63110
        QF 63111-63138
        SF 63139-63151
        FIN 63153-63157
        
        1112: https://www.hockeyslovakia.sk/sk/stats/matches/311/tipsport-extraliga/match/58149
        RS 57879-58158
        QF 58159-58182
        SF 62555-62562
        FIN 62548-62554
        
        1011: https://www.hockeyslovakia.sk/sk/stats/matches/293/slovnaft-extraliga-seniorov-slovnaft-extraleague-senior/match/52805
        RS 52805-53094
        QF 57509-57536
        SF 57537-57550
        FIN 57551-57555
        */
        var gameUrls = [];
        for (var i = 114030; i <= 114050; i++) {
            gameUrls.push('https://www.hockeyslovakia.sk/sk/stats/matches/736/tipsport-liga/match/' + i);
        }

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = false;

        //change here
        var season = '1920';
        var stage = 'QR';

        gameDocuments.forEach(function (gameDoc, index) {
            if (!gameDoc) {
                return;
            }
            gameDoc = common.stringToDoc(gameDoc);
            var validatorElem = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[2]/div/div[3]/div[1]/div/div/div[1]/header/div[1]/div[2]/span[2]/span', gameDoc, 1);

            // /html/body/div[1]/div[4]/div/div[1]/div/div/header/div[2]/div/span[3]

            var validPage = (validatorElem && validatorElem.trim().length > 0) ? true : false;
            if (!validPage) {
                return;
            }
            var score1 = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[2]/div/div[3]/div[1]/div/div/div[1]/header/div[1]/div[2]/span[1]/span[1]', gameDoc);
            var score2 = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[2]/div/div[3]/div[1]/div/div/div[1]/header/div[1]/div[2]/span[1]/span[2]', gameDoc);
            var scoretypedom = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[2]/div/div[3]/div[1]/div/div/div[1]/header/div[1]/div[2]/span[1]/span[3]', gameDoc);

            var date;
            if (stage == 'RS' || stage == 'PR' || stage == 'QR') {
                date = getFormattedDateSKEL(common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[2]/div/div[3]/div[1]/div/div/div[1]/header/div[2]/div/span[1]', gameDoc, 1));
            } else {
                date = getFormattedDateSKEL(common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[2]/div/div[3]/div[1]/div/div/div[1]/header/div[2]/div/span[2]', gameDoc, 1));
            }

            var attendance;
            if (stage == 'RS' || stage == 'PR' || stage == 'QR') {
                attendance = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[2]/div/div[3]/div[1]/div/div/div[1]/header/div[2]/div/span[4]', gameDoc, 1);
            } else {
                attendance = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[2]/div/div[3]/div[1]/div/div/div[1]/header/div[2]/div/span[5]', gameDoc, 1);
            }

            var location;
            if (stage == 'RS' || stage == 'PR' || stage == 'QR') {
                location = getLocation(common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[2]/div/div[3]/div[1]/div/div/div[1]/header/div[2]/div/span[3]', gameDoc, 1));
            } else {
                location = getLocation(common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[2]/div/div[3]/div[1]/div/div/div[1]/header/div[2]/div/span[4]', gameDoc, 1))
            }

            rowObjects.push({
                competition: 'skel',
                season: season,
                stage: stage, //!!! do not change set stage variable instead (DOM differences between RS and PO)
                date: date,
                team1: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[2]/div/div[3]/div[1]/div/div/div[1]/header/div[1]/div[1]/a', gameDoc).trim()),
                team2: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[2]/div/div[3]/div[1]/div/div/div[1]/header/div[1]/div[3]/a', gameDoc).trim()),
                score1: score1,
                score2: score2,
                scoretype: getScoretype(scoretypedom),
                attendance: attendance ? attendance.replace(/\D/g, '') : '',
                location: location,
                source: gameUrls[index]
            });
            console.log('row ' + (index + 1) + ' / ' + gameDocuments.length + ' done');
        });
        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getLocation(locationdomtext) {
    if (locationdomtext == ' _') {
        return '';
    }
    return locationdomtext;
}

function getScoretype(scoretypedom) {
    if (scoretypedom == 'pp') {
        return 'OT'
    }
    if (scoretypedom == 'sn') {
        return 'SO'
    }
    return 'RT'
}

function getFormattedDateSKEL(rawDate) {
    if (!rawDate) return;
    var dateArray = rawDate.trim().replace(',', '').split(' ')[1].split('.');
    return [dateArray[2], dateArray[1], dateArray[0]].join('-');
}

function getTeamName(name) {
    switch (name) {
        case 'HK ORANGE 20':
            name = 'HK Orange 20';
            break;
        case 'MsHK DOXXbet Žilina':
            name = 'MsHK Žilina';
            break;
        case 'HC ‘05 iClinic Banská Bystrica':
            name = 'HC 05 Banská Bystrica';
            break;
        case 'HK DUKLA Trenčín':
            name = 'HK Dukla Trenčín';
            break;
        case 'HC MIKRON Nové Zámky':
            name = 'HC Nové Zámky';
            break;
        case 'DVTK Jegesmedvék Miskolc':
            name = 'DVTK Jegesmedvék';
            break;
        case 'MAC Újbuda':
            name = 'MAC Budapest';
            break;
        case 'HC SLOVAN Bratislava':
            name = 'Slovan Bratislava';
            break;
        case 'HK Dukla Ingema Michalovce':
            name = 'HK Dukla Michalovce';
            break;
        case 'HC 07 WPC Koliba DETVA':
            name = 'HC 07 Detva';
            break;
        case 'HC Košice s.r.o.':
            name = 'HC Košice';
            break;
        case 'HK Nitra, a.s.':
            name = 'HK Nitra';
            break;
        case 'HC ‘05 iClinic BANSKÁ BYSTRICA':
            name = 'HC 05 Banská Bystrica';
            break;
        case 'HK DUKLA Trenčín, a.s.':
            name = 'HK Dukla Trenčín';
            break;
        case 'MHC MOUNTFIELD Martin':
            name = 'MHC Martin';
            break;
        case 'HKM a.s. Zvolen':
            name = 'HKM Zvolen';
            break;
        case 'HK Poprad, s.r.o.':
            name = 'HK Poprad';
            break;
        case 'ŠHK 37 Piešťany, s.r.o.':
            name = 'ŠHK 37 Piešťany';
            break;
        case 'HK 36 Skalica, s.r.o.':
            name = 'HK 36 Skalica';
            break;
        case 'Hokejový klub Nitra':
            name = 'HK Nitra';
            break;
        case 'DUKLA Trenčín':
            name = 'HK Dukla Trenčín';
            break;
        case 'MHC Mountfield Martin':
            name = 'MHC Martin';
            break;
        case 'HC´05 Banská Bystrica':
            name = 'HC 05 Banská Bystrica';
            break;
        case 'Hokejový klub DUKLA Trenčín, a.s.':
            name = 'HK Dukla Trenčín';
            break;
        case 'HC ‘05 BANSKÁ BYSTRICA, a.s.':
            name = 'HC 05 Banská Bystrica';
            break;
        case 'Hokejový klub Nitra, a.s.':
            name = 'HK Nitra';
            break;
        case 'HK POPRAD, s.r.o':
            name = 'HK Poprad';
            break;
        case 'HC Košice  s.r.o.':
            name = 'HC Košice';
            break;
        case 'HC´05 BANSKÁ BYSTRICA, a.s.':
            name = 'HC 05 Banská Bystrica';
            break;
        case 'Dukla Trenčín a.s.':
            name = 'HK Dukla Trenčín';
            break;
        case 'MHC Mountfield':
            name = 'MHC Martin';
            break;
        case 'HK 36 Skalica s.r.o.':
            name = 'HK 36 Skalica';
            break;
        case 'MsHK Žilina, a.s.':
            name = 'MsHK Žilina';
            break;
        case 'HC SLOVAN Bratislava a.s.':
            name = 'Slovan Bratislava';
            break;
        case 'HK ŠKP Poprad':
            name = 'HK Poprad';
            break;
    }
    return name;
}
