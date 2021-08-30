const { spawn } = require('child_process')

module.exports = function(app, home_dir) {

    app.get('/', async(req, res) => {

        var server_ipv4 = await require('public-ip').v4()
        var default_dir = `${home_dir}\\Servers`

        res.render('setup', { server_ipv4, default_dir })
    })

    app.get('/uninstall', (req, res) => {
        res.status(200).send()
        spawn('uninstall.bat', null, { detached: true, stdio: 'ignore' })
        process.exit()
    })

}