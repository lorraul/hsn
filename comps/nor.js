var request = require('request');
var common = require('../common');

module.exports = {
    getTSV: async function () {
        //1819
        //rs: https://www.hockey.no/live/scoreboard/getdata?seasonid=200830&tournamentid=381196&teamid=0&date=
        //po: https://www.hockey.no/live/scoreboard/getdata?seasonid=200830&tournamentid=381197&teamid=0&date=
        var initUrl = 'https://www.hockey.no/live/scoreboard/getdata?seasonid=200856&tournamentid=388970&teamid=0&date=' + getDateParamNOR();

        var initResponse = await common.asyncGetJSONs([initUrl]);

        var gameUrls = [];
        initResponse[0].OldMatches.forEach(function (o) {
            gameUrls.push('https://www.hockey.no/live/BoxScore/Boxscore/' + o.MatchId);
        });

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = false;

        gameDocuments.forEach(function (gameDoc, index) {
            if (!gameDoc) {
                return;
            }
            gameDoc = common.stringToDoc(gameDoc);
            var attendance = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="boxscore-page"]/div[10]/table/tbody/tr[2]/td[2]', gameDoc);
            if (!attendance) {
                return;
            }
            var gameJson = initResponse[0].OldMatches[index];
            /*var scoretypeargs = {
                ot: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="boxscore-page"]/table[4]/tbody/tr/td', gameDoc),
                so: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="boxscore-page"]/table[5]/tbody/tr/td', gameDoc)
            }*/
            rowObjects.push({
                competition: 'nor',
                season: '1920',
                stage: 'RS',
                date: getFormattedDateDI(gameJson.FormattedDate),
                team1: getTeamName(gameJson.HomeTeamShortName.trim()),
                team2: getTeamName(gameJson.AwayTeamShortName.trim()),
                score1: gameJson.HomeGoals,
                score2: gameJson.AwayGoals,
                scoretype: '',
                attendance: attendance,
                location: gameJson.ActivityAreaName,
                source: gameUrls[index]
            });
            console.log('row ' + index + ' / ' + gameDocuments.length + ' done');
        });

        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;

    }
};

/*function getScoretype(scoretypeargs) {
    if (scoretypeargs.ot === '(no scoring)' && scoretypeargs.so === '(no scoring)') {
        return 'RT';
    }
    if (scoretypeargs.ot === '(no scoring)') {
        return 'SO'
    }
    return 'OT';
}*/

function getTeamName(name) {
    switch (name) {
        case 'Frisk Asker Elite':
            name = 'Frisk Asker';
            break;
        case 'Ringerike':
            name = 'Ringerike Panthers';
            break;
        case 'Vålerenga Elite':
            name = 'Vålerenga Oslo';
            break;
        case 'Lillehammer Elite':
            name = 'Lillehammer';
            break;
        case 'Stjernen Elite':
            name = 'Stjernen Hockey';
            break;
        case 'Storhamar Elite':
            name = 'Storhamar Hamar';
            break;
        case 'Sparta Sarp Elite':
            name = 'Sparta Sarpsborg';
            break;
        case 'Stavanger Ishockeyklubb':
            name = 'Stavanger Oilers';
            break;
        case 'Manglerud Star Elite':
            name = 'Manglerud Star';
            break;
        case 'Narvik':
            name = 'Narvik Hockey';
            break;
        case 'Sparta Elite':
            name = 'Sparta Sarpsborg';
            break;
    }
    return name;
}

function getFormattedDateDI(dateString) {
    dateString = dateString.trim();
    var dateArray = dateString.split('.');
    return [dateArray[2], dateArray[1], dateArray[0]].join('-');
}

function getDateParamNOR() {
    var x = new Date();
    var y = [(x.getDate() + 100).toString().substring(1, 3), (x.getMonth() + 101).toString().substring(1, 3), x.getFullYear()];
    return y.join('.');
}
