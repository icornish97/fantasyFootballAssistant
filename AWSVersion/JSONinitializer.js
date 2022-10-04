let fs = require('fs');
let axios = require('axios');
let utils = require('./utils');
let settings = require('./settings');
let weekConfig = require('./weekConfig');
const { match } = require('assert');

module.exports = async function generateJSON(){
let url = 'https://fantasy.espn.com/apis/v3/games/ffl/seasons/2022/segments/0/leagues/72628823?view=mMatchup&view=mMatchupScore&scoringPeriodId=19';
let completeSeasonJSON={};
completeSeasonJSON.currentSeason = await currentSeason();
//console.log(current);
await axios.get(url).then(async (res)=> 
    {   
        let completeHistoricalData = [];
        for(let season of res.data.status.previousSeasons){
            let url ='https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/72628823?scoringPeriodId=19&seasonId='+season+'&view=mMatchupScore&view=mScoreboard&view=mSettings&view=mTopPerformers&view=mTeam';
              await axios.get(url).then(async (res)=>{
                completeHistoricalData.push(res.data[0]);
            });
        }
        let compiledJSON = await jsonCompliler(completeHistoricalData);

      completeSeasonJSON.historicalSeasons =  compiledJSON;
    }    
    );
    fs.writeFile("output.json", JSON.stringify(completeSeasonJSON), 'utf8', function (err) {
      if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
      }
   
      //console.log("JSON file has been saved.");
  });
    return completeSeasonJSON;
}

async function currentSeason(){
  let weekInfo = weekConfig();
  let currentSeasonData;
  let url = 'https://fantasy.espn.com/apis/v3/games/ffl/seasons/'+settings.seasonId+'/segments/0/leagues/'+settings.leagueId+'?view=mMatchup&view=mMatchupScore&scoringPeriodId='+weekInfo.scoringPeriod;
  await axios.get(url).then(async (res)=> 
      {      
        currentSeasonData = await jsonCompliler(res.data);         
      }  
      );
      return currentSeasonData;
      
}

