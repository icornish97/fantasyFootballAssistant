let axios = require('axios');
let settings = require('./settings');
let utils = require('./utils');

module.exports = async function generateInactiveReport(responseTeams, week){
    let listOfRosterEntries = utils.getListOfPlayers(responseTeams);
    let listOfTeamsWithGame = await getTeamsWithGame(week);
        const playersOnFantasyRosters = listOfRosterEntries.map(entry => {
            let ownerNameValue = settings.teamIdByOwner.filter(team => team.teamId == entry.playerPoolEntry.onTeamId);
            let positionNameValue = settings.lineupSlotIdByPositionName.filter(position => position.lineupSlotId == entry.lineupSlotId);

            return{playerFullName : entry.playerPoolEntry.player.fullName,
                   ownerName : utils.getOwnerNameByTeamID(entry.playerPoolEntry.onTeamId),
                   injuryStatus : entry.playerPoolEntry.player.injuryStatus,
                   position : positionNameValue[0].positionName,
                   playerId : entry.playerId,
                   currentLineupSlotId : entry.lineupSlotId,
                   teamId : entry.playerPoolEntry.onTeamId,
                   proTeamId : entry.playerPoolEntry.player.proTeamId,
                   onBye : !checkForGameThisWeek(entry, listOfTeamsWithGame)
                   };
        });
        console.log(playersOnFantasyRosters);
        const getInactiveStartingPlayers = playersOnFantasyRosters.filter(player => (player.position != "Bench" && player.position != "IR" && player.injuryStatus != "ACTIVE"  && player.injuryStatus != undefined) || (player.position != "Bench" && player.onBye == true && player.injuryStatus != "INJURY_RESERVE"));
        const startingPlayersWithStatusByOwner = new Map([...groupBy(getInactiveStartingPlayers, player => player.ownerName).entries()].sort()); 
        var htmlOutput = '<style> #players { font-family: Arial, Helvetica, sans-serif; border-collapse: collapse; margin-left:auto; margin-right:auto;} #players td, #players th { border: 1px }</style> <table id="players"> <tr> <td style="text-align: center;background-color: #04AA6D;color: white;" colspan = "3"><b>Week  ' + week.scoringPeriod + ' Injury Report</b></td> </tr> ';

        for(let [key, value] of startingPlayersWithStatusByOwner){
            htmlOutput = htmlOutput.concat('<tr style="background-color: #ddd !important"> <td colspan = "5"> <b>' +key+ '</b> </td> </tr>')
            for(const player of startingPlayersWithStatusByOwner.get(key)){
                htmlOutput= htmlOutput.concat(' <tr> ');
                if(player.onBye == true){
                    htmlOutput = htmlOutput.concat('<td style="color:red; font-weight: bold;"> ' + player.playerFullName + ' </td> <td style="color:red; font-weight: bold;"> BYE </td>');
                }else{
                    if(player.injuryStatus=='OUT' || player.injuryStatus=='INJURY_RESERVE'){
                        htmlOutput = htmlOutput.concat('<td style="color:red; font-weight: bold;"> ' + player.playerFullName + ' </td> <td style="color:red; font-weight: bold;"> ' + player.injuryStatus +' </td>');
                    }else if(player.injuryStatus=='DOUBTFUL'){
                        htmlOutput = htmlOutput.concat('<td style="color:orange; font-weight: bold;"> ' + player.playerFullName + ' </td> <td style="color:orange; font-weight: bold;"> ' + player.injuryStatus +' </td>');
                    }else if(player.injuryStatus != undefined){
                        htmlOutput = htmlOutput.concat('<td> ' + player.playerFullName + ' </td> <td> ' + player.injuryStatus +' </td>');
                    }
                    htmlOutput= htmlOutput.concat(' </tr> ');
                }
            }
        }
        htmlOutput = htmlOutput.concat(' </table> ');
        return htmlOutput;
    }

    function groupBy(list, keyGetter) {
        const map = new Map();
        list.forEach((item) => {
             const key = keyGetter(item);
             const collection = map.get(key);
             if (!collection) {
                 map.set(key, [item]);
             } else {
                 collection.push(item);
             }
        });
        return map;
    }

    function checkForGameThisWeek(playerEntry, teamsWithGameThisWeek){
        let hasGame = teamsWithGameThisWeek.filter(team => team.id == playerEntry.playerPoolEntry.player.proTeamId);
        return hasGame.length > 0;
    }

    async function getTeamsWithGame(week){
        let startDate = week.startDate.getDate();
        let endDate = week.endDate.getDate()+1;
        let startMonth = week.startDate.getMonth()+1;
        let endMonth = week.endDate.getMonth()+1;

        if(startDate<=9){
            startDate = '0'+startDate;
        }
        if(endDate<=9){
            endDate='0'+ endDate;
        }
        if(startMonth<=9){
            startMonth='0'+startMonth;
        }
        if(endMonth<=9){
            endMonth='0'+endMonth;
        }
        
        let url = "https://site.api.espn.com/apis/fantasy/v2/games/ffl/games?dates="+week.startDate.getFullYear() + '' + startMonth + '' + startDate+"-"+week.endDate.getFullYear() + '' + endMonth + '' +endDate+"&pbpOnly=true";
        let response = await axios.get(url);
        let teamsWithGame = [];
        for(let i = 0; i<response.data.events.length; i++){
            for(let j = 0; j<response.data.events[i].competitors.length; j++){
                teamsWithGame.push(response.data.events[i].competitors[j]);
            }
        }
        return teamsWithGame;
    }
