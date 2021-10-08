let weekConfig = require('./weekConfig.js');
let injuryReportGenerator = require('./injuryReport');
let matchupHistory = require('./matchupHistory');
let previousWeekRecap = require('./previousWeekRecap');
let statistics = require('./statistics');
let settings = require('./settings');
let axios = require('axios');
let utils = require('./utils');


module.exports = async function initializeReport(){
    let week = weekConfig();
    let url = 'https://fantasy.espn.com/apis/v3/games/ffl/seasons/'+settings.seasonId+'/segments/0/leagues/'+settings.leagueId+'?view=mMatchup&view=mMatchupScore&scoringPeriodId='+week;
    return axios.get(url).then(async (res)=> 
        {      
        return buildReport(res.data, week);}    
        );
}

async function buildReport(data, week){
    let htmlOutput=utils.createReport();
    htmlOutput = htmlOutput.concat(utils.createReportBlock("Recap", await previousWeekRecap(data, week)));
    htmlOutput = htmlOutput.concat(utils.createReportBlock("Stats", await statistics(data, week)));
    htmlOutput = htmlOutput.concat(utils.createReportBlock("Preview", await matchupHistory(data, week)));
    htmlOutput = htmlOutput.concat(utils.createReportBlock("Injury Report", await injuryReportGenerator(data.teams,week)));
    htmlOutput = htmlOutput.concat(utils.endReport());
    return htmlOutput;   
}

