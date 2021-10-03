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
    let htmlOutput='<!DOCTYPE html> <html><body><div style="text-align:center;font-family: Arial, Helvetica, sans-serif;"><h1>Recap</h1>';
    let prevWeek = await previousWeekRecap(data, week);
    let injuryReport = await injuryReportGenerator(data.teams,week);
    let matchupHistoryReport = await matchupHistory(data, week);
    htmlOutput = htmlOutput.concat(prevWeek + '</div><br><br><br><div style="text-align:center;font-family: Arial, Helvetica, sans-serif;"><h1>Preview</h1>');
    htmlOutput = htmlOutput.concat(matchupHistoryReport + '</div><br><br><br><div style="text-align:center;font-family: Arial, Helvetica, sans-serif;"><h1>Injury Report</h1>');
    htmlOutput = htmlOutput.concat(injuryReport + '</div></body></html>');
    return htmlOutput;   
}

function createReportBlock(title, report){
    return '<div style="text-align:center;font-family: Arial, Helvetica, sans-serif;"><h1>'+title+'</h1>'+report+'</div><br><br>';
}
