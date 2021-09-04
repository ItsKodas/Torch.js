const Permissions = require('../functions/permissions')

const fs = require('fs')

module.exports = function(app, SystemConfig) {

    app.get('/servers', async function(req, res) {
        if (!Permissions.Check(req.account.discord, 'servers')) return res.status(403).send()

        var servers = await fs.promises.readdir(SystemConfig.system.directory)

        console.log(servers)

        res.render('servers', { servers })
    })

}