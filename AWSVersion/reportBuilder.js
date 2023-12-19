let weekConfig = require('./weekConfig.js');
let fs = require('fs');
let inactiveReportGenerator = require('./inactiveReport');
let matchupHistory = require('./matchupHistory');
let previousWeekRecap = require('./previousWeekRecap');
let statistics = require('./statistics');
let settings = require('./settings');
let axios = require('axios');
let utils = require('./utils');
let playerProjectionReport = require('./playerProjectionReport');
let tradeBlockReport = require('./tradeBlockReport');
let seasonAwards = require('./seasonAwards');

module.exports = async function initializeReport(){
    let weekInfo = weekConfig();
    let url = 'https://fantasy.espn.com/apis/v3/games/ffl/seasons/'+settings.seasonId+'/segments/0/leagues/'+settings.leagueId+'?view=mMatchup&view=mTeam&view=mMatchupScore&view=mTopPerformers&scoringPeriodId='+weekInfo.scoringPeriod;
    //let url = 'https://fantasy.espn.com/apis/v3/games/ffl/seasons/'+settings.seasonId+'/segments/0/leagues/'+settings.leagueId+'?view=mMatchup&view=mTeam&view=mSettings&view=mMatchupScore&scoringPeriodId='+weekInfo.scoringPeriod;

    //Historical URL https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/<ID>?seasonId=<YEAR>

    return axios.get(url,{headers:{Cookie:`espn_s2=${settings.espn_s2}; SWID=${settings.SWID};`}}).then(async (res)=>{ leagueDataFromAPI = res.data;
     return buildReport(res.data, weekInfo);});
}
  
async function buildReport(data, week){
    let htmlOutput=utils.createReport();
    
    initializeLeagueMembers();
    weekConfig();
    initializePlayersOnRosters();
    await initializePlayerStatsForYearWithOwnerInfo();   

    try{
    htmlOutput = htmlOutput.concat(utils.createReportBlock("Recap", await previousWeekRecap(data, week.scoringPeriod)));
    }catch(e){
        htmlOutput =htmlOutput.concat('Error in Recap report ' + e);
    }
    try{
    htmlOutput = htmlOutput.concat(utils.createReportBlock("Stats", await statistics(data, week.scoringPeriod)));
    }catch(e){
        htmlOutput =htmlOutput.concat('Error in Stats report ' + e);
    }
    try{
    htmlOutput = htmlOutput.concat(utils.createReportBlock("Preview", await matchupHistory(data, week.scoringPeriod)));
    }catch(e){
        htmlOutput =htmlOutput.concat('Error in Preview report ' + e);
    }
    try{
    htmlOutput = htmlOutput.concat(utils.createReportBlock("Inactive Report", await inactiveReportGenerator(leagueDataFromAPI.teams,currentWeek)));
    }catch(e){
        htmlOutput =htmlOutput.concat('Error in Inactive report ' + e);
    }
    try{
    htmlOutput = htmlOutput.concat(utils.createReportBlock("Player Recap Report", await playerProjectionReport('recap')));
    }catch(e){
        htmlOutput =htmlOutput.concat('Error in Player Recap report ' + e);
    }
    try{
    htmlOutput = htmlOutput.concat(utils.createReportBlock("Player Projection Report", await playerProjectionReport('preview')));
    }catch(e){
        htmlOutput =htmlOutput.concat('Error in player projection report ' + e);
    }
    try{
    htmlOutput = htmlOutput.concat(utils.createReportBlock("Trade Block", await tradeBlockReport()));
    }catch(e){
        htmlOutput =htmlOutput.concat('Error in Trade Block ' + e);
    }
    try{
        htmlOutput = htmlOutput.concat(utils.createReportBlock("Season Awards", await seasonAwards()));
     }catch(e){
         htmlOutput =htmlOutput.concat('Error in season awards report ' + e);
    }
    htmlOutput = htmlOutput.concat(utils.endReport());
    return htmlOutput;   
}

