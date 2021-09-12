const Permissions = require('../functions/permissions')

module.exports = function(app) {

    app.get('/plugins', function(req, res) {
        if (!Permissions.Check(req.account.discord, 'plugins')) return res.status(403).send()

        res.render('plugins')
    })

}