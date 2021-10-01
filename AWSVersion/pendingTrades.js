let settings = require('./settings');
let utils = require('./utils');

module.exports = async function pendingTrades(data){
    let players = utils.getListOfPlayers(data.teams);
    let blockPlayers = players.filter(player=> player.pendingTransactionIds != null);
    let ownersAwaitingTrade = await ownersWithPendingTrades(blockPlayers);
    let tradeLines = [];
    for(i of blockPlayers){
        for(let j = 0; j<i.pendingTransactionIds.length;j++){
            tradeLines.push({transactionId: i.pendingTransactionIds[j], player:i.playerPoolEntry.player.fullName, teamOwner:utils.getOwnerNameByTeamID(i.playerPoolEntry.onTeamId)});
        }
    }
    console.log(ownersAwaitingTrade);
}

async function ownersWithPendingTrades(blockPlayers){
    return [...new Set(blockPlayers.map(player => {return utils.getOwnerNameByTeamID(player.playerPoolEntry.onTeamId)}))];
}
