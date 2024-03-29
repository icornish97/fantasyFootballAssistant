let utils = require('./utils');
let settings = require('./settings');
let weekConfig = require('./weekConfig');


module.exports = async function recapPriorWeek(data, week){ 
    //console.log(currentWeek.scoringPeriod);
    let priorGames = leagueDataFromAPI.schedule.filter(game => game.matchupPeriodId == currentWeek.scoringPeriod-1).map(game=> { return utils.processMatch(game, settings.seasonId)});
    let scores = await utils.getScores(priorGames);
    let high = await utils.getHigh(scores); 
    let low = await utils.getLow(scores); 
    let avg = await utils.getAverage(scores);
    let htmlOutput = '<style> #recap { font-family: Arial, sans-serif; border-collapse: collapse;margin-left:auto; margin-right:auto;} #recap td, #recap th { border: 1px }</style> <body> <table id="recap"> <tr> <td style="text-align: center;background-color: #04AA6D;color: white;" colspan = "7"><b>Recap</b></td> </tr><th style="text-align:center;padding-right:5px;padding-left:5px">Winner</th><th style="text-align:center;padding-right:5px;padding-left:5px">Points</th><th>Loser</th><th style="text-align:center;padding-right:5px;padding-left:5px">Points</th>';
    let even = 0;
    for(i of priorGames){
        if(i!=undefined){
        even++;
        if(high.ownerName == i.winningTeam.ownerName && low.ownerName == i.losingTeam.ownerName){
            htmlOutput = htmlOutput.concat('<tr><td style="background-color:#EEF496">'+i.winningTeam.ownerName+'</td><td style="background-color:#EEF496"> '+i.winningTeam.points+'</td><td style="background-color:#784212;color:white;">'+i.losingTeam.ownerName+'</td><td style="background-color:#784212;color:white;">'+i.losingTeam.points+ '</td></tr>');
        }else{
        if(even % 2 == 0 ){
            if(high.ownerName == i.winningTeam.ownerName){
                htmlOutput = htmlOutput.concat('<tr><td style="background-color:#EEF496">'+i.winningTeam.ownerName+'</td><td style="background-color:#EEF496"> '+i.winningTeam.points+'</td><td style="background-color:#FADBD8">'+i.losingTeam.ownerName+'</td><td style="background-color:#FADBD8">'+i.losingTeam.points+ '</td></tr>');
            }else if(low.ownerName == i.losingTeam.ownerName){
                htmlOutput = htmlOutput.concat('<tr><td style="background-color:#D5F5E3">'+i.winningTeam.ownerName+'</td><td style="background-color:#D5F5E3"> '+i.winningTeam.points+'</td><td style="background-color:#784212;color:white;">'+i.losingTeam.ownerName+'</td><td style="background-color:#784212;color:white;">'+i.losingTeam.points+ '</td></tr>');
            }else{
                htmlOutput = htmlOutput.concat('<tr><td style="background-color:#D5F5E3">'+i.winningTeam.ownerName+'</td><td style="background-color:#D5F5E3"> '+i.winningTeam.points+'</td><td style="background-color:#FADBD8">'+i.losingTeam.ownerName+'</td><td style="background-color:#FADBD8">'+i.losingTeam.points+ '</td></tr>');
            }
        }else{
            if(high.ownerName == i.winningTeam.ownerName){
                htmlOutput = htmlOutput.concat('<tr><td style="background-color:#EEF496">'+i.winningTeam.ownerName+'</td><td style="background-color:#EEF496"> '+i.winningTeam.points+'</td><td style="background-color:#F5B7B1">'+i.losingTeam.ownerName+'</td><td style="background-color:#F5B7B1">'+i.losingTeam.points+ '</td></tr>');
            }else if(low.ownerName == i.losingTeam.ownerName){
                htmlOutput = htmlOutput.concat('<tr><td style="background-color:#ABEBC6">'+i.winningTeam.ownerName+'</td><td style="background-color:#ABEBC6"> '+i.winningTeam.points+'</td><td style="background-color:#784212;color:white;">'+i.losingTeam.ownerName+'</td><td style="background-color:#784212;color:white;">'+i.losingTeam.points+ '</td></tr>');
            }else{
                htmlOutput = htmlOutput.concat('<tr><td style="background-color:#ABEBC6">'+i.winningTeam.ownerName+'</td><td style="background-color:#ABEBC6"> '+i.winningTeam.points+'</td><td style="background-color:#F5B7B1">'+i.losingTeam.ownerName+'</td><td style="background-color:#F5B7B1">'+i.losingTeam.points+ '</td></tr>');
            }   
        }
    }
}
    }
    htmlOutput = htmlOutput.concat('<tr><td style="text-align:center" colspan = "7"><b>League Average for Week: '+avg+'</b></td></tr>');
    htmlOutput = htmlOutput.concat("</table>");
    return htmlOutput;
}
