let settings = require('./settings');

function addDays(curDate, days) {
  var date = new Date(curDate.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

function getScoringPeriodsForSeason(week1Start, week1End){

let scoringPeriods = [{scoringPeriod:1, startDate:week1Start, endDate:week1End}];

for (let i = 2; i<18;i++){
let weekEntry = {
scoringPeriod : i,
startDate : addDays(week1Start,7),
endDate : addDays(week1End,7)
}
week1Start = weekEntry.startDate;
week1End = weekEntry.endDate;
scoringPeriods.push(weekEntry);
}
return scoringPeriods;
}

module.exports = function getCurrentScoringPeriod(){
let todayValues = new Date();
var dd = todayValues.getDate();
var mm = todayValues.getMonth(); 
var yyyy = todayValues.getFullYear();
let today = new Date();
today.setDate(dd);
today.setMonth(mm);
today.setYear(yyyy);
today.setHours(0,0,0,0);

let scoringPeriods = getScoringPeriodsForSeason(settings.week1Start, settings.week1End);

let inDateRange = todayDate => (element, index, array) => {
    return element.endDate >= todayDate && element.startDate<=todayDate;
} 
let CurrentScoringPeriod = scoringPeriods.filter(inDateRange(today));
return CurrentScoringPeriod[0] != undefined ? CurrentScoringPeriod[0] : scoringPeriods[0];

}
