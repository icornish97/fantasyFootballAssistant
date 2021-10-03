let weekConfig = require('./weekConfig.js');
let injuryReportGenerator = require('./injuryReport');
let matchupHistory = require('./matchupHistory');
let previousWeekRecap = require('./previousWeekRecap');
let settings = require('./settings');
let axios = require('axios');


module.exports = async function initializeReport(){
    let week = weekConfig();
    let url = 'https://fantasy.espn.com/apis/v3/games/ffl/seasons/'+settings.seasonId+'/segments/0/leagues/'+settings.leagueId+'?view=mMatchup&view=mMatchupScore&scoringPeriodId='+week;
    return axios.get(url).then(async (res)=> 
        {      
        return buildReport(res.data, week);}    
        );
}

async function buildReport(data, week){
    let htmlOutput=createReport();
    htmlOutput = htmlOutput.concat(createReportBlock("Recap", await previousWeekRecap(data, week)));
    htmlOutput = htmlOutput.concat(createReportBlock("Preview", await matchupHistory(data, week)));
    htmlOutput = htmlOutput.concat(createReportBlock("Injury Report", await injuryReportGenerator(data.teams,week)));
    htmlOutput = htmlOutput.concat(endReport());
    return htmlOutput;   
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
