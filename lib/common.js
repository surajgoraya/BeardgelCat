const _SEND_CHANNEL = process.env.CHANNEL_ID;

async function MessageMainChannel(client, message) {
    const channel = client.channels.cache.find(channel => channel.id === _SEND_CHANNEL);
    channel.send(`${message}`);
}

async function MessageMainChannelWithEmbed(client, DiscordEmbed) {
    const channel = client.channels.cache.find(channel => channel.id === _SEND_CHANNEL);
    channel.send(DiscordEmbed);
}



function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

module.exports = { MessageMainChannel, MessageMainChannelWithEmbed, delay}