async function jsonCompliler(data){
    let compilation = {};
    compilation.espnLeagueId = '72628823';
    compilation.leagueName = '563-515-773-314-612 Super League';
    compilation.teams = await genTeamsProperty(data);
    compilation.seasons = await genSeasonsProperty(data);
    return compilation;
}
async function genTeamsProperty(data){
    let teamsList = [];
    if(Array.isArray(data)){
    for(let season of data){
        for(let team of season.teams){
            if(teamsList.filter(element => {return team.primaryOwner == element.teamId; }).length == 0 ){
                teamsList.push({"teamId": team.primaryOwner, "teamAlias":  team.location + ' ' +team.nickname, "ownerName":utils.getOwnerNameByID(team.primaryOwner)});
            }
        }
    }
  }else{
    for(let team of data.teams){
      if(teamsList.filter(element => {return utils.getOwnerNameByTeamID(team.id) == element.ownerName; }).length == 0 ){
          teamsList.push({"currentSeasonId": team.id, "ownerName":utils.getOwnerNameByTeamID(team.id)});
      }
  }
  }
    return teamsList;
}
async function genSeasonsProperty(data){
    let seasonList = [];
    if(Array.isArray(data)){
    for(let season of data){
        let seasonProperty={};
        seasonProperty.seasonId = season.seasonId;
        seasonProperty.isCurrentSeason = false;
        seasonProperty.finalStandings = await createStandingsProperty(season.teams);
        seasonProperty.weeklyScores = await createWeeklyScoresProperty(season);
        seasonProperty.matchups = await createMatchupsProperty(season);

        seasonList.push(seasonProperty);
    }
  }else{
    let seasonProperty={};
    seasonProperty.seasonId = settings.seasonId;
    seasonProperty.isCurrentSeason = true;
    //seasonProperty.finalStandings = await createStandingsProperty(utils.teams);
    seasonProperty.weeklyScores = await createWeeklyScoresProperty(data);
    seasonProperty.matchups = await createMatchupsProperty(data);
    return seasonProperty;
  }

    return seasonList;
}
async function createStandingsProperty(data){
  let results = [];
  for(let team of data){
    let finalStanding = {
      "teamId" : team.primaryOwner,
      "teamOwner" : utils.getOwnerNameByID(team.primaryOwner),
      "rank" : team.rankCalculatedFinal,
      "pointsFor" : Math.round(team.record.overall.pointsFor * 100) / 100,
      "pointsAgainst" : Math.round(team.record.overall.pointsAgainst * 100) / 100,
      "wins" : team.record.overall.wins,
      "losses" : team.record.overall.losses,
      "ties" : team.record.overall.ties
    }; 
    results.push(finalStanding);
  }
  return results;
}
async function createWeeklyScoresProperty(data){
  let weeks = [];
  for(let matchup of data.schedule){
    for(let week in matchup.away.pointsByScoringPeriod){
          weeks.push({
          "weekId" : `${week}`,
          "matchupPeriod" : matchup.matchupPeriodId,
          "playoffType" : matchup.playoffTierType,
          "teamId" :utils.getIdByOwnerName(utils.getOwnerNameByTeamID(matchup.home.teamId)),
          "ownerName" : utils.getOwnerNameByTeamID(matchup.home.teamId), 
          "points" : `${matchup.home.pointsByScoringPeriod[week]}`
          });
          weeks.push({
            "weekId" : `${week}`,
            "matchupPeriod" : matchup.matchupPeriodId,
            "playoffType" : matchup.playoffTierType,
            "teamId": utils.getIdByOwnerName(utils.getOwnerNameByTeamID(matchup.away.teamId)),
            "ownerName": utils.getOwnerNameByTeamID(matchup.away.teamId), 
            "points" : `${matchup.away.pointsByScoringPeriod[week]}`
          });
    }
  }
  return weeks;  
}
async function createMatchupsProperty(data){
  let matchups = [];
  for(let matchup of data.schedule){
    if(matchup.winner!="UNDECIDED"){
    let match = {
                  "matchupPeriodId":matchup.matchupPeriodId,
                  "playoffType":matchup.playoffTierType,
                  "homeTeam":{
                    "teamId":utils.getIdByOwnerName(utils.getOwnerNameByTeamID(matchup.home.teamId)),
                    "ownerName": utils.getOwnerNameByTeamID(matchup.home.teamId),
                    "totalPoints":matchup.home.totalPoints
                  },
                  "awayTeam":{
                    "teamId":utils.getIdByOwnerName(utils.getOwnerNameByTeamID(matchup.away.teamId)),
                    "ownerName": utils.getOwnerNameByTeamID(matchup.away.teamId),
                    "totalPoints":matchup.away.totalPoints
                  }
                };
    if(matchup.winner=="AWAY"){
      match.winningTeamId = utils.getIdByOwnerName(utils.getOwnerNameByTeamID(matchup.away.teamId));
      match.winningTeamOwner = utils.getOwnerNameByTeamID(matchup.away.teamId);
      match.losingTeamId = utils.getIdByOwnerName(utils.getOwnerNameByTeamID(matchup.home.teamId));
      match.losingTeamOwner = utils.getOwnerNameByTeamID(matchup.home.teamId); 
      match.pointDifferential = matchup.away.totalPoints-matchup.home.totalPoints;
    }
    if(matchup.winner=="HOME"){
      match.winningTeamId = utils.getIdByOwnerName(utils.getOwnerNameByTeamID(matchup.home.teamId));
      match.winningTeamOwner = utils.getOwnerNameByTeamID(matchup.home.teamId);
      match.losingTeamId = utils.getIdByOwnerName(utils.getOwnerNameByTeamID(matchup.away.teamId));
      match.losingTeamOwner = utils.getOwnerNameByTeamID(matchup.away.teamId); 
      match.pointDifferential = matchup.home.totalPoints-matchup.away.totalPoints;
    }
    matchups.push(match);
  }
  }
  console.log(matchups);
  return matchups;
}
