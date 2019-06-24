var request = require('request');
var common = require('../common');

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

module.exports = {
    getTSV: async function () {
        var gameIDS = getGameIDS();

        var gameUrls = [];
        for (var i = 0; i < gameIDS.length; i++) {
            gameUrls.push('http://hockeyligaen.dk/gamesheet.aspx?gameID=' + gameIDS[i]);
        }

        var gameDocuments = await common.asyncGetHTMLs(gameUrls);

        var rowObjects = [];
        var useXHTMLNamespace = false;

        gameDocuments.forEach(function (urlDoc, index) {
            if (!urlDoc) {
                return;
            }
            urlDoc = common.stringToDoc(urlDoc);
            if (common.getTextFromDoc(useXHTMLNamespace, '//*[@id="ctl00_ContentPlaceHolder1_lblDato"]', urlDoc) == '0') {
                return;
            }
            var attendance = common.getTextFromDoc(useXHTMLNamespace, '//*[@id="ctl00_ContentPlaceHolder1_lblSpectators"]', urlDoc);
            rowObjects.push({
                competition: 'dnk',
                season: '1819',
                stage: 'BM',
                date: getFormattedDateC(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="ctl00_ContentPlaceHolder1_lblDato"]', urlDoc).split('kl.')[0]),
                team1: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="ctl00_ContentPlaceHolder1_lblHjemmeHold"]', urlDoc)),
                team2: getTeamName(common.getTextFromDoc(useXHTMLNamespace, '//*[@id="ctl00_ContentPlaceHolder1_lblUdeHold"]', urlDoc)),
                score1: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="ctl00_ContentPlaceHolder1_lblHomeGoalsHeader"]', urlDoc),
                score2: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="ctl00_ContentPlaceHolder1_lblAwayGoalsHeader"]', urlDoc),
                attendance: attendance ? attendance : '',
                location: common.getTextFromDoc(useXHTMLNamespace, '//*[@id="ctl00_ContentPlaceHolder1_lblTurnering"]', urlDoc, 2),
                source: gameUrls[index]
            });
            console.log('row ' + index + ' / ' + gameDocuments.length + ' done');
        });

        rowObjects = common.prepareRowObjects(rowObjects);
        var tsv = common.createTSV(rowObjects);
        return tsv;
    }
};

function getTeamName(name) {
    switch (name) {
        case 'Rungsted Seier Capital':
            name = 'Rungsted Ishockey';
            break;
        case 'SønderjyskE':
            name = 'SønderjyskE Vojens';
            break;
    }
    return name;
}

function getFormattedDateC(dateString) {
    dateString = dateString.trim();
    var dateArray = dateString.split('-');
    return [dateArray[2], dateArray[1], dateArray[0]].join('-');
}

//get this from schedule page (http://www.metalligaen.dk/Home/Schedule) network requests (poll)
//response.M[0].A[0].schedule[].gameID

