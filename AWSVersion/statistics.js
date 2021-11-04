let utils = require('./utils');
let settings = require('./settings');

module.exports = async function getStatistics(data, week){
    let allTimeScores = await utils.getScores(await utils.getAllSeasonMatchups(data));
    let currentSeasonScores = await utils.getScores(await utils.getCurrentSeasonMatchups(data));
    let htmlOutput = "";
    htmlOutput = htmlOutput.concat(utils.createTable("")+utils.createTableRow(["Current Season"], 'style="text-align: center;background-color: #04AA6D;color: white;font-family: Arial, Helvetica, sans-serif; border-collapse: collapse; margin-left:auto; margin-right:auto;" colspan = "5"'))
    htmlOutput = htmlOutput.concat(await summarize(currentSeasonScores, week));
    htmlOutput = htmlOutput.concat(utils.addHTMLBreak(2));
    htmlOutput = htmlOutput.concat(utils.createTable("")+utils.createTableRow(["All Time"], 'style="text-align: center;background-color: #04AA6D;color: white;font-family: Arial, Helvetica, sans-serif; border-collapse: collapse; margin-left:auto; margin-right:auto;" colspan = "5"'));
    htmlOutput = htmlOutput.concat(await summarize(allTimeScores, week));
    
    return htmlOutput;
}
async function summarize(matches, currentWeek){ 

    const tableHeaders = ["Owner Name", "Points", "Week", "Season"];

    let high = await utils.getHigh(matches);
    let low = await utils.getLow(matches);
    let avg = await utils.getAverage(matches);

    let htmlOutput="";

    htmlOutput = htmlOutput.concat(utils.createTableRow(["Highest Points"], 'style="background-color:#F15C5C" colspan="4"') + utils.createTableHeaders(tableHeaders, 'style="font-weight: bold; background-color:#ddd"'));

    if(high.week == currentWeek-1 && high.season == settings.seasonId){
        htmlOutput = htmlOutput.concat(utils.createTableRow([high.ownerName, high.points, high.week, high.season],'style="color:#f1e740"'));
    }else{
        htmlOutput = htmlOutput.concat(utils.createTableRow([high.ownerName, high.points, high.week, high.season], ""));
    }

    htmlOutput = htmlOutput.concat(utils.createTableRow(["Lowest Points"], 'style="background-color:#96F4F0" colspan="4"') + utils.createTableHeaders(tableHeaders, 'style="font-weight: bold; background-color:#ddd"'));

    if(low.week == currentWeek-1 && low.season == settings.seasonId){
        htmlOutput = htmlOutput.concat(utils.createTableRow([low.ownerName, low.points, low.week, low.season],'style="color:#f1e740"'));
    }else{
        htmlOutput = htmlOutput.concat(utils.createTableRow([low.ownerName, low.points, low.week, low.season], ""));
    }

    htmlOutput = htmlOutput.concat(utils.createTableRow(["<b>League Average: </b>", avg], "") + '</table>' );

    return htmlOutput;
}
