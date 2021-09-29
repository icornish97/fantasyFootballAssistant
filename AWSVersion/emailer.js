let settings = require('./settings');
let AWS = require('aws-sdk');
module.exports = function(htmlOutput, week){var ses = new AWS.SES({region : settings.awsRegion});
var params = {
     Destination: {
          ToAddresses: [settings.reportToEmail],
        },
        Message: {
          Body: {
            Html: { Data:htmlOutput},
          },
    
          Subject: { Data: "Week " + week + " FF Report" },
        },
        Source: settings.reportFromEmail,

    };
    return ses.sendEmail(params).promise();
}
