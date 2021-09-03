const Permissions = require('../functions/permissions')

module.exports = function(app) {

    app.get('/', function(req, res) {
        if (!Permissions.Check(req.account.discord, 'dashboard')) return res.status(403).send()

        res.render('dashboard')
    })

}