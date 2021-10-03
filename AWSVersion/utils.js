let settings = require('./settings');

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

function decideWinner(matchup, season){
    let match;
    if(matchup.winner == 'HOME'){
        match = {
            winningTeam  : {teamId:matchup.home.teamId,ownerName:getOwnerNameByTeamID(matchup.home.teamId),points:matchup.home.totalPoints,win:1},
            losingTeam : {teamId:matchup.away.teamId,ownerName:getOwnerNameByTeamID(matchup.away.teamId),points:matchup.away.totalPoints,win:0},
            season:season
            }
    }else if(matchup.winner == "AWAY"){
        match = {
            winningTeam : {teamId:matchup.away.teamId,ownerName:getOwnerNameByTeamID(matchup.away.teamId),points:matchup.away.totalPoints,win:1},
            losingTeam : {teamId:matchup.home.teamId,ownerName:getOwnerNameByTeamID(matchup.home.teamId),points:matchup.home.totalPoints,win:0},
            season:season
        }
    }
    return match;
}

exports.getListOfPlayers = getListOfPlayers;
exports.getOwnerNameByTeamID = getOwnerNameByTeamID;
exports.decideWinner = decideWinner;
