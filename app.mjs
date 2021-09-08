import axios from 'axios';
import fs from 'fs';
import {groupBy} from './appHelper.mjs'

const week = 1;
let reportName = 'week'+ week + 'injuryReport.html';
let urlBase ='https://fantasy.espn.com/apis/v3/games/ffl/seasons/2021/segments/0/leagues/72628823?view=mMatchup&view=mMatchupScore&scoringPeriodId=';
let url = urlBase.concat(week);

const teamIdByOwner = [{teamId : "1", teamOwner : "Ian Cornish"},
                       {teamId : "2", teamOwner : "Richard Stubing"},
                       {teamId : "3", teamOwner : "Donnie Reynolds"},
                       {teamId : "4", teamOwner : "Devlin Brooks"},
                       {teamId : "5", teamOwner : "Freddy Ponce"},
                       {teamId : "6", teamOwner : "Kyle Hurley"},
                       {teamId : "7", teamOwner : "Austin Reeves"},
                       {teamId : "8", teamOwner : "Danny Stubing"},
                       {teamId : "9", teamOwner : "Chris Serrano"},
                       {teamId : "10", teamOwner : "Josh Hinrichsen"},
                       {teamId : "11", teamOwner : "David Goodyear"},
                       {teamId : "12", teamOwner : "Cody Ponce"}];

const lineupSlotIdByPositionName = [{lineupSlotId : "0", positionName : "Quarterback"},
                                    {lineupSlotId : "2", positionName : "Running Back"},
                                    {lineupSlotId : "4", positionName : "Wide Reciever"},
                                    {lineupSlotId : "6", positionName : "Tight End"},
                                    {lineupSlotId : "16", positionName : "D/ST"},
                                    {lineupSlotId : "17", positionName : "Kicker"},
                                    {lineupSlotId : "20", positionName : "Bench"},
                                    {lineupSlotId : "23", positionName : "Flex"}];

axios.get(url).then((res)=> 
{   
    let responseTeams = res.data.teams;
    
        let teamRosters = [];
        for(let i of responseTeams){
            teamRosters.push(i.roster);
        }
        let listOfRosterEntries = [];
        for(let j of teamRosters){
            for(let l = 0; l< j.entries.length; l++){
                listOfRosterEntries.push(j.entries[l]);
            }
        }
        const playersOnFantasyRosters = listOfRosterEntries.map(entry => {

            let ownerNameValue = teamIdByOwner.filter(team => team.teamId == entry.playerPoolEntry.onTeamId);
            let positionNameValue = lineupSlotIdByPositionName.filter(position => position.lineupSlotId == entry.lineupSlotId);

            return{playerFullName : entry.playerPoolEntry.player.fullName,
                   ownerName : ownerNameValue[0].teamOwner,
                   injuryStatus : entry.playerPoolEntry.player.injuryStatus,
                   position : positionNameValue[0].positionName,
                   playerId : entry.playerId,
                   currentLineupSlotId : entry.lineupSlotId,
                   teamId : entry.playerPoolEntry.onTeamId
                   };
        });

        const getOutStartingPlayers = playersOnFantasyRosters.filter(player => player.position != "Bench" && player.position != "D/ST" && player.injuryStatus != "ACTIVE" && player.injuryStatus != "QUESTIONABLE");
        const getInactiveStartingPlayers = playersOnFantasyRosters.filter(player => player.position != "Bench" && player.position != "D/ST" && player.injuryStatus != "ACTIVE");
        const getQuestionableStartingPlayers = playersOnFantasyRosters.filter(player => player.position != "Bench" && player.position != "D/ST" && player.injuryStatus == "QUESTIONABLE");
        
        const startingPlayersWithStatusByOwner = new Map([...groupBy(getInactiveStartingPlayers, player => player.ownerName).entries()].sort()); 

        var htmlOutput = '<!DOCTYPE html> <html><style> #players { font-family: Arial, Helvetica, sans-serif; border-collapse: collapse;} #players td, #players th { border: 1px } #header {text-align: center;background-color: #04AA6D;color: white;}</style> <body> <table id="players"> <tr> <td id="header" colspan = "3"><b>Week  ' + week + ' Injury Report</b></td> </tr> ';
        for(let [key, value] of startingPlayersWithStatusByOwner){
            htmlOutput = htmlOutput.concat('<tr style="background-color: #ddd !important"> <td colspan = "5"> <b>' +key+ '</b> </td> </tr>')
            for(const player of startingPlayersWithStatusByOwner.get(key)){
                htmlOutput= htmlOutput.concat(' <tr> ');
                htmlOutput = htmlOutput.concat('<td> ' + player.playerFullName + ' </td> <td> ' + player.injuryStatus +' </td>');
                htmlOutput= htmlOutput.concat(' </tr> ');
            }
        }
        htmlOutput = htmlOutput.concat(' </table> </body> </html>');
        fs.writeFile(reportName, htmlOutput, function(err){
            if(err != null){
            console.log('Error: ' + err);
            }
        })
        console.log(reportName);
}    
);