function getGameIDS() {
    //return [46321, 46322, 46323, 46324, 46325, 46326, 46327, 46328, 46329, 46330, 46331, 46332, 46333, 46334, 46335, 46336, 46337, 46338, 46339, 46340, 46341, 46342, 46343, 46344, 46345, 46346, 46347, 46348, 46349, 46350, 46351, 46352, 46353, 46355, 46354, 46356, 46357, 46358, 46359, 46361, 46360, 46362, 46363, 46364, 46365, 46366, 46367, 46368, 46369, 46370, 46371, 46372, 46373, 46374, 46376, 46377, 46378, 46533, 46379, 46380, 46381, 46383, 46382, 46428, 46385, 46386, 46387, 46388, 46389, 46390, 46391, 46392, 46393, 46394, 46395, 46396, 46397, 46398, 46399, 46400, 46401, 46402, 46403, 46404, 46405, 46406, 46407, 46408, 46409, 46410, 46411, 46412, 46413, 46414, 46415, 46416, 46417, 46418, 46419, 46420, 46421, 46422, 46423, 46424, 46425, 46426, 46384, 46427, 46429, 46430, 46431, 46432, 46433, 46434, 46435, 46436, 46437, 46438, 46439, 46440, 46441, 46442, 46443, 46444, 46445, 46449, 46446, 46447, 46448, 46450, 46451, 46452, 46453, 46454, 46455, 46456, 46457, 46458, 46459, 46460, 46461, 46462, 46463, 46464, 46465, 46466, 46467, 46468, 46469, 46470, 46471, 46472, 46473, 46474, 46475, 46476, 46477, 46478, 46479, 46480, 46481, 46482, 46483, 46484, 46485, 46486, 46487, 46488, 46489, 46490, 46491, 46492, 46493, 46494, 46495, 46496, 46497, 46498, 46499, 46500, 46501, 46502, 46503, 46504, 46505, 46506, 46507, 46508, 46509, 46510, 46511, 46512, 46513, 46514, 46515, 46516, 46517, 46518, 46519, 46520, 46521, 46522, 46523, 46524, 46525, 46526, 46527, 46528, 46529, 46530, 46531, 46375, 46532, 46534, 46535, 46536, 46537, 46538, 46539, 46540, 46541, 46542, 46543, 46544, 46545];
    var init = [
        {
            "H": "SportsAdminLiveHub",
            "M": "schedule",
            "A": [
                {
                    "numberOfTeams": 8,
                    "numberOfGames": 22,
                    "numberOfGamesCompleted": 22,
                    "numberOfRegulationEnds": 16,
                    "numberOfOTEnds": 2,
                    "numberOfGWSEnds": 4,
                    "tournamentName": "Metal Ligaen Kvartfinaler",
                    "tournamentID": 1566,
                    "schedule": [
                        {
                            "gameID": 48522,
                            "gameDate": "2019-03-08T00:00:00",
                            "gameTime": "19:30",
                            "homeTeam": "Rungsted Seier Capital",
                            "awayTeam": "Herlev Eagles",
                            "arenaName": "Bitcoin Arena",
                            "gameResult": "5 - 2",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48523,
                            "gameDate": "2019-03-08T00:00:00",
                            "gameTime": "19:30",
                            "homeTeam": "SønderjyskE",
                            "awayTeam": "Rødovre Mighty Bulls",
                            "arenaName": "Frøs Arena",
                            "gameResult": "0 - 1",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "<img src='../images/tv2sport.png' height='20' width='50'>",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48524,
                            "gameDate": "2019-03-08T00:00:00",
                            "gameTime": "19:30",
                            "homeTeam": "Frederikshavn White Hawks",
                            "awayTeam": "Esbjerg Energy",
                            "arenaName": "Nordjyske Bank Arena",
                            "gameResult": "2 - 3",
                            "OT": false,
                            "GWS": true,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48525,
                            "gameDate": "2019-03-08T00:00:00",
                            "gameTime": "20:00",
                            "homeTeam": "Aalborg Pirates",
                            "awayTeam": "Herning Blue Fox",
                            "arenaName": "Bentax Isarena",
                            "gameResult": "3 - 6",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48526,
                            "gameDate": "2019-03-10T00:00:00",
                            "gameTime": "16:00",
                            "homeTeam": "Herlev Eagles",
                            "awayTeam": "Rungsted Seier Capital",
                            "arenaName": "Herlev Skøjtehal",
                            "gameResult": "3 - 5",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48527,
                            "gameDate": "2019-03-10T00:00:00",
                            "gameTime": "14:00",
                            "homeTeam": "Rødovre Mighty Bulls",
                            "awayTeam": "SønderjyskE",
                            "arenaName": "Rødovre Centrum Arena",
                            "gameResult": "4 - 1",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48528,
                            "gameDate": "2019-03-10T00:00:00",
                            "gameTime": "19:00",
                            "homeTeam": "Esbjerg Energy",
                            "awayTeam": "Frederikshavn White Hawks",
                            "arenaName": "Granly Hockey Arena",
                            "gameResult": "3 - 0",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "<img src='../images/tv2sport.png' height='20' width='50'>",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48529,
                            "gameDate": "2019-03-10T00:00:00",
                            "gameTime": "15:00",
                            "homeTeam": "Herning Blue Fox",
                            "awayTeam": "Aalborg Pirates",
                            "arenaName": "Kvik Hockey Arena  ",
                            "gameResult": "1 - 2",
                            "OT": false,
                            "GWS": true,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48530,
                            "gameDate": "2019-03-12T00:00:00",
                            "gameTime": "20:30",
                            "homeTeam": "Rungsted Seier Capital",
                            "awayTeam": "Herlev Eagles",
                            "arenaName": "Bitcoin Arena",
                            "gameResult": "6 - 5",
                            "OT": true,
                            "GWS": false,
                            "GameGraphics": "<img src='../images/tv2sport.png' height='20' width='50'>",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48531,
                            "gameDate": "2019-03-12T00:00:00",
                            "gameTime": "19:00",
                            "homeTeam": "SønderjyskE",
                            "awayTeam": "Rødovre Mighty Bulls",
                            "arenaName": "Frøs Arena",
                            "gameResult": "5 - 2",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48532,
                            "gameDate": "2019-03-12T00:00:00",
                            "gameTime": "19:00",
                            "homeTeam": "Frederikshavn White Hawks",
                            "awayTeam": "Esbjerg Energy",
                            "arenaName": "Nordjyske Bank Arena",
                            "gameResult": "4 - 0",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48533,
                            "gameDate": "2019-03-12T00:00:00",
                            "gameTime": "19:30",
                            "homeTeam": "Aalborg Pirates",
                            "awayTeam": "Herning Blue Fox",
                            "arenaName": "Bentax Isarena",
                            "gameResult": "2 - 0",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48534,
                            "gameDate": "2019-03-15T00:00:00",
                            "gameTime": "20:00",
                            "homeTeam": "Herlev Eagles",
                            "awayTeam": "Rungsted Seier Capital",
                            "arenaName": "Herlev Skøjtehal",
                            "gameResult": "4 - 8",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48535,
                            "gameDate": "2019-03-15T00:00:00",
                            "gameTime": "19:30",
                            "homeTeam": "Rødovre Mighty Bulls",
                            "awayTeam": "SønderjyskE",
                            "arenaName": "Rødovre Centrum Arena",
                            "gameResult": "1 - 2",
                            "OT": true,
                            "GWS": false,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48536,
                            "gameDate": "2019-03-15T00:00:00",
                            "gameTime": "19:30",
                            "homeTeam": "Esbjerg Energy",
                            "awayTeam": "Frederikshavn White Hawks",
                            "arenaName": "Granly Hockey Arena",
                            "gameResult": "3 - 4",
                            "OT": false,
                            "GWS": true,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48537,
                            "gameDate": "2019-03-15T00:00:00",
                            "gameTime": "19:30",
                            "homeTeam": "Herning Blue Fox",
                            "awayTeam": "Aalborg Pirates",
                            "arenaName": "Kvik Hockey Arena  ",
                            "gameResult": "1 - 2",
                            "OT": false,
                            "GWS": true,
                            "GameGraphics": "<img src='../images/tv2sport.png' height='20' width='50'>",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48539,
                            "gameDate": "2019-03-17T00:00:00",
                            "gameTime": "15:00",
                            "homeTeam": "Aalborg Pirates",
                            "awayTeam": "Herning Blue Fox",
                            "arenaName": "Bentax Isarena",
                            "gameResult": "4 - 2",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48543,
                            "gameDate": "2019-03-17T00:00:00",
                            "gameTime": "17:00",
                            "homeTeam": "Frederikshavn White Hawks",
                            "awayTeam": "Esbjerg Energy",
                            "arenaName": "Nordjyske Bank Arena",
                            "gameResult": "2 - 4",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48544,
                            "gameDate": "2019-03-17T00:00:00",
                            "gameTime": "17:15",
                            "homeTeam": "SønderjyskE",
                            "awayTeam": "Rødovre Mighty Bulls",
                            "arenaName": "Frøs Arena",
                            "gameResult": "6 - 2",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "<img src='../images/tv2sport.png' height='20' width='50'>",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48552,
                            "gameDate": "2019-03-19T00:00:00",
                            "gameTime": "19:00",
                            "homeTeam": "Rødovre Mighty Bulls",
                            "awayTeam": "SønderjyskE",
                            "arenaName": "Rødovre Centrum Arena",
                            "gameResult": "0 - 1",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48553,
                            "gameDate": "2019-03-19T00:00:00",
                            "gameTime": "20:30",
                            "homeTeam": "Esbjerg Energy",
                            "awayTeam": "Frederikshavn White Hawks",
                            "arenaName": "Granly Hockey Arena",
                            "gameResult": "3 - 6",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "<img src='../images/tv2sport.png' height='20' width='50'>",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48566,
                            "gameDate": "2019-03-22T00:00:00",
                            "gameTime": "19:30",
                            "homeTeam": "Frederikshavn White Hawks",
                            "awayTeam": "Esbjerg Energy",
                            "arenaName": "Nordjyske Bank Arena",
                            "gameResult": "4 - 1",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "<img src='../images/tv2sport.png' height='20' width='50'>",
                            "RaceToFinal4": ""
          }
        ],
                    "lastUpdateTime": "2019-04-23T09:27:21.4055617+02:00"
      }
    ]
  },
        {
            "H": "SportsAdminLiveHub",
            "M": "schedule",
            "A": [
                {
                    "numberOfTeams": 2,
                    "numberOfGames": 2,
                    "numberOfGamesCompleted": 2,
                    "numberOfRegulationEnds": 2,
                    "numberOfOTEnds": 0,
                    "numberOfGWSEnds": 0,
                    "tournamentName": "Metal Ligaen - Play-in",
                    "tournamentID": 1565,
                    "schedule": [
                        {
                            "gameID": 48459,
                            "gameDate": "2019-02-26T00:00:00",
                            "gameTime": "19:00",
                            "homeTeam": "Herlev Eagles",
                            "awayTeam": "Odense Bulldogs",
                            "arenaName": "Herlev Skøjtehal",
                            "gameResult": "4 - 1",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48460,
                            "gameDate": "2019-03-01T00:00:00",
                            "gameTime": "19:30",
                            "homeTeam": "Odense Bulldogs",
                            "awayTeam": "Herlev Eagles",
                            "arenaName": "Odense Skøjtehal",
                            "gameResult": "1 - 2",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          }
        ],
                    "lastUpdateTime": "2019-04-23T09:27:21.3485584+02:00"
      }
    ]
  },
        {
            "H": "SportsAdminLiveHub",
            "M": "schedule",
            "A": [
                {
                    "numberOfTeams": 4,
                    "numberOfGames": 10,
                    "numberOfGamesCompleted": 10,
                    "numberOfRegulationEnds": 9,
                    "numberOfOTEnds": 1,
                    "numberOfGWSEnds": 0,
                    "tournamentName": "Metal Ligaen Semifinaler",
                    "tournamentID": 1571,
                    "schedule": [
                        {
                            "gameID": 48574,
                            "gameDate": "2019-03-26T00:00:00",
                            "gameTime": "20:30",
                            "homeTeam": "SønderjyskE",
                            "awayTeam": "Aalborg Pirates",
                            "arenaName": "Frøs Arena",
                            "gameResult": "4 - 1",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "<img src='../images/tv2sport.png' height='20' width='50'>",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48575,
                            "gameDate": "2019-03-26T00:00:00",
                            "gameTime": "19:00",
                            "homeTeam": "Rungsted Seier Capital",
                            "awayTeam": "Frederikshavn White Hawks",
                            "arenaName": "Bitcoin Arena",
                            "gameResult": "3 - 0",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48576,
                            "gameDate": "2019-03-29T00:00:00",
                            "gameTime": "19:30",
                            "homeTeam": "Aalborg Pirates",
                            "awayTeam": "SønderjyskE",
                            "arenaName": "Bentax Isarena",
                            "gameResult": "1 - 5",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48577,
                            "gameDate": "2019-03-29T00:00:00",
                            "gameTime": "19:30",
                            "homeTeam": "Frederikshavn White Hawks",
                            "awayTeam": "Rungsted Seier Capital",
                            "arenaName": "Nordjyske Bank Arena",
                            "gameResult": "3 - 2",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "<img src='../images/tv2sport.png' height='20' width='50'>",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48578,
                            "gameDate": "2019-03-31T00:00:00",
                            "gameTime": "14:30",
                            "homeTeam": "SønderjyskE",
                            "awayTeam": "Aalborg Pirates",
                            "arenaName": "Frøs Arena",
                            "gameResult": "2 - 1",
                            "OT": true,
                            "GWS": false,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48579,
                            "gameDate": "2019-03-31T00:00:00",
                            "gameTime": "17:30",
                            "homeTeam": "Rungsted Seier Capital",
                            "awayTeam": "Frederikshavn White Hawks",
                            "arenaName": "Bitcoin Arena",
                            "gameResult": "4 - 3",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "<img src='../images/tv2sport.png' height='20' width='50'>",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48580,
                            "gameDate": "2019-04-02T00:00:00",
                            "gameTime": "20:30",
                            "homeTeam": "Aalborg Pirates",
                            "awayTeam": "SønderjyskE",
                            "arenaName": "Bentax Isarena",
                            "gameResult": "2 - 3",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "<img src='../images/tv2sport.png' height='20' width='50'>",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48581,
                            "gameDate": "2019-04-02T00:00:00",
                            "gameTime": "19:00",
                            "homeTeam": "Frederikshavn White Hawks",
                            "awayTeam": "Rungsted Seier Capital",
                            "arenaName": "Nordjyske Bank Arena",
                            "gameResult": "5 - 3",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48629,
                            "gameDate": "2019-04-05T00:00:00",
                            "gameTime": "19:30",
                            "homeTeam": "Rungsted Seier Capital",
                            "awayTeam": "Frederikshavn White Hawks",
                            "arenaName": "Bitcoin Arena",
                            "gameResult": "6 - 0",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "<img src='../images/tv2sport.png' height='20' width='50'>",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48630,
                            "gameDate": "2019-04-07T00:00:00",
                            "gameTime": "17:30",
                            "homeTeam": "Frederikshavn White Hawks",
                            "awayTeam": "Rungsted Seier Capital",
                            "arenaName": "Nordjyske Bank Arena",
                            "gameResult": "2 - 3",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "<img src='../images/tv2sport.png' height='20' width='50'>",
                            "RaceToFinal4": ""
          }
        ],
                    "lastUpdateTime": "2019-04-23T09:27:21.3695596+02:00"
      }
    ]
  },
        {
            "H": "SportsAdminLiveHub",
            "M": "schedule",
            "A": [
                {
                    "numberOfTeams": 2,
                    "numberOfGames": 4,
                    "numberOfGamesCompleted": 4,
                    "numberOfRegulationEnds": 3,
                    "numberOfOTEnds": 1,
                    "numberOfGWSEnds": 0,
                    "tournamentName": "Metal Ligaen Finale",
                    "tournamentID": 1574,
                    "schedule": [
                        {
                            "gameID": 48632,
                            "gameDate": "2019-04-12T00:00:00",
                            "gameTime": "19:30",
                            "homeTeam": "Rungsted Seier Capital",
                            "awayTeam": "SønderjyskE",
                            "arenaName": "Bitcoin Arena",
                            "gameResult": "4 - 3",
                            "OT": true,
                            "GWS": false,
                            "GameGraphics": "<img src='../images/tv2sport.png' height='20' width='50'>",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48634,
                            "gameDate": "2019-04-14T00:00:00",
                            "gameTime": "14:00",
                            "homeTeam": "SønderjyskE",
                            "awayTeam": "Rungsted Seier Capital",
                            "arenaName": "Frøs Arena",
                            "gameResult": "2 - 3",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "<img src='../images/tv2sport.png' height='20' width='50'>",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48635,
                            "gameDate": "2019-04-16T00:00:00",
                            "gameTime": "20:30",
                            "homeTeam": "Rungsted Seier Capital",
                            "awayTeam": "SønderjyskE",
                            "arenaName": "Bitcoin Arena",
                            "gameResult": "2 - 0",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "<img src='../images/tv2sport.png' height='20' width='50'>",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48636,
                            "gameDate": "2019-04-19T00:00:00",
                            "gameTime": "19:30",
                            "homeTeam": "SønderjyskE",
                            "awayTeam": "Rungsted Seier Capital",
                            "arenaName": "Frøs Arena",
                            "gameResult": "0 - 1",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "<img src='../images/tv2sport.png' height='20' width='50'>",
                            "RaceToFinal4": ""
          }
        ],
                    "lastUpdateTime": "2019-04-23T09:27:21.3515586+02:00"
      }
    ]
  },
        {
            "H": "SportsAdminLiveHub",
            "M": "schedule",
            "A": [
                {
                    "numberOfTeams": 2,
                    "numberOfGames": 2,
                    "numberOfGamesCompleted": 2,
                    "numberOfRegulationEnds": 2,
                    "numberOfOTEnds": 0,
                    "numberOfGWSEnds": 0,
                    "tournamentName": "Metal Ligaen Bronzekampe",
                    "tournamentID": 1576,
                    "schedule": [
                        {
                            "gameID": 48631,
                            "gameDate": "2019-04-12T00:00:00",
                            "gameTime": "19:30",
                            "homeTeam": "Aalborg Pirates",
                            "awayTeam": "Frederikshavn White Hawks",
                            "arenaName": "Bentax Isarena",
                            "gameResult": "1 - 3",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          },
                        {
                            "gameID": 48633,
                            "gameDate": "2019-04-13T00:00:00",
                            "gameTime": "17:00",
                            "homeTeam": "Frederikshavn White Hawks",
                            "awayTeam": "Aalborg Pirates",
                            "arenaName": "Nordjyske Bank Arena",
                            "gameResult": "6 - 4",
                            "OT": false,
                            "GWS": false,
                            "GameGraphics": "",
                            "RaceToFinal4": ""
          }
        ],
                    "lastUpdateTime": "2019-04-23T09:27:57.1806079+02:00"
      }
    ]
  }
];
    return init[4].A[0].schedule.map(function (o) {
        return o.gameID;
    });
}
