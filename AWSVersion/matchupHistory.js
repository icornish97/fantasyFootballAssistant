let settings = require('./settings');
let utils = require('./utils');

module.exports = async function getMatchupHistoryData(data, week){
    
function getCurrentMatchups(data, week){
        return data.schedule.filter(match => match.matchupPeriodId == data.status.currentMatchupPeriod).map(matchup => {
            return {home:matchup.home.teamId, away:matchup.away.teamId};
        });
    }

async function getMatchupRecordsForCurrentWeek(){
        let currentWeekMatchups = getCurrentMatchups(data, week);
        let matchupHistory = await utils.getAllSeasonMatchups(data);
        return getRecordForAllTime(currentWeekMatchups, matchupHistory);
    }


async function getRecordForAllTime(matchupsForWeek, matchupHistory){
    let leagueMatchupHistory=[];
    for(i of matchupsForWeek){
        let vsMatchupHistory=[];
        let history = matchupHistory.filter(history => (history.winningTeam.teamId==i.home || history.losingTeam.teamId==i.home)&&(history.winningTeam.teamId==i.away || history.losingTeam.teamId==i.away));
            for(let teamId in i){
                vsMatchupHistory.push(ownerMatchupSummary(i[teamId], history));
            }
        leagueMatchupHistory.push(vsMatchupHistory);
    }
    return leagueMatchupHistory;
}

function ownerMatchupSummary(teamId, history){
        let totalMatches = history.length;
        let wins=0;
        let losses=0;
        let points=0;
        for(let i =0; i<totalMatches;i++){
            if(history[i].winningTeam.teamId==teamId){
                wins += history[i].winningTeam.win;
                points += history[i].winningTeam.points;
            }else if(history[i].losingTeam.teamId==teamId){
                losses ++;
                points += history[i].losingTeam.points;
            }
        }
        return {teamId:teamId, ownerName:utils.getOwnerNameByTeamID(teamId),totalWins:wins,totalLosses:losses,totalPoints:points};
    }
async function formatAllTimeRecords(data){
        let htmlOutput = '<h2>All Time Head to Head</h2> <style> #matchupHistory { font-family: Arial, Helvetica, sans-serif; border-collapse: collapse;margin-left:auto; margin-right:auto;} #matchupHistory td, #matchupHistory th { border: 1px }</style> <body> <table id="matchupHistory"> <tr> <td style="text-align: center;background-color: #04AA6D;color: white;" colspan = "7"><b>Week  ' + week + ' Matchup History (All Time)</b></td> </tr><th style="text-align:center;padding-right:5px;padding-left:5px">Home</th><th style="text-align:center;padding-right:5px;padding-left:5px">Record</th><th style="text-align:center;padding-right:5px;padding-left:5px">Points</th><th></th><th>Away</th><th style="text-align:center;padding-right:5px;padding-left:5px">Record</th><th style="text-align:center;padding-right:5px;padding-left:5px">Points</th>' ;
        let iterator = 0;
        for(i of data){
            iterator++;
            if(iterator%2 == 0){
                htmlOutput = htmlOutput.concat('<tr><td>'+i[0].ownerName+'</td><td style="text-align:center">('+i[0].totalWins+'-'+i[0].totalLosses+')</td><td>'+i[0].totalPoints+'</td><td style="padding:5px">vs</td><td>'+i[1].ownerName+'</td><td style="text-align:center">('+i[1].totalWins+'-'+i[1].totalLosses+')</td><td>'+i[1].totalPoints+'</td></tr>');

            }else{
                htmlOutput = htmlOutput.concat('<tr style="background-color:#ddd"><td>'+i[0].ownerName+'</td><td style="text-align:center">('+i[0].totalWins+'-'+i[0].totalLosses+')</td><td>'+i[0].totalPoints+'</td><td style="padding:5px">vs</td><td>'+i[1].ownerName+'</td><td style="text-align:center">('+i[1].totalWins+'-'+i[1].totalLosses+')</td><td>'+i[1].totalPoints+'</td></tr>');
            }
        }
        htmlOutput = htmlOutput.concat(' </table> ');
        return htmlOutput;
    }

async function getCurrentSeasonRecords(){
        let currentWeekMatchups = getCurrentMatchups(data, week);
        let curSeason = await utils.getCurrentSeasonMatchups(data, week);
        let matchupsWithRecords = [];
        for(i of currentWeekMatchups){
            let homeMatches =  curSeason.filter(history => (history.winningTeam.teamId==i.home || history.losingTeam.teamId==i.home));
            let awayMatches = curSeason.filter(history => (history.winningTeam.teamId==i.away || history.losingTeam.teamId==i.away));
            let homeRecord = await compileCurrentRecord(homeMatches, i.home);
            let awayRecord = await compileCurrentRecord(awayMatches, i.away);
                matchupsWithRecords.push({home:homeRecord, away:awayRecord});
        }
        return matchupsWithRecords;
    }
async function formatCurrentSeasonRecords(curSeasonRecords){
        let htmlOutput = '<h2>Current Records</h2> <style> #seasonRecord { font-family: Arial, Helvetica, sans-serif; border-collapse: collapse;margin-left:auto; margin-right:auto;} #seasonRecord td, #seasonRecord th { border: 1px }</style> <body> <table id="seasonRecord"> <tr> <td style="text-align: center;background-color: #04AA6D;color: white;" colspan = "7"><b>Week  ' + week + ' Matchups</b></td> </tr><th style="text-align:center;padding-right:5px;padding-left:5px">Home</th><th style="text-align:center;padding-right:5px;padding-left:5px">Record</th><th style="text-align:center;padding-right:5px;padding-left:5px">AVG Points</th><th></th><th>Away</th><th style="text-align:center;padding-right:5px;padding-left:5px">Record</th><th style="text-align:center;padding-right:5px;padding-left:5px">AVG Points</th>' ;
        let iterator = 0;
        for(i of curSeasonRecords){
            iterator++;
            if(iterator%2 == 0){
                htmlOutput = htmlOutput.concat('<tr><td>'+i.home.ownerName+'</td><td style="text-align:center">('+i.home.wins+'-'+i.home.losses+')</td><td>'+i.home.avgPoints+'</td><td style="padding:5px">vs</td><td>'+i.away.ownerName+'</td><td style="text-align:center">('+i.away.wins+'-'+i.away.losses+')</td><td>'+i.away.avgPoints+'</td></tr>');

            }else{
                htmlOutput = htmlOutput.concat('<tr style="background-color:#ddd"><td>'+i.home.ownerName+'</td><td style="text-align:center">('+i.home.wins+'-'+i.home.losses+')</td><td>'+i.home.avgPoints+'</td><td style="padding:5px">vs</td><td>'+i.away.ownerName+'</td><td style="text-align:center">('+i.away.wins+'-'+i.away.losses+')</td><td>'+i.away.avgPoints+'</td></tr>');
            }
        }
        htmlOutput = htmlOutput.concat('</table>')
        return htmlOutput;
    }



async function compileCurrentRecord(matches, teamId){
        let wins = 0; 
        let losses = 0;
        let points = 0;
        for(let i = 0; i<matches.length; i++){
            if(matches[i].winningTeam.teamId == teamId){
                wins++;
                points+=matches[i].winningTeam.points;
            }else{
                losses++;
                points+=matches[i].losingTeam.points;
            }
        }
        return{teamId:teamId, ownerName:utils.getOwnerNameByTeamID(teamId), wins:wins, losses:losses, totalPoints:points, avgPoints:Math.round((points/matches.length)*100)/100};
    }
    
async function generateHTML(){
        let curSeasonRecords = await getCurrentSeasonRecords();
        let curSeasonHTML = await formatCurrentSeasonRecords(curSeasonRecords);
        let allTimeRecords = await getMatchupRecordsForCurrentWeek();
        let allTimeHTML = await formatAllTimeRecords(allTimeRecords);
        let htmlOutput = "";
        htmlOutput = htmlOutput.concat(curSeasonHTML);
        htmlOutput = htmlOutput.concat(utils.addHTMLBreak(3));
        htmlOutput = htmlOutput.concat(allTimeHTML);
        return htmlOutput;
    }
    return await generateHTML();
    
}