function initializeLeagueMembers(){
    let memberMap = new Map();
    for(let currentMember of leagueDataFromAPI.members){
        memberMap.set(currentMember.id, currentMember.firstName + ' ' + currentMember.lastName);
    }
    for(let currentTeam of leagueDataFromAPI.teams){
        currentTeam.ownerName = memberMap.get(currentTeam.primaryOwner);
        leagueMembers.push(currentTeam);
    }
}
function initializePlayersOnRosters(){
    let tempList = [];
    let IdByPlayerMap = new Map();
    for(let i of leagueDataFromAPI.teams){
        tempList.push.apply(tempList, i.roster.entries);
    }
    tempList = tempList.map(player => player.playerPoolEntry.player);
    tempList.forEach(player => IdByPlayerMap.set(player.id, player));
    rosteredPlayersByPlayerId = IdByPlayerMap;

}

async function initializePlayerStatsForYearWithOwnerInfo(){
    if(currentWeek.scoringPeriod>1){ 
        for(let periodId = currentWeek.scoringPeriod - 1; periodId>0; periodId--){
            let boxScoreURL = 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/'+settings.seasonId+'/segments/0/leagues/'+ settings.leagueId+ '?scoringPeriodId='+periodId+'&view=mBoxscore';//https://fantasy.espn.com/apis/v3/games/ffl/seasons/'+settings.seasonId+'/segments/0/leagues/'+settings.leagueId+'?view=mMatchup&view=mTeam&view=mMatchupScore&view=mTopPerformers&scoringPeriodId='+weekInfo.scoringPeriod;
            await axios.get(boxScoreURL,{headers:{Cookie:`espn_s2=${settings.espn_s2}; SWID=${settings.SWID};`}}).then(result =>{
                let currentSchedule = result.data.schedule.filter(schedule => schedule.matchupPeriodId == periodId);
                for(let currentMatchup of currentSchedule){
                    for(let currentPlayerEntry of currentMatchup.home.rosterForCurrentScoringPeriod.entries){
                        let position;
                        switch(currentPlayerEntry.lineupSlotId){
                            case 20:
                                position = 'Bench';
                                break;
                            case 21: 
                                position = 'Injured Reserve';
                                break;
                            default: 
                                position = utils.getPositionNameByDefaultID(currentPlayerEntry.playerPoolEntry.player.defaultPositionId);
                        }
                        playerStatsForYearWithOwnerInfo.push({playerFullName : currentPlayerEntry.playerPoolEntry.player.fullName,
                            ownerName : utils.getOwnerNameByTeamID(currentMatchup.home.teamId),
                            position : position,
                            playerId : currentPlayerEntry.playerId,
                            teamId : currentMatchup.home.teamId,
                            week:periodId,
                            proTeamId : currentPlayerEntry.playerPoolEntry.player.proTeamId,
                            points : Math.round((currentPlayerEntry.playerPoolEntry.appliedStatTotal + Number.EPSILON) * 100) / 100 ,
                            });
                    }
                    if(currentMatchup.away != undefined){
                    for(let currentPlayerEntry of currentMatchup.away.rosterForMatchupPeriod.entries){
                        let position;
                        switch(currentPlayerEntry.lineupSlotId){
                            case 20:
                                position = 'Bench';
                                break;
                            case 21: 
                                position = 'Injured Reserve';
                                break;
                            default: 
                                position = utils.getPositionNameByDefaultID(currentPlayerEntry.playerPoolEntry.player.defaultPositionId);
                        }
                        playerStatsForYearWithOwnerInfo.push({playerFullName : currentPlayerEntry.playerPoolEntry.player.fullName,
                            ownerName : utils.getOwnerNameByTeamID(currentMatchup.away.teamId),
                            position : position,
                            playerId : currentPlayerEntry.playerId,
                            teamId : currentMatchup.away.teamId,
                            proTeamId : currentPlayerEntry.playerPoolEntry.player.proTeamId,
                            week:periodId,
                            points : Math.round((currentPlayerEntry.playerPoolEntry.appliedStatTotal + Number.EPSILON) * 100) / 100 ,
                            });
                    }   
                }
                }
            }
                );
        }
        
    }
}
