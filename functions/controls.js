const SystemConfig = require('../local/system.json')
const Permissions = require('./permissions')

const { spawn } = require('child_process')

const fs = require('fs')

var Attached = {}

module.exports = {

    Start: async function (id, user) {
        var { Rcon } = require("rcon-client")

        const rcon = await Rcon.connect({
            host: "localhost", port: 27018, password: 'torchJSisCool'
        })

        console.log(await rcon.send("list"))

        let responses = await Promise.all([
            rcon.send("!cleanup list")
        ])

        for (response of responses) {
            console.log(response)
        }

        rcon.end()

        /*if (!Permissions.Check(user, 'server.control')) return false
        var config = await fs.promises.readFile(`${SystemConfig.system.directory}\\${id}\\Torch.js\\config.json`).catch(() => { console.log('Could not find a Torch.js config file for this server.') })
        if (!config) return false
        config = JSON.parse(config.toString())
        config.online = true
        await fs.promises.writeFile(`${SystemConfig.system.directory}\\${id}\\Torch.js\\config.json`, JSON.stringify(config, null, '\t')).catch(() => { console.log('Could not write a Torch.js config file for this server.') })

        Attached[id] = spawn(`${SystemConfig.system.directory}\\${id}\\${id}.Server.exe`, [], { detached: true })
        Attached[id].stdout.on('data', (data) => {
            console.log(data.toString())
        })*/
    },

    Stop: async function (id, user) {
        if (!Permissions.Check(user, 'server.control')) return false
        var config = await fs.promises.readFile(`${SystemConfig.system.directory}\\${id}\\Torch.js\\config.json`).catch(() => { console.log('Could not find a Torch.js config file for this server.') })
        if (!config) return false
        config = JSON.parse(config.toString())
        config.online = true
        await fs.promises.writeFile(`${SystemConfig.system.directory}\\${id}\\Torch.js\\config.json`, JSON.stringify(config, null, '\t')).catch(() => { console.log('Could not write a Torch.js config file for this server.') })

        Attached[id].stdin.write('stop\n')
    }

}