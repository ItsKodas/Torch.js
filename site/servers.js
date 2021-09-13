const { spawn } = require('child_process')

const Permissions = require('../functions/permissions')
const Discord = require('../functions/discord')

const fs = require('fs')
const Password = require('generate-password')
const ncp = require('ncp').ncp

module.exports = async function (app, SystemConfig, io) {

    var socket = await io.on('connection', async (socket) => socket)

    app.get('/servers', async function (req, res) {
        if (!Permissions.Check(req.account.discord, 'server.list')) return res.status(403).send()

        console.log(process.license)

        var data = {
            servers: [],
            presets: {}
        }

        try {
            var servers = await fs.promises.readdir(SystemConfig.system.directory)
            for (server of servers) {

                if (!fs.existsSync(`${SystemConfig.system.directory}\\${server}\\Torch.js`)) {
                    data.servers.push({ id: server, notImported: true })
                    continue
                }

                var config = await fs.promises.readFile(`${SystemConfig.system.directory}\\${server}\\Torch.js\\config.json`).catch(() => { console.log(`${server} has no config.json`) })
                if (!config) {
                    data.servers.push({ id: server, error: true })
                    continue
                }

                data.servers.push(JSON.parse(config))
            }

            data.presets['worlds'] = await fs.promises.readdir('./presets/instance/world')
            data.presets['configs'] = await fs.promises.readdir('./presets/instance/config')

            var nexus = await fs.existsSync('resources/nexus')

            res.render('servers', { data, nexus })
        } catch (e) { return console.log(e), res.send(e) }

    })



    app.post('/servers/create', async function (req, res) {
        if (!Permissions.Check(req.account.discord, 'server.create')) return res.status(403).send("You do not have permission to do this.")
        if (await fs.existsSync('.\\BUSY')) return res.status(400).send("Server is busy.")

        var name = req.body.server_id.trim()
        req.body.server_config_preset = req.body.server_config_preset.replace(' ', '_'), req.body.server_config_preset += '.xml'

        if (!name.match(/^[a-zA-Z0-9-_]+$/)) return res.status(400).send("Instance name contains invalid characters.")
        if (fs.existsSync(`${SystemConfig.system.directory}\\${name}`)) return res.status(400).send("Instance name is already in use.")
        if (req.body.server_type !== 'Standalone' && !fs.existsSync(`.\\resources\\nexus`)) return res.status(400).send("Nexus is required for Sectors.")
        if (!fs.existsSync(`.\\presets\\instance\\world\\${req.body.server_world_preset}`) || !fs.existsSync(`.\\presets\\instance\\config\\${req.body.server_config_preset}`)) return res.status(400).send("Preset does not exist.")

        await fs.promises.writeFile('.\\BUSY', '').catch(e => console.log(e))

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
        sectorInstaller.on('close', () => { socket.emit('server_install_extract_torch'); postInstallation() })


        function postInstallation() {
            ncp(`.\\presets\\instance\\world\\${req.body.server_world_preset}`, `${SystemConfig.system.directory}\\${name}\\Instance\\Saves\\World`, async function (err) {
                if (err) return console.log(err), res.status(500).send(err), deleteServer()
                socket.emit('server_install_world')

                var config_file = await fs.promises.readFile(`.\\presets\\instance\\config\\${req.body.server_config_preset}`).catch(err => console.log(err))
                await fs.promises.writeFile(`${SystemConfig.system.directory}\\${name}\\Instance\\Saves\\World\\Sandbox_config.sbc`, config_file).catch(err => console.log(err))

                var torch_cfg = await fs.promises.readFile(`.\\resources\\torch\\torch.cfg`).catch(err => console.log(err))
                torch_cfg = torch_cfg.toString().replace('%SERVER_NAME%', name)
                torch_cfg = torch_cfg.toString().replace('%INSTANCE_PATH%', `${SystemConfig.system.directory}\\${name}\\Instance`)
                await fs.promises.writeFile(`${SystemConfig.system.directory}\\${name}\\Torch.cfg`, torch_cfg).catch(err => console.log(err))

                socket.emit('server_install_config')

                downloadSpaceEngineers()
            })
        }

        function downloadSpaceEngineers() {
            console.log('test')

            var seDownloader = spawn(`${SystemConfig.system.directory}\\${name}\\${name}.Server.exe`)
            seDownloader.stdout.on('data', data => {
                console.log(data.toString())
                data = data.toString()
                if (data.includes('SteamCMD downloaded successfully')) return socket.emit('server_install_steam_prep')
                if (data.includes('SteamCMD: [ ')) return socket.emit('server_install_cmd_download', { percent: data.split(': [ ')[1].split('%')[0] })
                if (data.includes('Waiting for user info')) return socket.emit('server_install_steam_ready')
                if (data.includes('Update state')) return socket.emit('server_install_steam_download', { percent: data.split('progress:')[1].split('(')[0].trim(), code: data.split('Update state (')[1].split(')')[0] })
                if (data.includes("Success! App '298740' fully installed")) return socket.emit('server_install_steam_done')
                if (data.includes('PatchManager: Patched')) return socket.emit('server_install_seds_patching', { stage: data.split('Patched ')[1].split('.')[0] })
                if (data.includes("Patching done")) return seDownloader.kill(), postSEDS()

                if (data.includes('SteamCMD: Error!')) return socket.emit('server_failure', { error: data.split('SteamCMD: ')[1] }), seDownloader.kill(), deleteServer()
            })
            sectorInstaller.on('close', () => console.log('Installer Closed.'))
        }

        async function postSEDS() {
            console.log(`${name} Installation Complete!`)

            var config = {
                id: name,
                port: req.body.server_game_port,
                rcon: req.body.server_rcon_port,
                rcon_password: 'sIHb6F4ew//D1OfQInQAzQ==',
                type: req.body.server_type,
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
                restart_times: []
            }

            await fs.promises.mkdir(`${SystemConfig.system.directory}\\${name}\\Torch.js\\Presets\\Server`, { recursive: true }).catch(err => console.log(err))
            await fs.promises.mkdir(`${SystemConfig.system.directory}\\${name}\\Torch.js\\Presets\\World`, { recursive: true }).catch(err => console.log(err))
            await fs.promises.writeFile(`${SystemConfig.system.directory}\\${name}\\Torch.js\\config.json`, JSON.stringify(config, null, '\t')).catch(err => console.log(err))

            socket.emit('server_install_seds_done', { server: name })

            await fs.promises.unlink('.\\BUSY').catch(() => console.log('Server not Busy.')), Discord.Notification(`⭐ New Instance Created (${name})`, '#9f39ed')
        }

        async function deleteServer() {
            await fs.promises.rmdir(`${SystemConfig.system.directory}\\${name}`, { recursive: true }).catch(err => console.log(err))
            await fs.promises.unlink('.\\BUSY').catch(() => { console.log('Server not Busy.') })
        }



        return res.status(200).send()

    })

}