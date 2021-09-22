let settings = require('./settings');
let axios = require('axios');
let utils = require('./utils');

module.exports = async function getMatchupHistoryData(data, week){
    
    function getCurrentMatchups(data, week){
        return data.schedule.filter(match => match.matchupPeriodId == week).map(matchup => {
            return {home:matchup.home.teamId, away:matchup.away.teamId};
        });
    }

    function getCurrentSeasonResults(data){
        return data.schedule.filter(match => match.winner!="UNDECIDED").map(match=>decideWinner(match,settings.seasonId))
    }

    function decideWinner(matchup, season){
        let match;
        if(matchup.winner == 'HOME'){
            match = {
                winningTeam  : {teamId:matchup.home.teamId,ownerName:utils.getOwnerNameByTeamID(matchup.home.teamId),points:matchup.home.totalPoints,win:1},
                losingTeam : {teamId:matchup.away.teamId,ownerName:utils.getOwnerNameByTeamID(matchup.away.teamId),points:matchup.away.totalPoints,win:0},
                season:season
                }
        }else if(matchup.winner == "AWAY"){
            match = {
                winningTeam : {teamId:matchup.away.teamId,ownerName:utils.getOwnerNameByTeamID(matchup.away.teamId),points:matchup.away.totalPoints,win:1},
                losingTeam : {teamId:matchup.home.teamId,ownerName:utils.getOwnerNameByTeamID(matchup.home.teamId),points:matchup.home.totalPoints,win:0},
                season:season
            }
        }
        return match;
    }
    
    async function getPreviousMatchups(data){
    let previousSeasons = data.status.previousSeasons.map(season=>({year:season,url:'https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/'+settings.leagueId+'?scoringPeriodId=18&seasonId='+season+'&view=mMatchupScore&view=mScoreboard&view=mSettings&view=mTopPerformers&view=mTeam'}));
    let previousMatchups = [];
    for(i of previousSeasons){
        let response = await axios.get(i.url);
        previousMatchups = response.data[0].schedule.map(matchup => {return decideWinner(matchup, i.year);});
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
            console.log('Matchup '+utils.getOwnerNameByTeamID(i.home) +' VS '+utils.getOwnerNameByTeamID(i.away));
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
        let points=0;
        for(let i =0; i<totalMatches;i++){
            if(history[i].winningTeam.teamId==teamId){
                wins += history[i].winningTeam.win;
                points += history[i].winningTeam.points;
            }else if(history[i].losingTeam.teamId==teamId){
                wins += history[i].losingTeam.win;
                points += history[i].losingTeam.points;
            }
        }
        return {teamId:teamId, ownerName:utils.getOwnerNameByTeamID(teamId),totalWins:wins,totalPoints:points};
    }
    return  getMatchupRecordsForCurrentWeek();
    
}
