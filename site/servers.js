const { spawn } = require('child_process')

const Permissions = require('../functions/permissions')

const fs = require('fs')
const ncp = require('ncp').ncp

var busy = false

module.exports = async function (app, SystemConfig, io) {

    var socket = await io.on('connection', async (socket) => socket)

    app.get('/servers', async function (req, res) {
        if (!Permissions.Check(req.account.discord, 'servers')) return res.status(403).send()

        var data = {
            servers: [],
            presets: {}
        }

        try {
            data.servers = await fs.promises.readdir(SystemConfig.system.directory)

            data.presets['worlds'] = await fs.promises.readdir('./presets/instance/world')
            data.presets['configs'] = await fs.promises.readdir('./presets/instance/config')

            var nexus = await fs.existsSync('resources/nexus')

            res.render('servers', { data, nexus })
        } catch (e) { return console.log(e), res.send(e) }

    })



    app.post('/servers/create', async function (req, res) {
        if (!Permissions.Check(req.account.discord, 'create_server')) return res.status(403).send("You do not have permission to do this.")
        if (busy) return res.status(400).send("Server is busy.")

        var name = req.body.server_name.trim()
        req.body.server_config_preset = req.body.server_config_preset.replace(' ', '_'), req.body.server_config_preset += '.xml'

        if (!name.match(/^[a-zA-Z0-9-_]+$/)) return res.status(400).send("Instance name contains invalid characters.")
        if (fs.existsSync(`${SystemConfig.system.directory}\\${name}`)) return res.status(400).send("Instance name is already in use.")
        if (req.body.server_type !== 'Standalone' && !fs.existsSync(`.\\resources\\nexus`)) return res.status(400).send("Nexus is required for Sectors.")
        if (!fs.existsSync(`.\\presets\\instance\\world\\${req.body.server_world_preset}`) || !fs.existsSync(`.\\presets\\instance\\config\\${req.body.server_config_preset}`)) return res.status(400).send("Preset does not exist.")

        busy = true
        await fs.promises.mkdir(`${SystemConfig.system.directory}\\${name}\\Instance\\Saves\\World`, { recursive: true }).catch(err => res.status(500).send(err), busy = false)

        var sectorInstaller = spawn(".\\resources\\update_torch.bat", [name, SystemConfig.system.directory.split(':')[0], `${SystemConfig.system.directory}\\${name}`])
        sectorInstaller.stderr.on('data', data => {
            var data = data.toString()
            if (!data.includes('%')) return

            var packet = data.split(' ')

            var percent, time

            for (value of packet) {
                if (value.includes('%')) percent = value
                if (value.includes('\r\n')) time = value
            }
            percent = percent.replace('%', '')
            time = time.replace('\r\n', '')

            socket.emit('server_install_torch', { percent, time })
        })
        sectorInstaller.on('close', () => { socket.emit('server_install_torch'); postInstallation() })


        function postInstallation() {
            ncp(`.\\presets\\instance\\world\\${req.body.server_world_preset}`, `${SystemConfig.system.directory}\\${name}\\Instance\\Saves\\World`, async function (err) {
                if (err) return console.log(err), res.status(500).send(err), busy = false
                socket.emit('server_install_world')

                var config_file = await fs.promises.readFile(`.\\presets\\instance\\config\\${req.body.server_config_preset}`).catch(err => res.status(500).send(err))
                await fs.promises.writeFile(`${SystemConfig.system.directory}\\${name}\\Instance\\Saves\\World\\Sandbox_config.sbc`, config_file).catch(err => res.status(500).send(err))
                socket.emit('server_install_config')

                busy = false
            })
        }


        return res.status(200).send()

    })

}