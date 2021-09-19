let axios = require('axios');
let weekConfig = require('./weekConfig.js');
let injuryReportGenerator = require('./injuryReport');
let emailer = require('./emailer');
let settings = require('./settings');


exports.handler = function(){

let week = weekConfig();
let url = 'https://fantasy.espn.com/apis/v3/games/ffl/seasons/'+settings.seasonId+'/segments/0/leagues/'+settings.leagueId+'?view=mMatchup&view=mMatchupScore&scoringPeriodId='+week;

async function compileHtmlOutput(){ return axios.get(url).then(async (res)=> 
{   
    let htmlOutput = injuryReportGenerator(res.data.teams,week);
    console.log(htmlOutput);
return htmlOutput;}    
);
    };
let report = compileHtmlOutput().then(async (htmlOutput)=>{
    return emailer(htmlOutput, week);
});
return report;
};
