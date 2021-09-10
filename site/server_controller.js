
const { spawn } = require('child_process')

const Permissions = require('../functions/permissions')

const fs = require('fs')

module.exports = async function (app, SystemConfig, io) {

    app.get('/server', async function (req, res) {
        if (!Permissions.Check(req.account.discord, 'server_view')) return res.status(403).send()

        const server = req.query.id
        
        if (!fs.existsSync(`${SystemConfig.system.directory}\\${server}`)) return res.status(404).send()
        var config = await fs.promises.readFile(`${SystemConfig.system.directory}\\${server}\\Torch.js\\config.json`).catch(() => { res.status(500).send('Torch.js has not been configured for this server, please configure at /servers') })
        if (!config) return
        config = JSON.parse(config.toString())

        console.log(config)

    })

}