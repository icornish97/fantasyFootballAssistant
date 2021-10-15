let weekConfig = require('./weekConfig.js');
let reportBuilder = require('./reportBuilder');
let emailer = require('./emailer');


exports.handler = function(){
    let week = weekConfig().scoringPeriod;
    return reportBuilder().then(async (htmlOutput)=>{return emailer(htmlOutput, week).catch(()=>(console.log(htmlOutput)));});
};
