const { match } = require('assert');
let settings = require('./settings');
let axios = require('axios');


function getOwnerNameByTeamID(teamId){
    //this method has been refactored to use the global variables. 8/10/23
    return leagueMembers.find(team => team.id == teamId).ownerName;
}
function getOwnerNameByID(Id){
    //This method is only used in the JSON intializer. Can probably be depricated.
    return settings.teamIdByOwner.find(team => team.id == Id).teamOwner;
}
function getIdByOwnerName(Name){
    //this method has been refactored to use the global variables 8/10/23
    return leagueMembers.find(team => team.ownerName == Name).id;
}
function getNFLTeamByProTeamId(proTeamId){
    return settings.getNFLTeamByProTeamId.find(team=> team.proTeamId == proTeamId).teamName;
}
function getListOfPlayers(responseTeams){
    let teamRosters = [];
    for(let i of responseTeams){
        teamRosters.push(i.roster);
    }
    let listOfRosterEntries = [];
    for(let j of teamRosters){
        for(let l = 0; l< j.entries.length; l++){
            listOfRosterEntries.push(j.entries[l]);
        }
    }
    return listOfRosterEntries;   
}

function processMatch(matchup, season){
    let match;
    if(matchup.winner == 'HOME'){
        match = {
            winningTeam  : {teamId:matchup.home.teamId,ownerName:getOwnerNameByTeamID(matchup.home.teamId),points:matchup.home.totalPoints,pointsByScoringPeriod:matchup.home.pointsByScoringPeriod,win:1},
            losingTeam : {teamId:matchup.away.teamId,ownerName:getOwnerNameByTeamID(matchup.away.teamId),points:matchup.away.totalPoints,pointsByScoringPeriod:matchup.away.pointsByScoringPeriod,win:0},
            season:season,
            week:matchup.matchupPeriodId, 
            playoffTierType:matchup.playoffTierType,
            marginOfVictory:matchup.home.totalPoints-matchup.away.totalPoints
            }
    }else if(matchup.winner == "AWAY"){
        match = {
            winningTeam : {teamId:matchup.away.teamId,ownerName:getOwnerNameByTeamID(matchup.away.teamId),points:matchup.away.totalPoints,pointsByScoringPeriod:matchup.away.pointsByScoringPeriod,win:1},
            losingTeam : {teamId:matchup.home.teamId,ownerName:getOwnerNameByTeamID(matchup.home.teamId),points:matchup.home.totalPoints,pointsByScoringPeriod:matchup.home.pointsByScoringPeriod,win:0},
            season:season,
            week:matchup.matchupPeriodId, 
            playoffTierType:matchup.playoffTierType,
            marginOfVictory:matchup.away.totalPoints-matchup.home.totalPoints
            }
}
    return match;
}

function addHTMLBreak(numBreaks){
    let html = "";
    if(numBreaks!=null){ 
        for(let i = 0; i<numBreaks; i++){
            html = html.concat("<br> ")
        }
    }
    return html;
}

async function getPreviousSeasonMatchups(data){
    //IMPORTANT!!!!! LOOK AT PARAMETERS IN THIS API CALL, MAY BE ABLE TO GET ADITIONAL DATA
    let previousSeasons = data.status.previousSeasons.map(season=>({year:season,url:'https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/'+settings.leagueId+'?scoringPeriodId=18&seasonId='+season+'&view=mMatchupScore&view&view=mScoreboard&view=mSettings&view=mTopPerformers&view=mTeam'}));
    let previousMatchups = [];
    for(i of previousSeasons){
        let response = await axios.get(i.url);
        let tempPreviousMatchups = response.data[0].schedule.map(matchup => {return processMatch(matchup, i.year);});
        for(j of tempPreviousMatchups){
            previousMatchups.push(j);
        }
    }
    return previousMatchups;
    }

