const Discord = require("discord.js");
const config = require("../token/config3.json");
const q = require("./query.js");
const client = new Discord.Client();

client.login(config.BOT_TOKEN);

client.on("message", function(message) {
  var is_dm = message.channel.type == 'dm';
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix) && !is_dm) return;
  var msgbody =
  (message.attachments.array().length > 0) ?
    message.attachments.array()[0]['attachment'] :
    (
      (is_dm) ? message.content :
      message.content.slice(config.prefix.length)
    );
  q.ascii2d(msgbody).then(result => {
    message.channel.send("ascii2d\n"+result)
  });
  q.saucenao(msgbody).then(result => {
    message.channel.send("SauceNAO\n"+result)
  });

});
