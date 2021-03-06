var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        //rs
        //var gameIds = ["3344264", "3344302", "3344265", "3344303", "3344306", "3344305", "3344308", "3344307", "3344304", "3344310", "3344309", "3344313", "3344312", "3344311", "3344314", "3344266", "3344315", "3344317", "3344318", "3344316", "3344267", "3344319", "3344321", "3344320", "3344322", "3344268", "3344323", "3344325", "3344324", "3344330", "3344328", "3344329", "3344326", "3344327", "3344269", "3344334", "3344331", "3344332", "3344333", "3344335", "3344336", "3344270", "3344339", "3344338", "3344340", "3344337", "3344271", "3344343", "3344342", "3344341", "3344344", "3344345", "3344272", "3344346", "3344350", "3344349", "3344351", "3344347", "3344348", "3344273", "3344354", "3344353", "3344352", "3344355", "3344356", "3344361", "3344360", "3344358", "3344359", "3344357", "3344364", "3344363", "3344362", "3344365", "3344367", "3344368", "3344373", "3344369", "3344370", "3344372", "3344371", "3344377", "3344374", "3344376", "3344375", "3344378", "3344366", "3344380", "3344383", "3344382", "3344381", "3344379", "3344387", "3344386", "3344384", "3344385", "3344388", "3344389", "3344392", "3344393", "3344390", "3344394", "3344391", "3344398", "3344399", "3344396", "3344397", "3344395", "3344400", "3344402", "3344401", "3344405", "3344406", "3344403", "3344407", "3344404", "3344411", "3344410", "3344409", "3344412", "3344408", "3344414", "3344413", "3344419", "3344417", "3344418", "3344416", "3344415", "3344422", "3344420", "3344421", "3344423", "3344424", "3344425", "3344426", "3344428", "3344429", "3344427", "3344432", "3344431", "3344430", "3344433", "3344438", "3344436", "3344437", "3344434", "3344435", "3344442", "3344439", "3344441", "3344443", "3344440", "3344444", "3344445", "3344447", "3344446", "3344448", "3344449", "3344450", "3344451", "3344452", "3344453", "3344454", "3344456", "3344455", "3344457", "3344459", "3344461", "3344458", "3344460", "3344462", "3344463", "3344464", "3344467", "3344466", "3344465", "3344469", "3344468", "3344471", "3344472", "3344470", "3344476", "3344475", "3344474", "3344477", "3344473", "3344478", "3344479", "3344483", "3344481", "3344480", "3344482", "3344484", "3344485", "3344489", "3344486", "3344488", "3344487", "3344490", "3344491", "3344494", "3344495", "3344492", "3344493", "3344496", "3344497", "3344501", "3344500", "3344499", "3344498", "3344502", "3344503", "3344507", "3344508", "3344504", "3344506", "3344505", "3344509", "3344512", "3344511", "3344513", "3344510", "3344514", "3344517", "3344519", "3344518", "3344516", "3344515", "3344524", "3344521", "3344520", "3344523", "3344522", "3344525", "3344527", "3344526", "3344529", "3344530", "3344528", "3344533", "3344532", "3344535", "3344531", "3344534", "3344537", "3344536", "3344539", "3344538", "3344540", "3344541", "3344543", "3344544", "3344545", "3344542", "3344546", "3344548", "3344547", "3344549", "3344550", "3344552", "3344555", "3344553", "3344554", "3344551", "3344560", "3344556", "3344557", "3344558", "3344559", "3344561", "3344562", "3344563", "3344565", "3344564", "3344567", "3344566", "3344568", "3344569", "3344570", "3344572", "3344574", "3344571", "3344573", "3344575", "3344579", "3344577", "3344578", "3344576", "3344581", "3344580", "3344582", "3344583", "3344586", "3344587", "3344584", "3344585", "3344588", "3344589", "3344591", "3344590", "3344592", "3344593", "3344594", "3344599", "3344598", "3344596", "3344597", "3344595", "3344603", "3344600", "3344602", "3344601"];
        //po
        /*var gameIds = ["3435256", "3435257", "3435258", "3435259"];
        gameIds = gameIds.concat(["3436787", "3436788", "3436789", "3436790"]);
        gameIds = gameIds.concat(["3434843", "3434844", "3434845"]);*/
        /*
        for (var i = 0; i < gameIds.length; i++) {
            gameUrls.push('http://stats.pointstreak.com/iihfgamesheet.html?gameid=' + gameIds[i]);
        }*/

        var initUrl = 'https://www.eliteleague.co.uk/schedule?id_season=2&id_team=0&id_month=999';

        var gameDoc = await common.asyncGetHTMLs([initUrl]);
        gameDoc = common.stringToDoc(gameDoc[0]);
        var gameRowNodes = common.getNodes(false, '//a[contains(@class, \'font-size-small font-weight-bold\')]', gameDoc);
        var gameUrls = [];
        [gameRowNodes[0]].forEach(function (node, index) {
            gameUrls.push('https://www.eliteleague.co.uk' + node.attributes[0].value);
        });

        //for test
        //var gameDocuments1 = await common.asyncGetHTMLs(['https://www.eliteleague.co.uk/game/648-car-gla', 'https://www.eliteleague.co.uk/game/647-man-bel', 'https://www.eliteleague.co.uk/game/710-not-gla']);
        var gameDocuments1 = await common.asyncGetHTMLs(gameUrls);

        var sheetUrls = [];

        gameDocuments1.forEach(function (urlDoc, index) {
            if (!urlDoc) {
                return;
            }
            urlDoc = common.stringToDoc(urlDoc);

            var gameSheetNode = common.getNodes(false, '//*[@id="start-of-content"]/div/article/div[2]/div/a[5]', urlDoc);
            if (!gameSheetNode[0]) {
                return;
            }
            sheetUrls.push(gameSheetNode[0].attributes[1].value);
        });

        var rowObjects = [];
        var useXHTMLNamespace = false;

        //server not responding, get data from the previous pages
        var gameDocuments2 = await common.asyncGetHTMLs(sheetUrls);

        gameDocuments2.forEach(function (urlDoc, index) {
            if (!urlDoc) {
                return;
            }
            urlDoc = common.stringToDoc(urlDoc);

            var date = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="topinfo"]/tr/td[6]', urlDoc);
            if (date == null) {
                return;
            }
            var score = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="summary"]/tr[2]/td[1]/table/tr[5]/td[2]', urlDoc);
            if (score.length != 2) {
                score = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="summary"]/tr[2]/td[1]/table/tr[6]/td[2]', urlDoc).split(':');
                if (score.length != 2) {
                    score = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="summary"]/tr[2]/td[1]/table/tr[5]/td[2]', urlDoc).split(':');
                }
            }
            var attendance = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="topinfo"]/tr/td[10]', urlDoc);

            rowObjects.push({
                competition: 'eihl',
                season: '1920',
                stage: 'RS',
                date: getFormattedDate(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="topinfo"]/tr/td[6]', urlDoc)),
                team1: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="homestats"]/tr[1]/td[1]/table[1]/tr/td[2]/strong', urlDoc)),
                team2: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="awaystats"]/tr[1]/td[1]/table[1]/tr/td[2]/strong', urlDoc)),
                score1: score[0].replace(/\D/g, ''),
                score2: score[1].replace(/\D/g, ''),
                scoretype: common.getScoretypePS(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="summary"]/tr[2]/td[1]/table/tr[5]/td[1]', urlDoc), common.getTextFromDoc(useXHTMLNamespace, '//*[@id="summary"]/tr[2]/td[1]/table/tr[6]/td[1]', urlDoc)),
                scoretype: getScoretypeUK(gameDocuments1[index]),
                attendance: attendance ? attendance.replace(/\D/g, '') : null,
                location: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="topinfo"]/tr/td[4]', urlDoc),
                source: sheetUrls[index]
            });
            console.log('row ' + index + ' / ' + gameDocuments2.length + ' done');
        });

        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getScoretypeUK(gamedoc) {
    gamedoc = common.stringToDoc(gamedoc);
    var periodNodesParent = common.getNodes(false, '//*[@id="start-of-content"]/div/article/div[1]/div[5]/div[3]/table/tbody/tr[1]', gamedoc);
    if (periodNodesParent[0].childNodes.length === 9) {
        return 'RT';
    }
    if (periodNodesParent[0].childNodes.length === 11) {
        return 'OT';
    }
    if (periodNodesParent[0].childNodes.length === 13) {
        return 'SO';
    }
    return '';
}

function getTeamName(name) {
    return name.trim();
}

function getFormattedDate(rawDate) {
    var dateArray = rawDate.split('.');
    return [dateArray[2], dateArray[1], dateArray[0]].join('-');
}
