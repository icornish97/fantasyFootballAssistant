let utils = require('./utils');
let settings = require('./settings');

module.exports = async function recapPriorWeek(data, week){ 
    let priorGames = data.schedule.filter(game => game.matchupPeriodId == week-1).map(game=> {return utils.decideWinner(game, settings.seasonId)}); 
    let scores = await getScores(priorGames);
    let high = await getHigh(scores); 
    let low = await getLow(scores);   
    let htmlOutput = '<style> #recap { font-family: Arial, Helvetica, sans-serif; border-collapse: collapse;margin-left:auto; margin-right:auto;} #recap td, #recap th { border: 1px }</style> <body> <table id="recap"> <tr> <td style="text-align: center;background-color: #04AA6D;color: white;" colspan = "7"><b>Recap</b></td> </tr><th style="text-align:center;padding-right:5px;padding-left:5px">Winner</th><th style="text-align:center;padding-right:5px;padding-left:5px">Points</th><th>Loser</th><th style="text-align:center;padding-right:5px;padding-left:5px">Points</th>';
    let even = 0;
    for(i of priorGames){
        even++;
        if(even % 2 == 0 ){
            if(high.ownerName == i.winningTeam.ownerName){
                htmlOutput = htmlOutput.concat('<tr><td style="background-color:#EEF496">'+i.winningTeam.ownerName+'</td><td style="background-color:#EEF496"> '+i.winningTeam.points+'</td><td style="background-color:#FADBD8">'+i.losingTeam.ownerName+'</td><td style="background-color:#FADBD8">'+i.losingTeam.points+ '</td></tr>');
            }else{
                htmlOutput = htmlOutput.concat('<tr><td style="background-color:#D5F5E3">'+i.winningTeam.ownerName+'</td><td style="background-color:#D5F5E3"> '+i.winningTeam.points+'</td><td style="background-color:#FADBD8">'+i.losingTeam.ownerName+'</td><td style="background-color:#FADBD8">'+i.losingTeam.points+ '</td></tr>');
            }   
        }else{
            if(low.ownerName == i.losingTeam.ownerName){
                htmlOutput = htmlOutput.concat('<tr><td style="background-color:#ABEBC6">'+i.winningTeam.ownerName+'</td><td style="background-color:#ABEBC6"> '+i.winningTeam.points+'</td><td style="background-color:#784212;color:white;">'+i.losingTeam.ownerName+'</td><td style="background-color:#784212;color:white;">'+i.losingTeam.points+ '</td></tr>');
            }else{
                htmlOutput = htmlOutput.concat('<tr><td style="background-color:#ABEBC6">'+i.winningTeam.ownerName+'</td><td style="background-color:#ABEBC6"> '+i.winningTeam.points+'</td><td style="background-color:#F5B7B1">'+i.losingTeam.ownerName+'</td><td style="background-color:#F5B7B1">'+i.losingTeam.points+ '</td></tr>');
            }   
        }
    }
    htmlOutput = htmlOutput.concat("</table>");
    return htmlOutput;
}
async function getHigh(results){
    let highPoints = 0;
    let highTeam;
    for(i of results){
        if(i.points>highPoints){
            highPoints = i.points;
            highTeam = i;
        }
    }
    return highTeam;
}
async function getLow(results){
    let lowPoints = 999;
    let lowTeam;
    for(i of results){
        if(i.points<lowPoints){
            lowPoints = i.points;
            lowTeam = i;
        }
    }
    return lowTeam;
}
async function getScores(matchups){
    let teamResults = [];
    for(i of matchups){
        teamResults.push({ownerName:i.winningTeam.ownerName, points:i.winningTeam.points});
        teamResults.push({ownerName:i.losingTeam.ownerName, points:i.losingTeam.points});
    }
    return teamResults;
}
