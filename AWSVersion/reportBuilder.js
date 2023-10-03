let weekConfig = require('./weekConfig.js');
let inactiveReportGenerator = require('./inactiveReport');
let matchupHistory = require('./matchupHistory');
let previousWeekRecap = require('./previousWeekRecap');
let statistics = require('./statistics');
let settings = require('./settings');
let axios = require('axios');
let utils = require('./utils');


module.exports = async function initializeReport(){
    let weekInfo = weekConfig();
    let url = 'https://fantasy.espn.com/apis/v3/games/ffl/seasons/'+settings.seasonId+'/segments/0/leagues/'+settings.leagueId+'?view=mMatchup&view=mTeam&view=mMatchupScore&view=mTopPerformers&scoringPeriodId='+weekInfo.scoringPeriod;


    return axios.get(url,{headers:{Cookie:`espn_s2=${settings.espn_s2}; SWID=${settings.SWID};`}}).then(async (res)=>{ leagueDataFromAPI = res.data; return buildReport(res.data, weekInfo);});
}
  
async function buildReport(data, week){
    let htmlOutput=utils.createReport();
    let tempTeamsList = [];
    //Create map of members 
    
    initializeLeagueMembers();
    weekConfig();
    htmlOutput = htmlOutput.concat(utils.createReportBlock("Inactive Report", await inactiveReportGenerator(leagueDataFromAPI.teams,currentWeek)));
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
