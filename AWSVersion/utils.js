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
exports.getListOfPlayers = getListOfPlayers;
exports.getOwnerNameByTeamID = getOwnerNameByTeamID;
