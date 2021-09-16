var axios = require('axios');
var weekConfig = require('./weekConfig.js');
var AWS = require('aws-sdk');

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

exports.handler = function(){

let week = weekConfig();
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
                                    {lineupSlotId : "21", positionName : "IR"},
                                    {lineupSlotId : "23", positionName : "Flex"}];

async function compileHtmlOutput(){ return axios.get(url).then(async (res)=> 
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

        const getInactiveStartingPlayers = playersOnFantasyRosters.filter(player => player.position != "Bench" && player.position != "IR" && player.position != "D/ST" && player.injuryStatus != "ACTIVE" && player.injuryStatus != "INJURY_RESERVE");
        
        const startingPlayersWithStatusByOwner = new Map([...groupBy(getInactiveStartingPlayers, player => player.ownerName).entries()].sort()); 
        var htmlOutput = '<!DOCTYPE html> <html><style> #players { font-family: Arial, Helvetica, sans-serif; border-collapse: collapse;} #players td, #players th { border: 1px }</style> <body> <table id="players"> <tr> <td style="text-align: center;background-color: #04AA6D;color: white;" colspan = "3"><b>Week  ' + week + ' Injury Report</b></td> </tr> ';

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
        htmlOutput = htmlOutput.concat(' </table> </body> </html>');
return htmlOutput;}    
);
    };
let injuryReport = compileHtmlOutput().then(async (htmlOutput)=>{
    var ses = new AWS.SES({region : "us-east-2"});
    var params = {
         Destination: {
              ToAddresses: ['ian.cornish1@gmail.com'],
            },
            Message: {
              Body: {
                Html: { Data:htmlOutput},
              },
        
              Subject: { Data: "Week " + week + " Injury Report" },
            },
            Source: "ian.cornish1@gmail.com",

        };
    return ses.sendEmail(params).promise();
});
return injuryReport;
};
