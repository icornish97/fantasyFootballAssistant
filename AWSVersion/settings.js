let leagueId = '72628823';
let week1Start = new Date('September 6, 2022');
let week1End = new Date('September 12, 2022');
let seasonId = '2022';
let awsRegion = 'us-east-2';
let reportToEmail = 'ian.cornish1@gmail.com';
let reportFromEmail = 'ian.cornish1@gmail.com';
const teamIdByOwner = [{teamId : "1", teamOwner : "Ian Cornish"},
                       {teamId : "2", teamOwner : "Richard Stubing"},
                       {teamId : "3", teamOwner : "Donnie Reynolds"},
                       {teamId : "4", teamOwner : "Devlin Brooks"},
                       {teamId : "5", teamOwner : "Freddy Ponce"},
                       {teamId : "6", teamOwner : "Kyle Hurley"},
                       {teamId : "7", teamOwner : "Austin Reeves"},
                       {teamId : "8", teamOwner : "Danny Stubing"},
                       {teamId : "9", teamOwner : "Chris Serrano"},
                       {teamId : "10", teamOwner : "Josh Hinrichsen"},
                       {teamId : "11", teamOwner : "David Goodyear"},
                       {teamId : "12", teamOwner : "Cody Ponce"}];
const lineupSlotIdByPositionName = [{lineupSlotId : "0", positionName : "Quarterback"},
                       {lineupSlotId : "2", positionName : "Running Back"},
                       {lineupSlotId : "4", positionName : "Wide Reciever"},
                       {lineupSlotId : "6", positionName : "Tight End"},
                       {lineupSlotId : "16", positionName : "D/ST"},
                       {lineupSlotId : "17", positionName : "Kicker"},
                       {lineupSlotId : "20", positionName : "Bench"},
                       {lineupSlotId : "21", positionName : "IR"},
                       {lineupSlotId : "23", positionName : "Flex"}];
exports.week1End = week1End;
exports.week1Start = week1Start;
exports.leagueId = leagueId;
exports.seasonId = seasonId;
exports.awsRegion = awsRegion;
exports.reportToEmail = reportToEmail;
exports.reportFromEmail = reportFromEmail;
exports.teamIdByOwner = teamIdByOwner;
exports.lineupSlotIdByPositionName = lineupSlotIdByPositionName;
