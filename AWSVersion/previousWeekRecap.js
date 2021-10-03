let utils = require('./utils');
let settings = require('./settings');

module.exports = async function recapPriorWeek(data, week){ 
    let priorGames = data.schedule.filter(game => game.matchupPeriodId == week-1).map(game=> {return utils.decideWinner(game, settings.seasonId)});     
    let htmlOutput = '<style> #recap { font-family: Arial, Helvetica, sans-serif; border-collapse: collapse;margin-left:auto; margin-right:auto;} #recap td, #recap th { border: 1px }</style> <body> <table id="recap"> <tr> <td style="text-align: center;background-color: #04AA6D;color: white;" colspan = "7"><b>Recap</b></td> </tr><th style="text-align:center;padding-right:5px;padding-left:5px">Winner</th><th style="text-align:center;padding-right:5px;padding-left:5px">Points</th><th>Loser</th><th style="text-align:center;padding-right:5px;padding-left:5px">Points</th>';
    let even = 0;
    for(i of priorGames){
        even++;
        if(even % 2 == 0 ){
            htmlOutput = htmlOutput.concat('<tr><td style="background-color:#D5F5E3">'+i.winningTeam.ownerName+'</td><td style="background-color:#D5F5E3"> '+i.winningTeam.points+'</td><td style="background-color:#FADBD8">'+i.losingTeam.ownerName+'</td><td style="background-color:#FADBD8">'+i.losingTeam.points+ '</td></tr>');
        }else{
            htmlOutput = htmlOutput.concat('<tr><td style="background-color:#ABEBC6">'+i.winningTeam.ownerName+'</td><td style="background-color:#ABEBC6"> '+i.winningTeam.points+'</td><td style="background-color:#F5B7B1">'+i.losingTeam.ownerName+'</td><td style="background-color:#F5B7B1">'+i.losingTeam.points+ '</td></tr>');
        }
    }
    htmlOutput = htmlOutput.concat("</table>");
    return htmlOutput;
}
