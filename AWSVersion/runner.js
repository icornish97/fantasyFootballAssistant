let runner = require('./index.js');
//https://fantasy.espn.com/apis/v3/games/ffl/seasons/2022/segments/0/leagues/72628823?view=mMatchup&view=mMatchupScore&scoringPeriodId=1
//For Injury report just use the active API Call 
let compiledJSON = runner.JSONinitializer();
//pass JSON INTO HANDLER 
runner.handler(compiledJSON);
