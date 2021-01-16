const Discord = require("discord.js");
const config = require("./config.json");
const req = require("./require.js");
const client = new Discord.Client();

client.login(config.BOT_TOKEN);
function return_message(){

}
client.on("message", function(message) {
  var is_dm = message.channel.type == 'dm';
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix) && !is_dm) return;
  var msgbody = (is_dm) ? message.content : message.content.slice(config.prefix.length);
  req.search_request(msgbody).then(result => {message.channel.send(result)});
});