async function getAllSeasonMatchups(data){
    let previousMatchups = await getPreviousSeasonMatchups(data);
    let currentYearMatchups = await getCurrentSeasonMatchups(data);
    return previousMatchups.concat(currentYearMatchups);
}
async function getPlayerById(id){
    return rosteredPlayersByPlayerId.get(id);
}
async function getCurrentSeasonMatchups(data){
    return data.schedule.filter(match => match.winner!="UNDECIDED").map(match=>processMatch(match,settings.seasonId))
}
async function getScores(matchups){
    let teamResults = [];
    for(i of matchups){
        if(i != undefined){
        if(i.playoffTierType == "NONE" || i.playoffTierType == null){
        teamResults.push({ownerName:i.winningTeam.ownerName, points:i.winningTeam.points, week:i.week, season:i.season});
        teamResults.push({ownerName:i.losingTeam.ownerName, points:i.losingTeam.points, week:i.week, season:i.season});
        }else{
            for(let week in i.winningTeam.pointsByScoringPeriod){
                console.log('Week log ' + JSON.stringify(i));
                teamResults.push({ownerName:i.winningTeam.ownerName, points:i.winningTeam.pointsByScoringPeriod[week], week:week, season:i.season});
            }
            for(let week in i.losingTeam.pointsByScoringPeriod){
                teamResults.push({ownerName:i.losingTeam.ownerName, points:i.losingTeam.pointsByScoringPeriod[week], week:week, season:i.season});
            }
        }
    }
    }

    return teamResults;
}
async function getHigh(results){
    let highPoints = 0;
    let highTeam;
    for(i of results){
        if(i.points>highPoints){
            highPoints = i.points;
            highTeam = i;
        }
    }
    return highTeam;
}
async function getLow(results){
    let lowPoints = 999;
    let lowTeam;
    for(i of results){
        if(i.points<lowPoints){
            lowPoints = i.points;
            lowTeam = i;
        }
    }
    return lowTeam;
}
async function getAverage(results){
    let sum = 0;
    for(i of results){
        sum += i.points;
    }
    return Math.round((sum/results.length)*100)/100;
}

function createReport(){
        return '<!DOCTYPE html><html><body>';
    }

function createReportBlock(title, report){
        return '<div style="text-align:center;font-family: Arial, sans-serif;"><h1>'+title+'</h1>'+report+'</div><br><br>';
    }    
function createParagraph(style){
    return '<p style="'+style+'" >'
}
function endParagraph(){
    return '</p>';
}
function createTable(params){
    return '<table '+params+'>';
}
function endTable(){
    return '</table>';
}
function createTableHeaders(listOfHeaders, params){
    htmlOutput = "<tr>";
    for(let i = 0; i<listOfHeaders.length; i++){
        htmlOutput = htmlOutput + '<th '+params+'>'+listOfHeaders[i]+'</th>';
    }
    return htmlOutput = htmlOutput.concat("</tr>");
}
function createTableRow(listOfData, params){
    htmlOutput = "<tr>";
    for(let i = 0; i<listOfData.length; i++){
        htmlOutput = htmlOutput + '<td '+params+'>'+listOfData[i]+'</td>';
    }
    return htmlOutput = htmlOutput.concat("</tr>");
}

function endReport(){
    return '</body></html>';
}

function groupBy(collection, property) {
    var i = 0, val, index,
        values = [], result = [];
    for (; i < collection.length; i++) {
        val = collection[i][property];
        index = values.indexOf(val);
        if (index > -1)
            result[index].push(collection[i]);
        else {
            values.push(val);
            result.push([collection[i]]);
        }
    }
    return result;
}

function getPositionNameByDefaultID(id){
    switch(id){
        case 1:
            return 'Quarterback';
            break;
        case 2: 
            return 'Running Back';
            break;
        case 3:
            return 'Wide Reciever';
            break; 
        case 4:
            return 'Tight End';
            break;
        case 5:
            return 'Kicker';
            break;
        case 16:
            return 'D/ST';
            break;
        default:
            return null;
    }
}
exports.getListOfPlayers = getListOfPlayers;
exports.getOwnerNameByTeamID = getOwnerNameByTeamID;
exports.getNFLTeamByProTeamId = getNFLTeamByProTeamId;
exports.processMatch = processMatch;
exports.addHTMLBreak = addHTMLBreak;
exports.getPreviousSeasonMatchups = getPreviousSeasonMatchups;
exports.getAllSeasonMatchups = getAllSeasonMatchups;
exports.getCurrentSeasonMatchups = getCurrentSeasonMatchups;
exports.getScores = getScores;
exports.getHigh = getHigh;
exports.getLow = getLow;
exports.getAverage = getAverage;
exports.createReport = createReport;
exports.createReportBlock = createReportBlock;
exports.createParagraph = createParagraph;
exports.endParagraph = endParagraph;
exports.createTable = createTable;
exports.endTable = endTable;
exports.createTableHeaders = createTableHeaders;
exports.createTableRow = createTableRow;
exports.endReport = endReport;
exports.getOwnerNameByID = getOwnerNameByID;
exports.groupBy = groupBy;
exports.getIdByOwnerName = getIdByOwnerName;
exports.getPositionNameByDefaultID = getPositionNameByDefaultID;
exports.getPlayerById = getPlayerById;
