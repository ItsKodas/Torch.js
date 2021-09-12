
const { spawn } = require('child_process')

const Permissions = require('../functions/permissions')
const Controls = require('../functions/controls')

const fs = require('fs')

module.exports = async function (app, SystemConfig, io) {

    app.get('/server', async function (req, res) {
        if (!Permissions.Check(req.account.discord, 'server.view')) return res.status(403).send()

        const server = req.query.id

        if (!fs.existsSync(`${SystemConfig.system.directory}\\${server}`)) return res.status(404).send()
        var config = await fs.promises.readFile(`${SystemConfig.system.directory}\\${server}\\Torch.js\\config.json`).catch(() => { res.status(500).send('Torch.js has not been configured for this server, please configure at /servers') })
        if (!config) return res.status(500).send('Torch.js has been configured incorrectly for this server, please reconfigure at /servers')
        config = JSON.parse(config.toString())

        res.render('controller', { SystemConfig, config })

    })

    app.post('/server', async function (req, res) {
        console.log(req.body)
        if (!fs.existsSync(`${SystemConfig.system.directory}\\${req.body.id}`)) return res.status(404).send()

        var new_config = {
            id: req.body.id,
            port: 27016,
            type: "Standalone",
            online: false,
            permissions: {
                full: ["administrators"]
            },
            restart: []
        }



        if (req.body.action === 'start') {
            if (!Permissions.Check(req.account.discord, 'server.control')) return res.status(403).send()
            Controls.Start(req.body.id, req.account.discord)
            return res.status(200).send()
        }

        if (req.body.action === 'stop') {
            if (!Permissions.Check(req.account.discord, 'server.control')) return res.status(403).send()
            Controls.Stop(req.body.id, req.account.discord)
            return res.status(200).send()
        }

        if (req.body.action === 'check') {
            if (!Permissions.Check(req.account.discord, 'server.control')) return res.status(403).send()
            Controls.Check(req.body.id)
            return res.status(200).send()
        }

        if (req.body.action === 'import') {
            if (!Permissions.Check(req.account.discord, 'server.manage')) return res.status(403).send()
            await fs.promises.mkdir(`${SystemConfig.system.directory}\\${req.body.id}\\Torch.js\\Presets\\Server`, { recursive: true }).catch((err) => { console.log(err), res.status(500).send(err) })
            await fs.promises.mkdir(`${SystemConfig.system.directory}\\${req.body.id}\\Torch.js\\Presets\\World`, { recursive: true }).catch((err) => { console.log(err), res.status(500).send(err) })
            await fs.promises.writeFile(`${SystemConfig.system.directory}\\${req.body.id}\\Torch.js\\config.json`, JSON.stringify(new_config, null, '\t'))
            return res.status(200).send()
        }

        if (req.body.action === 'reset') {
            if (!Permissions.Check(req.account.discord, 'server.manage')) return res.status(403).send()
            await fs.promises.rm(`${SystemConfig.system.directory}\\${req.body.id}\\Torch.js`, { recursive: true }).catch((err) => { console.log(err), res.status(500).send(err) })
            await fs.promises.mkdir(`${SystemConfig.system.directory}\\${req.body.id}\\Torch.js\\Presets\\Server`, { recursive: true }).catch((err) => { console.log(err), res.status(500).send(err) })
            await fs.promises.mkdir(`${SystemConfig.system.directory}\\${req.body.id}\\Torch.js\\Presets\\World`, { recursive: true }).catch((err) => { console.log(err), res.status(500).send(err) })
            await fs.promises.writeFile(`${SystemConfig.system.directory}\\${req.body.id}\\Torch.js\\config.json`, JSON.stringify(new_config, null, '\t'))
            return res.status(200).send()
        }
    })

}