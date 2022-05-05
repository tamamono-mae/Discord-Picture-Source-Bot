const Discord = require("discord.js");
const config = require("../token/config.json");
const q = require("./query.js");
const client = new Discord.Client();
const TokenSlot = require('./tokenSlot.js');
const sauceToken = new TokenSlot(config.saucenaoTokens);

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
	let reqConfig = {
		url: msgbody,
		token: sauceToken.get(),
		threadhold: config.similarityThreshold,
		depth: config.searchResultCount
	}
	q.ascii2d(msgbody).then(result => {
		message.channel.send("ascii2d\n"+result)
	});
	q.saucenao(reqConfig).then(result => {
		if(result.status != 0) return;
		if(!result.threadhold) return;
		//if(result.dayRemaining == 0) return;
		console.log(result);
		message.channel.send("SauceNAO\n"+result.url);
		console.log('tokenIndex: '+ sauceToken.getIndex())
		if(result.dayRemaining == 0) sauceToken.renew();
	});

});
