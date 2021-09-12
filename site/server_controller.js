
const { spawn } = require('child_process')

const Permissions = require('../functions/permissions')
const Controls = require('../functions/controls')
const Essentials = require('../functions/essentials')

const fs = require('fs')
const Password = require('generate-password')

module.exports = async function (app, client, SystemConfig, io) {

    app.get('/server', async function (req, res) {
        if (!Permissions.Check(req.account.discord, 'server.view')) return res.status(403).send()

        const server = req.query.id

        if (!fs.existsSync(`${SystemConfig.system.directory}\\${server}`)) return res.status(404).send()
        var config = await fs.promises.readFile(`${SystemConfig.system.directory}\\${server}\\Torch.js\\config.json`).catch(() => { res.status(500).send('Torch.js has not been configured for this server, please configure at /servers') })
        if (!config) return
        config = JSON.parse(config.toString())

        res.render('controller', { SystemConfig, config })

    })

    app.post('/server', async function (req, res) {
        console.log(req.body)
        if (!fs.existsSync(`${SystemConfig.system.directory}\\${req.body.id}`)) return res.status(404).send()

        var new_config = {
            id: req.body.id,
            port: 27016,
            rcon: 37016,
            rcon_password: 'sIHb6F4ew//D1OfQInQAzQ==',
            type: 'Standalone',
            online: false,
            active: {
                world: `World`,
                server_config: `Default.cfg`,
                world_config: `Default.sbc`,
                mod_list: null
            },
            permissions: {
                full: ['administrators']
            },
            restart_times: [],
            plugins: []
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

            try {
                var saves = await fs.promises.readdir(`${SystemConfig.system.directory}\\${req.body.id}\\Instance\\Saves`)
                var world
                for (save of saves) {
                    if (save.includes('.sbl') || world) { continue }
                    world = save
                }
                if (!world) { throw new Error('No world found') }

                var torch_config = (await fs.promises.readFile(`${SystemConfig.system.directory}\\${req.body.id}\\Torch.cfg`)).toString()
                var se_config = (await fs.promises.readFile(`${SystemConfig.system.directory}\\${req.body.id}\\Instance\\SpaceEngineers-Dedicated.cfg`)).toString()
                var sandbox_config = (await fs.promises.readFile(`${SystemConfig.system.directory}\\${req.body.id}\\Instance\\Saves\\${world}\\Sandbox_config.sbc`)).toString()

                new_config.active.world = world
                new_config.port = parseInt(Essentials.ReplaceXml(se_config, 'ServerPort'))
                new_config.rcon = new_config.port + 10000

                if (!torch_config.includes('<Plugins />')) {
                    var plugins = Essentials.ReplaceXml(torch_config, 'Plugins').trim().split('\n')
                    for (plugin of plugins) {
                        new_config.plugins.push(plugin.split('<guid>')[1].split('</guid>')[0])
                    }
                }
                
                fs.promises.writeFile(`${SystemConfig.system.directory}\\${req.body.id}\\Torch.js\\Presets\\Server\\Default.cfg`, se_config)
                fs.promises.writeFile(`${SystemConfig.system.directory}\\${req.body.id}\\Torch.js\\Presets\\World\\Default.sbc`, sandbox_config)

            } catch (err) {
                return res.status(500).send(err), console.log(err)
            }

            await fs.promises.writeFile(`${SystemConfig.system.directory}\\${req.body.id}\\Torch.js\\config.json`, JSON.stringify(new_config, null, '\t')).catch((err) => { console.log(err), res.status(500).send(err) })
            
            Essentials.UpdateFiles(req.body.id)
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