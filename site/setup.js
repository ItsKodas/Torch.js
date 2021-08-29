const { spawn } = require('child_process')

module.exports = function(app) {

    app.get('/', (req, res) => {
        res.render('setup')
    })

    app.get('/uninstall', (req, res) => {
        res.status(200).send()
        spawn('uninstall.bat', { detached: true, stdio: 'ignore' })
        process.exit()
    })

}