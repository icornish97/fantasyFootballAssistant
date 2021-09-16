function addDays(curDate, days) {
    var date = new Date(curDate.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

//FOR NEXT SEASON REPLACE THE START DATES FOR WEEK1START AND WEEK1END. WEEK1START should be set to the Tuesday of the first week of football ie, 
//The tuesday before the thursday night opener, and WEEK1END should be set to the monday of week 1 ie the last game of the week/scoring period
function getScoringPeriodsForSeason(){

let week1Start = new Date('September 7, 2021');
let week1End = new Date('September 13, 2021');
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

export function getCurrentScoringPeriod(){
	let todayValues = new Date();
  var dd = todayValues.getDate();
	var mm = todayValues.getMonth(); 
	var yyyy = todayValues.getFullYear();
  let today = new Date();
  today.setDate(dd);
  today.setMonth(mm);
  today.setYear(yyyy);
  
  let scoringPeriods = getScoringPeriodsForSeason();
  
  let inDateRange = todayDate => (element, index, array) => {
      return element.endDate >= todayDate && element.startDate<=todayDate;
  } 
  let CurrentScoringPeriod = scoringPeriods.filter(inDateRange(today));
  console.log(CurrentScoringPeriod);
  return CurrentScoringPeriod[0].scoringPeriod;
}
