// Grab configuration environment.
require('dotenv').config();
const { request } = require('undici');
const cron = require('node-cron');

const _TOKEN = process.env.DISCORD_TOKEN;
const _SHOULD_BE_QUIET = process.env.QUIET_NOTIFY === 'yes';


const { AttachmentBuilder, Client, Events, GatewayIntentBits, Activity, ActivityType, EmbedBuilder } = require('discord.js');
const { MessageMainChannel, delay, MessageMainChannelWithEmbed } = require('./lib/common');
const { UNKNOWN_COMMAND_REPLIES }  = require('./lib/replies');

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

    if(!_SHOULD_BE_QUIET){
        delay(100);
        const embedHelloGif = new EmbedBuilder()
        .setColor('#FF8DC4')
        .setTitle('That was a good nap :) - Back online meow.')
        .setImage('https://media1.giphy.com/media/9SVdZvlJYzTdS/giphy.gif');
       
        MessageMainChannelWithEmbed(c, embedHelloGif);

        const revision = require('child_process')
        .execSync(`git log -1 --pretty="format:%s"`)
        .toString().trim()

        MessageMainChannel(c, `I've learned new tricks!: ${revision} `)
    }

    /**
     * Automated job, runs at 8:30 daily - gets the dates for starfield.
     */
    cron.schedule("30 8 * * *", async () => {
        const starfield_message = await get_starfield();
        MessageMainChannel(c, `Morning @everyone, ${starfield_message[0]}`)
        MessageMainChannel(c, `${starfield_message[1]}`)
    })
});

client.on(Events.MessageCreate, async (message) => {
    if(message.author.id !== client.user.id && message.content.toLowerCase().includes('good kitty')) {
        await message.react('❤️');
        await message.react('😽');
    }

    if (message.mentions.users.get(client.user.id) && message.author.id !== client.user.id) {
        if (message.content.toLowerCase().includes('starfield')) {
            message.reply({ content: ` ${await get_starfield()[0]} ${message.author}` });
        } else {
            const RandomReply = UNKNOWN_COMMAND_REPLIES[Math.floor(Math.random() * array.length)];
            message.reply({ content: `${RandomReply}` });
        }
    }
});

const get_starfield = async () => {
    const req = await request('https://count.beardgel.ca/api/countdowns', { headers: { 'User-Agent': 'BeardgelCat/1.0.0' } })
    if (req.statusCode === 200) {
        const decoded = await req.body.json();
        return [`${decoded.Countdowns[0].text} ${decoded.Countdowns[0].friendly_date}, Meow!`, `${decoded.Countdowns[0].sub_text} ${decoded.Countdowns[0].friendly_sub_date} `]
    } else {
        return 'Looks like my data source is down. meow. :('
    }
}

process.on('SIGINT', async function () {
    
    if(!_SHOULD_BE_QUIET){
        console.log("Got SIGINT, shutting down.");
        MessageMainChannel(client, `Meow. The server is restarting, probably to get new updates, if I don't come back in a few minutes, please tell me I was a good kitty ❤️`);
        await delay(2000);
    }

    process.exit(0);
});

