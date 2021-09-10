
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

    app.post('/server', async function (req, res) {
        if (!Permissions.Check(req.account.discord, 'server_manage')) return res.status(403).send()
        if (!fs.existsSync(`${SystemConfig.system.directory}\\${req.body.id}`)) return

        var config = {
            id: req.body.id,
            type: "Standalone",
            online: false,
            permissions: {
                full: ["administrators"]
            },
            restart: []
        }

        if (req.body.action === 'import') {
            await fs.promises.mkdir(`${SystemConfig.system.directory}\\${req.body.id}\\Torch.js\\Presets\\Server`, { recursive: true }).catch((err) => { console.log(err), res.status(500).send(err) })
            await fs.promises.mkdir(`${SystemConfig.system.directory}\\${req.body.id}\\Torch.js\\Presets\\World`, { recursive: true }).catch((err) => { console.log(err), res.status(500).send(err) })
            await fs.promises.writeFile(`${SystemConfig.system.directory}\\${req.body.id}\\Torch.js\\config.json`, JSON.stringify(config, null, '\t'))
            return res.status(200).send()
        }

        if (req.body.action === 'reset') {
            await fs.promises.rmdir(`${SystemConfig.system.directory}\\${req.body.id}\\Torch.js`, { recursive: true }).catch((err) => { console.log(err), res.status(500).send(err) })
            await fs.promises.mkdir(`${SystemConfig.system.directory}\\${req.body.id}\\Torch.js\\Presets\\Server`, { recursive: true }).catch((err) => { console.log(err), res.status(500).send(err) })
            await fs.promises.mkdir(`${SystemConfig.system.directory}\\${req.body.id}\\Torch.js\\Presets\\World`, { recursive: true }).catch((err) => { console.log(err), res.status(500).send(err) })
            await fs.promises.writeFile(`${SystemConfig.system.directory}\\${req.body.id}\\Torch.js\\config.json`, JSON.stringify(config, null, '\t'))
            return res.status(200).send()
        }
    })

}