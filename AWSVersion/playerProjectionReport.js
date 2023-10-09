const { start } = require('repl');
let inactiveReportGenerator = require('./inactiveReport');
let settings = require('./settings');
let utils = require('./utils');
let previousWeekRecap = require('./previousWeekRecap');
let weekConfig = require('./weekConfig.js');
let fs = require('fs');

global.startingPlayers;
module.exports = async function playerProjectionReport(periodToRun){

    let html = '';


    function getXHighLowPlayers(playersToGet,HighLow,Position){
        let currentPosition = startingPlayers.filter(player => {if(player.defaultPosition == Position){return player} if(player.defaultPosition == undefined && player.position == Position){return player;}});
        if(HighLow == 'High'){
            return currentPosition.slice(0,playersToGet)
        }else if(HighLow == 'Low'){
            return currentPosition.slice(currentPosition.length-(playersToGet),currentPosition.length);
        }
    }

    function buildHighLowTeam(HighLow, periodToRun){
        let QB = getXHighLowPlayers(1,HighLow,'Quarterback');
        let RB = getXHighLowPlayers(3,HighLow,'Running Back');
        let WR = getXHighLowPlayers(3,HighLow,'Wide Reciever');
        let TE = getXHighLowPlayers(1,HighLow,'Tight End');
        let K = getXHighLowPlayers(1,HighLow,'Kicker');
        let DST = getXHighLowPlayers(1,HighLow,'D/ST');
        let FLEX;
        if(HighLow == 'High'){
            if(RB[2] > WR[2]){
                FLEX = RB[2];
            }else{
                FLEX = WR[2];   
            }
            RB.pop();
            WR.pop();
        }else{
            if(RB[2] < WR[2]){
                FLEX = RB[2];
                RB.pop();
                WR.shift();
            }else{
                FLEX = WR[2];  
                WR.pop();
                RB.shift();
            }
        }
        let highLowTable = (HighLow=='High')?"<h1>Projected All Stars</h1>":"<h1>Projected... Not All Stars</h1>";
        if(HighLow == 'High'){
            if(periodToRun=='preview'){
                highLowTable = "<h1>Projected All Stars</h1>"
            }else{
                highLowTable = "<h1>All Stars</h1>"
            }
        }else{
            if(periodToRun=='preview'){
                highLowTable = "<h1>Projected... Not All Stars</h1>"
            }else{
                highLowTable = "<h1>Special Teams Unit</h1>"
            }
        }
        highLowTable += utils.createTable(null);
        highLowTable += utils.createTableHeaders(['Player', 'Position', 'Projected Points','Manager'], null);
        let totalPoints = 0;
        for(let i of QB){
        highLowTable += utils.createTableRow([i.playerFullName,(i.defaultPosition!= undefined)?i.defaultPosition:i.position,(i.projectedPoints!=undefined)?i.projectedPoints:i.points,i.ownerName]);
        totalPoints += (i.projectedPoints!=undefined)?i.projectedPoints:i.points;
        }
        for(let i of RB){
            highLowTable += utils.createTableRow([i.playerFullName,(i.defaultPosition!= undefined)?i.defaultPosition:i.position,(i.projectedPoints!=undefined)?i.projectedPoints:i.points,i.ownerName]);
            totalPoints += (i.projectedPoints!=undefined)?i.projectedPoints:i.points;
            }
        for(let i of WR){
        highLowTable += utils.createTableRow([i.playerFullName,(i.defaultPosition!= undefined)?i.defaultPosition:i.position,(i.projectedPoints!=undefined)?i.projectedPoints:i.points,i.ownerName]);
        totalPoints += (i.projectedPoints!=undefined)?i.projectedPoints:i.points;
        }
        for(let i of TE){
        highLowTable += utils.createTableRow([i.playerFullName,(i.defaultPosition!= undefined)?i.defaultPosition:i.position,(i.projectedPoints!=undefined)?i.projectedPoints:i.points,i.ownerName]);
        totalPoints += (i.projectedPoints!=undefined)?i.projectedPoints:i.points;
        }
        highLowTable += utils.createTableRow([FLEX.playerFullName,'FLEX',(FLEX.projectedPoints != undefined)?FLEX.projectedPoints:FLEX.points,FLEX.ownerName]);
        totalPoints += (FLEX.projectedPoints != undefined)?FLEX.projectedPoints:FLEX.points;
        for(let i of K){
        highLowTable += utils.createTableRow([i.playerFullName,(i.defaultPosition!= undefined)?i.defaultPosition:i.position,(i.projectedPoints!=undefined)?i.projectedPoints:i.points,i.ownerName]);
        totalPoints += (i.projectedPoints!=undefined)?i.projectedPoints:i.points;
        }
        for(let i of DST){
        highLowTable += utils.createTableRow([i.playerFullName,(i.defaultPosition!= undefined)?i.defaultPosition:i.position,(i.projectedPoints!=undefined)?i.projectedPoints:i.points,i.ownerName]);
        totalPoints += (i.projectedPoints!=undefined)?i.projectedPoints:i.points;
        }
        highLowTable +=utils.createTableRow(['Total: ', '',Math.round((totalPoints + Number.EPSILON) * 100) / 100 ,''], 'style=\"font-weight:bold\"');
        

        highLowTable += utils.endTable();
        return highLowTable;
    }


    if(periodToRun == 'preview'){
    startingPlayers = rosteredPlayers.filter(player =>{ if(player.position != "Bench" && player.position != "Injured Reserve"){return player;}});
    startingPlayers.sort((a,b)=>(a.projectedPoints<b.projectedPoints)?1:-1); 

}
if(periodToRun == 'recap'){
    startingPlayers = playerStatsForYearWithOwnerInfo.filter(record => record.week == currentWeek.scoringPeriod-1);
    startingPlayers.sort((a,b)=>(a.points<b.points)?1:-1); 

}  


html += buildHighLowTeam('High', periodToRun);
html += buildHighLowTeam('Low', periodToRun);
return html;
}
