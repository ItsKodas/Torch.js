const Permissions = require('../functions/permissions')

module.exports = function(app) {

    app.get('/mods', function(req, res) {
        if (!Permissions.Check(req.account.discord, 'mods')) return res.status(403).send()

        res.render('mods')
    })

}