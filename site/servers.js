const { spawn } = require('child_process')

const Permissions = require('../functions/permissions')

const fs = require('fs')

module.exports = async function(app, SystemConfig, io) {

    var socket = await io.on('connection', async(socket) => socket)

    app.get('/servers', async function(req, res) {
        if (!Permissions.Check(req.account.discord, 'servers')) return res.status(403).send()

        var servers = await fs.promises.readdir(SystemConfig.system.directory)

        console.log(servers)

        res.render('servers', { servers })
    })



    app.post('/servers/create/standalone', async function(req, res) {
        if (!Permissions.Check(req.account.discord, 'create_instance')) return res.status(403).send("You do not have permission to do this.")

        var name = req.body.instance_name.trim()

        if (!name.match(/^[a-zA-Z0-9-_]+$/)) return res.status(400).send("Instance name contains invalid characters.")
        if (fs.existsSync(`${SystemConfig.system.directory}\\${name}`)) return res.status(400).send("Instance name is already in use.")

        await fs.promises.mkdir(`${SystemConfig.system.directory}\\${name}`).catch(err => res.status(500).send(err))

        var sectorInstaller = spawn(".\\resources\\update_torch.bat", [name, SystemConfig.system.directory.split(':')[0], `${SystemConfig.system.directory}\\${name}`])
        sectorInstaller.stdout.on('data', data => {
            console.log('Log', data.toString())
        })
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

            socket.emit('server_install_progress', { percent, time })
        })
        sectorInstaller.on('close', code => socket.emit('server_install_complete', { code }))

        return res.status(200).send()

    })

}