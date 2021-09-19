let axios = require('axios');
let weekConfig = require('./weekConfig.js');
let injuryReportGenerator = require('./injuryReport');
let AWS = require('aws-sdk');
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
let injuryReport = compileHtmlOutput().then(async (htmlOutput)=>{
    var ses = new AWS.SES({region : "us-east-2"});
    var params = {
         Destination: {
              ToAddresses: ['ian.cornish1@gmail.com'],
            },
            Message: {
              Body: {
                Html: { Data:htmlOutput},
              },
        
              Subject: { Data: "Week " + week + " Injury Report" },
            },
            Source: "ian.cornish1@gmail.com",

        };
    return ses.sendEmail(params).promise();
});
return injuryReport;
};
