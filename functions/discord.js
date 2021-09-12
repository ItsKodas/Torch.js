const SystemConfig = require('../local/system.json')
const Permissions = require('./permissions')
const Controls = require('./controls')

const fs = require('fs')
const Gamedig = require('gamedig');

module.exports = {

    Client: function () {
        const { Client, Intents } = require('discord.js')
        var selectedIntents = []
        for (intent in Intents.FLAGS) { selectedIntents.push(Intents.FLAGS[intent]) }
        const client = new Client({ intents: selectedIntents })
        if (SystemConfig.discord.token) client.login(SystemConfig.discord.token)
        return client
    },

    Notification: async function (message, color) {
        const client = this.Client()

        var embed = {
            "description": message,
            "color": color || '#ffffff'
        }
        /*var guild = await client.guilds.fetch('847246917654151168')
        var channel = await guild.channels.fetch('847246918953730049')
        channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete(), 120 * 1000))*/
    }

}