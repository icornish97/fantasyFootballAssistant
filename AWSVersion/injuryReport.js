let settings = require('./settings');
let utils = require('./utils');

module.exports = async function generateInjuryReport(responseTeams, week){
    let listOfRosterEntries = utils.getListOfPlayers(responseTeams);
        const playersOnFantasyRosters = listOfRosterEntries.map(entry => {

            let ownerNameValue = settings.teamIdByOwner.filter(team => team.teamId == entry.playerPoolEntry.onTeamId);
            let positionNameValue = settings.lineupSlotIdByPositionName.filter(position => position.lineupSlotId == entry.lineupSlotId);

            return{playerFullName : entry.playerPoolEntry.player.fullName,
                   ownerName : utils.getOwnerNameByTeamID(entry.playerPoolEntry.onTeamId),
                   injuryStatus : entry.playerPoolEntry.player.injuryStatus,
                   position : positionNameValue[0].positionName,
                   playerId : entry.playerId,
                   currentLineupSlotId : entry.lineupSlotId,
                   teamId : entry.playerPoolEntry.onTeamId
                   };
        });

        const getInactiveStartingPlayers = playersOnFantasyRosters.filter(player => player.position != "Bench" && player.position != "IR" && player.position != "D/ST" && player.injuryStatus != "ACTIVE" && player.injuryStatus != "INJURY_RESERVE");
        
        const startingPlayersWithStatusByOwner = new Map([...groupBy(getInactiveStartingPlayers, player => player.ownerName).entries()].sort()); 
        var htmlOutput = '<style> #players { font-family: Arial, Helvetica, sans-serif; border-collapse: collapse; margin-left:auto; margin-right:auto;} #players td, #players th { border: 1px }</style> <table id="players"> <tr> <td style="text-align: center;background-color: #04AA6D;color: white;" colspan = "3"><b>Week  ' + week + ' Injury Report</b></td> </tr> ';

        for(let [key, value] of startingPlayersWithStatusByOwner){
            htmlOutput = htmlOutput.concat('<tr style="background-color: #ddd !important"> <td colspan = "5"> <b>' +key+ '</b> </td> </tr>')
            for(const player of startingPlayersWithStatusByOwner.get(key)){
                htmlOutput= htmlOutput.concat(' <tr> ');
                if(player.injuryStatus=='OUT' || player.injuryStatus=='INJURY_RESERVE'){
                    htmlOutput = htmlOutput.concat('<td style="color:red; font-weight: bold;"> ' + player.playerFullName + ' </td> <td style="color:red; font-weight: bold;"> ' + player.injuryStatus +' </td>');
                }else if(player.injuryStatus=='DOUBTFUL'){
                    console.log(player.playerFullName);
                    htmlOutput = htmlOutput.concat('<td style="color:orange; font-weight: bold;"> ' + player.playerFullName + ' </td> <td style="color:orange; font-weight: bold;"> ' + player.injuryStatus +' </td>');
                }else{
                    htmlOutput = htmlOutput.concat('<td> ' + player.playerFullName + ' </td> <td> ' + player.injuryStatus +' </td>');
                }
                htmlOutput= htmlOutput.concat(' </tr> ');
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
