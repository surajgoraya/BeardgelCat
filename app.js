// Grab configuration environment.
require('dotenv').config();
const { request } = require('undici');
const cron = require('node-cron');

const _TOKEN = process.env.DISCORD_TOKEN;


const { AttachmentBuilder, Client, Events, GatewayIntentBits, Activity, ActivityType, EmbedBuilder } = require('discord.js');
const { MessageMainChannel, delay, MessageMainChannelWithEmbed } = require('./lib/common');
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
    });

    delay(100);

    const embedHelloGif = new EmbedBuilder()
    .setColor('#FF8DC4')
    .setTitle('That was a good nap :) - Back online, meow.')
    .setImage('https://media1.giphy.com/media/9SVdZvlJYzTdS/giphy.gif');
    
    MessageMainChannelWithEmbed(c, embedHelloGif)

    /**
     * Automated job, runs at 8:30 daily - gets the dates for starfield.
     */
    cron.schedule("30 8 * * *", async () => {
        MessageMainChannel(c, `Morning @everyone, ${await get_starfield()}`)
    })
});

client.on(Events.MessageCreate, async (message) => {
    if (message.mentions.users.get(client.user.id) && message.author.id !== client.user.id) {
        if (message.content.toLowerCase().includes('starfield')) {
            message.reply({ content: ` ${await get_starfield()} ${message.author}` });
        } else {
            message.reply({ content: `Meow. ${message.author}` });
        }
    }
});

const get_starfield = async () => {
    const req = await request('https://count.beardgel.ca/api/countdowns', { headers: { 'User-Agent': 'BeardgelCat/1.0.0' } })
    if (req.statusCode === 200) {
        const decoded = await req.body.json();
        return `${decoded.Countdowns[0].text} ${decoded.Countdowns[0].friendly_date}, Meow!`
    } else {
        return 'Looks like my data source is down. meow. :('
    }
}

process.on('SIGINT', async function () {
    console.log("Got SIGINT, shutting down.");

    MessageMainChannel(client, `Meow. The server is restarting, if I don't come back in a few minutes, please tell me I was a good kitty ❤️`);
    
    await delay(2000);
    process.exit(0);
});

