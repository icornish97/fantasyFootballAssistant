let axios = require('axios');
let weekConfig = require('./weekConfig.js');
let injuryReportGenerator = require('./injuryReport');
let matchupHistory = require('./matchupHistory');
let emailer = require('./emailer');
let settings = require('./settings');


exports.handler = function(){

let week = weekConfig();
let url = 'https://fantasy.espn.com/apis/v3/games/ffl/seasons/'+settings.seasonId+'/segments/0/leagues/'+settings.leagueId+'?view=mMatchup&view=mMatchupScore&scoringPeriodId='+week;

async function compileHtmlOutput(){ return axios.get(url).then(async (res)=> 
{   
    let htmlOutput='<!DOCTYPE html> <html><body><div style="text-align:center;font-family: Arial, Helvetica, sans-serif;"><h1>Preview</h1>';
    let injuryReport = await injuryReportGenerator(res.data.teams,week);
    let matchupHistoryReport = await matchupHistory(res.data, week);
    htmlOutput = htmlOutput.concat(matchupHistoryReport + '</div"><br><br><br><div style="text-align:center;font-family: Arial, Helvetica, sans-serif;"><h1>Injury Report</h1>');
    htmlOutput = htmlOutput.concat(injuryReport + '</div></body></html>');
return htmlOutput;}    
);
    };
let report = compileHtmlOutput().then(async (htmlOutput)=>{
    return emailer(htmlOutput, week).catch(()=>(console.log(htmlOutput)));
});
return report;
};
