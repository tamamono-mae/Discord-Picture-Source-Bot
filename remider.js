const Discord = require("discord.js");
const config = require("../token/config.json");

const client = new Discord.Client();

client.login(config.BOT_TOKEN);

client.on('ready', () => {
  client.users.fetch(config.userID).then((user) => {
    user.send("おやすみなさい！");
  }).then(() => {
    console.log("Quit in 5 seconds...");
    setTimeout(( () => {return process.exit(1)} ), 5000);
  });
});
