// Grab configuration environment.
require('dotenv').config();

const { request } = require('undici');

const _TOKEN = process.env.DISCORD_TOKEN;


const { Client, Events, GatewayIntentBits, Activity, ActivityType } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });


// Log in to Discord with your client's token
client.login(_TOKEN);


// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    client.user.setPresence({
        status: 'idle',
        afk: true,
    })
});

client.on(Events.MessageCreate, async (message) => {
    if (message.mentions.users.get(client.user.id)) {
        if (message.content.toLowerCase().includes('starfield')) {
            message.reply({ content: ` ${await get_starfield()} ${message.author}` }); 
        } else {
            message.reply({ content: `Meow. ${message.author}` });
        }
    }
});

const get_starfield = async () => {
    const req = await request('https://count.beardgel.ca/api/countdowns', {headers: {'User-Agent': 'BeardgelCat/1.0.0'}})
    if(req.statusCode === 200) {
        const decoded = await req.body.json();
        return `${decoded.Countdowns[0].text} ${decoded.Countdowns[0].friendly_date}, Meow!`
    } else {
        return 'Looks like my data source is down. meow. :('
    }
}

