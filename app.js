/*-----------------------------------------------------------------------------
A simple Language Understanding (LUIS) bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

//var restify = require('restify');
var line = require('@line/bot-sdk');
var express = require('express');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var LineConnector = require("botbuilder-linebot-connector");

// Setup Restify Server
//var server = restify.createServer();
var server = express();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new LineConnector.LineConnector({
    hasPushApi:false,
    autoGetUserProfile:true,
    channelId: process.env.CHANNEL_ID || "",
    channelSecret: process.env.CHANNEL_SECRET || "",
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN ||"" 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
// This default message handler is invoked if the user's utterance doesn't
// match any intents handled by other dialogs.
var bot = new builder.UniversalBot(connector);

// bot.set('storage', tableStorage);

var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

var LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;

// Create a recognizer that gets intents from LUIS, and add it to the bot
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);
    
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
.matches('Greeting', (session) => {
 session.send('Hello 你好我是bot江江機器人\.');
})
.matches('名字', (session) => {
 session.send('我的名字是江岱蓉，很高興認識你\.');
})
.matches('樂趣', (session) => {
 session.send('我喜歡做瑜珈\.');
})
matches('食物', (session) => {
 session.send('我喜歡吃義大利麵\.');
})
matches('', (session) => {
 session.send('我喜歡吃義大利麵\.');
})
.onDefault((session) => {
      session.send( '你可以問我我的興趣、年齡、\.', session.message.text);
 
});

bot.dialog('/', intents);


