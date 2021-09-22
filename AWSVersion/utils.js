let settings = require('./settings');

function getOwnerNameByTeamID(teamId){
    return settings.teamIdByOwner.find(team => team.teamId == teamId).teamOwner;
}

exports.getOwnerNameByTeamID = getOwnerNameByTeamID;