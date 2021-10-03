let weekConfig = require('./weekConfig.js');
let reportBuilder = require('./reportBuilder');
let emailer = require('./emailer');


exports.handler = function(){
return reportBuilder().then(async (htmlOutput)=>{return emailer(htmlOutput, weekConfig()).catch(()=>(console.log(htmlOutput)));});
};
