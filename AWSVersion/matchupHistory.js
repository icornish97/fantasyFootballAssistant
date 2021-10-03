let settings = require('./settings');
let axios = require('axios');
let utils = require('./utils');

module.exports = async function getMatchupHistoryData(data, week){
    
    function getCurrentMatchups(data, week){
        return data.schedule.filter(match => match.matchupPeriodId == data.status.currentMatchupPeriod).map(matchup => {
            return {home:matchup.home.teamId, away:matchup.away.teamId};
        });
    }

    function getCurrentSeasonResults(data){
        return data.schedule.filter(match => match.winner!="UNDECIDED").map(match=>utils.decideWinner(match,settings.seasonId))
    }
    
    async function getPreviousMatchups(data){
    let previousSeasons = data.status.previousSeasons.map(season=>({year:season,url:'https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/'+settings.leagueId+'?scoringPeriodId=18&seasonId='+season+'&view=mMatchupScore&view=mScoreboard&view=mSettings&view=mTopPerformers&view=mTeam'}));
    let previousMatchups = [];
    for(i of previousSeasons){
        let response = await axios.get(i.url);
        previousMatchups = response.data[0].schedule.map(matchup => {return utils.decideWinner(matchup, i.year);});
    }
    return previousMatchups;
    }

    async function getMatchupRecordsForCurrentWeek(){
        let currentWeekMatchups = getCurrentMatchups(data, week);
        let previousMatchups = await getPreviousMatchups(data);
        let currentYearMatchups = getCurrentSeasonResults(data);
        let matchupHistory = previousMatchups.concat(currentYearMatchups);
        let leagueMatchupHistory=[];
        for(i of currentWeekMatchups){
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
    async function generateHTML(){
        let data = await getMatchupRecordsForCurrentWeek();
        let htmlOutput = '<style> #matchupHistory { font-family: Arial, Helvetica, sans-serif; border-collapse: collapse;margin-left:auto; margin-right:auto;} #matchupHistory td, #matchupHistory th { border: 1px }</style> <body> <table id="matchupHistory"> <tr> <td style="text-align: center;background-color: #04AA6D;color: white;" colspan = "7"><b>Week  ' + week + ' Matchup History (All Time)</b></td> </tr><th style="text-align:center;padding-right:5px;padding-left:5px">Home</th><th style="text-align:center;padding-right:5px;padding-left:5px">Record</th><th style="text-align:center;padding-right:5px;padding-left:5px">Points</th><th></th><th>Away</th><th style="text-align:center;padding-right:5px;padding-left:5px">Record</th><th style="text-align:center;padding-right:5px;padding-left:5px">Points</th>' ;
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
    return  await generateHTML();
    
}
