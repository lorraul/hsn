var request = require('request');
var common = require('../common');

module.exports = {
    getTSV: async function () {

        /*
        1920: 'https://www.hockeyslovakia.sk/sk/stats/matches/738/slovenska-hokejova-liga/match/' + i
        RS 110110-
        
        1819: 'https://stnliga.hockeyslovakia.sk/sk/stats/matches/669/st-nicolaus-1-hokejova-liga/match/' + i + '/stats'
        RS 99950-100236
        PO 100400 - 100456
        POUT 100457 - 100468
        
        1718: https://www.hockeyslovakia.sk/sk/stats/matches/611/st-nicolaus-1-hokejova-liga-sr/match/
        RS 97357-97591
        QF 97592-97606
        SF 97612-97621
        FIN 97622-97625
        
        1617: https://www.hockeyslovakia.sk/sk/stats/matches/575/budis-1-hokejova-liga/match/
        RS 90310-90579
        QF 93386-93405
        SF 93406-93415
        FIN 93416-93418
        
        1516: https://www.hockeyslovakia.sk/sk/stats/matches/542/1-hokejova-liga-sr/match/
        RS 85031-85305
        QF 87387-87405
        SF 87407-87412
        FIN 87417-87421
        
        1415: https://www.hockeyslovakia.sk/sk/stats/matches/471/1-hokejova-liga-sr-1st-senior-league/match/
        RS 78173-78436
        QF 78711-78730
        SF 78731-78740
        FIN 78741-78745
        
        1314: https://www.hockeyslovakia.sk/sk/stats/matches/389/1-hokejova-liga-sr/match/
        RS 69535-69798
        QF 74161-74180
        SF 74364-74373
        FIN 74381-74385
        
        1213: https://www.hockeyslovakia.sk/sk/stats/matches/346/1-hokejova-liga-sr-1st-seniors-league/match/
        RS 63537-63812
        POUT 63813-63824
        QF 63832-63851
        SF 63852-63859
        FIN 63862-63865
        
        1112: https://www.hockeyslovakia.sk/sk/stats/matches/312/1-hokejova-liga-sr-1st-seniors-league/match
        RS 58898-59119
        QR 61775-61864 61903-61912
        QF 62457-62475
        SF 62477-62484
        FIN 62487-62491
        
        1011: https://www.hockeyslovakia.sk/sk/stats/matches/292/1-hokejova-liga-sr-1st-seniors-league/match/
        RS 52118-52804 55199-55504
        QF 52056-52071
        SF 52046-52051
        FIN 52039-52045
        */

        //change here
        var season = '1920';
        var stage = 'RS';

        var gameUrls = [];
        for (var i = 110110; i <= 110400; i++) {
            gameUrls.push('https://www.hockeyslovakia.sk/sk/stats/matches/738/slovenska-hokejova-liga/match/' + i);
        }

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = false;

        gameDocuments.forEach(function (gameDoc, index) {
            if (!gameDoc) {
                return;
            }
            gameDoc = common.stringToDoc(gameDoc);
            var validatorElem = common.getTextFromDoc(useXHTMLNamespace, '/html/body/div[1]/div[4]/div/div[1]/div/div/header/div[2]/div/span[3]', gameDoc, 1);
            var validPage = (validatorElem && validatorElem.trim().length > 0) ? true : false;
            if (!validPage) {
                return;
            }
            var score1 = common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[1]/div[2]/span[1]/span[1]', gameDoc);
            var score2 = common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[1]/div[2]/span[1]/span[2]', gameDoc);
            var scoretypedom = common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[1]/div[2]/span[1]/span[3]', gameDoc);

            var date;
            if (stage == 'RS') {
                date = getFormattedDateSVK2(common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[2]/div/span[1]', gameDoc, 1));
            } else {
                date = getFormattedDateSVK2(common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[2]/div/span[2]', gameDoc, 1));
            }

            var attendance;
            if (stage == 'RS') {
                attendance = common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[2]/div/span[4]', gameDoc, 1);
            } else {
                attendance = common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[2]/div/span[5]', gameDoc, 1);
            }

            var location;
            if (stage == 'RS') {
                location = getLocation(common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[2]/div/span[3]', gameDoc, 1));
            } else {
                location = getLocation(common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[2]/div/span[4]', gameDoc, 1))
            }

            rowObjects.push({
                competition: 'svk2',
                season: season,
                stage: stage, //!!! do not change set stage variable instead (DOM differences between RS and PO)
                date: date,
                team1: getTeamName(common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[1]/div[1]/a', gameDoc).trim()),
                team2: getTeamName(common.getTextFromDoc(useXHTMLNamespace, 'html/body/div[1]/div[4]/div/div[1]/div/div/header/div[1]/div[3]/a', gameDoc).trim()),
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

function getFormattedDateSVK2(rawDate) {
    var dateArray = rawDate.trim().replace(',', '').split(' ')[1].split('.');
    return [dateArray[2], dateArray[1], dateArray[0]].join('-');
}

function getTeamName(name) {
    switch (name) {
        case 'Reprezentácia SR18':
            name = 'Slovakia U18';
            break
        case 'HK ORANGE 20':
            name = 'HK Orange 20';
            break;
        case 'HC PREŠOV':
            name = 'HC Prešov';
            break;
        case 'HK Dukla Ingema Michalovce':
            name = 'HK Dukla Michalovce';
            break;
        case 'HC OSMOS Bratislava':
            name = 'HC Bratislava';
            break;
        case 'HK VITAR Martin':
            name = 'HK Martin';
            break;
        case 'MsHK DOXXbet Žilina':
            name = 'MsHK Žilina';
            break;
        case 'MHK TSS GROUP Dubnica':
            name = 'MHK Dubnica nad Váhom';
            break;
        case 'HK "Gladiators" Trnava':
            name = 'HK Gladiators Trnava';
            break;
        case 'HC 07 DETVA':
            name = 'HC 07 Detva';
            break;
        case 'HC PREŠOV 07 s.r.o.':
            name = 'HC Prešov';
            break;
        case 'HK 95 Považská Bystrica':
            name = 'HK ‘95 Považská Bystrica';
            break;
        case 'Bemaco HC 46 Bardejov':
            name = 'HC 46 Bardejov';
            break;
        case 'ŠHK 37 Piešťany, s.r.o.':
            name = 'SHK 37 Piestany';
            break;
        case 'HK  S.N.Ves':
            name = 'HK Spišská Nová Ves';
            break;
        case 'HC TOPOĽČANY':
            name = 'HC Topoľčany';
            break;
        case 'Hokejový klub Trebišov':
            name = 'HK Trebišov';
            break;
        case 'HK Púchov s.r.o.':
            name = 'HK Púchov';
            break;
        case 'MHk 32 Liptovský Mikuláš, a.s.':
            name = 'MHk 32 Liptovský Mikuláš';
            break;
        case 'reprezentácia SR "18"':
            name = 'Slovakia U18';
            break;
        case 'Hokejový club Dukla Senica':
            name = 'HC Dukla Senica';
            break;
        case 'Hokejový klub Dukla Michalovce':
            name = 'HK Dukla Michalovce';
            break;
        case 'Hokejový klub HK ‘95 Považská Bystrica':
            name = 'HK ‘95 Považská Bystrica';
            break;
        case 'Hokejový klub Spišská Nová Ves':
            name = 'HK Spišská Nová Ves';
            break;
        case 'MšHK Bulldogs Prievidza':
            name = 'MšHK Prievidza';
            break;
        case 'HC 07 DETVA s.r.o.':
            name = 'HC 07 Detva';
            break;
        case 'Reprezentácia SR "18"':
            name = 'Slovakia U18';
            break;
        case 'HK Gladiators TRNAVA':
            name = 'HK Gladiators Trnava';
            break;
        case 'HC 07 ORIN DETVA':
            name = 'HC 07 Detva';
            break;
        case 'HC MIKRON Nové Zámky':
            name = 'HC Nové Zámky';
            break;
        case 'MHK Bemaco Humenné':
            name = 'MHK Humenné';
            break;
        case 'PENGUINS Prešov':
            name = 'HC Prešov Penguins';
            break;
        case 'MHC Martin "B"':
            name = 'MHC Martin B';
            break;
        case 'Prešov PENGUINS':
            name = 'HC Prešov Penguins';
            break;
        case 'HC MIKRON Nové Zámky  "B"':
            name = 'MHC Mikron Nové Zámky B';
            break;
        case 'HK Trnava':
            name = 'HK Gladiators Trnava';
            break;
        case 'Dukla Michalovce':
            name = 'HK Dukla Michalovce';
            break;
        case 'PHK 3b Prešov':
            name = 'HC Prešov';
            break;
    }
    return name;
}
