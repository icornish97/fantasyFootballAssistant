let leagueId = '2106439746';
let week1Start = new Date('September 8, 2023');
let week1End = new Date('September 12, 2023');
let seasonId = '2023';
let awsRegion = 'us-east-2';
let reportToEmail = 'ian.cornish1@gmail.com';
let reportFromEmail = 'ian.cornish1@gmail.com';
global.leagueMembers = [];
global.leagueDataFromAPI;
const espn_s2 = INSERT espn s2 HERE
const SWID = INSERT SWID HERE
const lineupSlotIdByPositionName = [{lineupSlotId : "0", positionName : "Quarterback"},
                       {lineupSlotId : "2", positionName : "Running Back"},
                       {lineupSlotId : "4", positionName : "Wide Reciever"},
                       {lineupSlotId : "6", positionName : "Tight End"},
                       {lineupSlotId : "16", positionName : "D/ST"},
                       {lineupSlotId : "17", positionName : "Kicker"},
                       {lineupSlotId : "20", positionName : "Bench"},
                       {lineupSlotId : "21", positionName : "IR"},
                       {lineupSlotId : "23", positionName : "Flex"}];
const nflTeamByProTeamId = [{proTeamId:1, teamName:"Falcons"},
                            {proTeamId:2, teamName:"Bills"},
                            {proTeamId:3, teamName:"Bears"},
                            {proTeamId:4, teamName:"Bengals"},
                            {proTeamId:5, teamName:""},
                            {proTeamId:6, teamName:""},
                            {proTeamId:7, teamName:""},
                            {proTeamId:8, teamName:"Lions"},
                            {proTeamId:9, teamName:"Packers"},
                            {proTeamId:10, teamName:""},
                            {proTeamId:11, teamName:"Colts"},
                            {proTeamId:12, teamName:"Chiefs"},
                            {proTeamId:13, teamName:""},
                            {proTeamId:14, teamName:"Rams"},
                            {proTeamId:15, teamName:"Dolphins"},
                            {proTeamId:16, teamName:""},
                            {proTeamId:17, teamName:""},
                            {proTeamId:18, teamName:"Saints"},
                            {proTeamId:19, teamName:"Giants"},
                            {proTeamId:20, teamName:""},
                            {proTeamId:21, teamName:""},
                            {proTeamId:22, teamName:""},
                            {proTeamId:23, teamName:""},
                            {proTeamId:24, teamName:"Chargers"},
                            {proTeamId:25, teamName:""},
                            {proTeamId:26, teamName:""},
                            {proTeamId:27, teamName:""},
                            {proTeamId:28, teamName:"Football Team"},
                            {proTeamId:29, teamName:""},
                            {proTeamId:30, teamName:"Jaguars"},
                            {proTeamId:31, teamName:""},
                            {proTeamId:34, teamName:"Texans"}];
exports.week1End = week1End;
exports.week1Start = week1Start;
exports.leagueId = leagueId;
exports.seasonId = seasonId;
exports.awsRegion = awsRegion;
exports.reportToEmail = reportToEmail;
exports.reportFromEmail = reportFromEmail;
exports.espn_s2 = espn_s2;
exports.SWID = SWID;
exports.teamIdByOwner = teamIdByOwner;
exports.lineupSlotIdByPositionName = lineupSlotIdByPositionName;
exports.nflTeamByProTeamId = nflTeamByProTeamId;
