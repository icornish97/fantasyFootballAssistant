let settings = require('./settings');
let axios = require('axios');


function getOwnerNameByTeamID(teamId){
    return settings.teamIdByOwner.find(team => team.teamId == teamId).teamOwner;
}
function getListOfPlayers(responseTeams){
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
    return listOfRosterEntries;   
}

function decideWinner(matchup, season, week){
    let match;
    if(matchup.winner == 'HOME'){
        match = {
            winningTeam  : {teamId:matchup.home.teamId,ownerName:getOwnerNameByTeamID(matchup.home.teamId),points:matchup.home.totalPoints,win:1},
            losingTeam : {teamId:matchup.away.teamId,ownerName:getOwnerNameByTeamID(matchup.away.teamId),points:matchup.away.totalPoints,win:0},
            season:season,
            week:week
            }
    }else if(matchup.winner == "AWAY"){
        match = {
            winningTeam : {teamId:matchup.away.teamId,ownerName:getOwnerNameByTeamID(matchup.away.teamId),points:matchup.away.totalPoints,win:1},
            losingTeam : {teamId:matchup.home.teamId,ownerName:getOwnerNameByTeamID(matchup.home.teamId),points:matchup.home.totalPoints,win:0},
            season:season,
            week:week
        }
    }
    return match;
}

function addHTMLBreak(numBreaks){
    let html = "";
    if(numBreaks.length>0){ 
        for(let i = 0; i<numBreaks; i++){
            html = html.concat("<br> ")
        }
    }
    return html;
}

async function getPreviousSeasonMatchups(data){
    let previousSeasons = data.status.previousSeasons.map(season=>({year:season,url:'https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/'+settings.leagueId+'?scoringPeriodId=18&seasonId='+season+'&view=mMatchupScore&view=mScoreboard&view=mSettings&view=mTopPerformers&view=mTeam'}));
    let previousMatchups = [];
    for(i of previousSeasons){
        let response = await axios.get(i.url);
        previousMatchups = response.data[0].schedule.map(matchup => {return decideWinner(matchup, i.year);});
    }
    return previousMatchups;
    }

async function getAllSeasonMatchups(data){
    let previousMatchups = await getPreviousSeasonMatchups(data);
    let currentYearMatchups = await getCurrentSeasonMatchups(data);
    return previousMatchups.concat(currentYearMatchups);
}

async function getCurrentSeasonMatchups(data){
    return data.schedule.filter(match => match.winner!="UNDECIDED").map(match=>decideWinner(match,settings.seasonId))
}

function createReport(){
        return '<!DOCTYPE html><html><body>';
    }

function createReportBlock(title, report){
        return '<div style="text-align:center;font-family: Arial, Helvetica, sans-serif;"><h1>'+title+'</h1>'+report+'</div><br><br>';
    }    
    
function endReport(){
    return '</body></html>';
}
exports.getListOfPlayers = getListOfPlayers;
exports.getOwnerNameByTeamID = getOwnerNameByTeamID;
exports.decideWinner = decideWinner;
exports.addHTMLBreak = addHTMLBreak;
exports.getPreviousSeasonMatchups = getPreviousSeasonMatchups;
exports.getAllSeasonMatchups = getAllSeasonMatchups;
exports.getCurrentSeasonMatchups = getCurrentSeasonMatchups;
exports.createReport = createReport;
exports.createReportBlock = createReportBlock;
exports.endReport = endReport;
    
