const { spawn } = require('child_process')

const Permissions = require('../functions/permissions')

const fs = require('fs')

module.exports = function(app, SystemConfig) {

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

        spawn(`.\\resources\\update_torch.bat ${name} ${SystemConfig.system.directory.split(':')[0]} "${SystemConfig.system.directory}\\${name}"`, (err, stdout, stderr) => {
            if (err) return console.error(err)
            console.log(stdout)
        })


        return res.status(200).send()
    })

}