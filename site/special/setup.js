const { spawn } = require('child_process')

const fs = require('fs')
const fetch = require('node-fetch')

module.exports = function (app, home_dir) {

    app.get('/', async (req, res) => {

        var server_ipv4 = await require('public-ip').v4()
        var default_dir = `${home_dir}\\Servers`

        res.render('setup', { server_ipv4, default_dir })
    })

    app.post('/', (req, res) => {

        var data = req.body

        var system_config = {
            license: {
                email: data.license_email,
                key: data.system_key
            },
            web: {
                setup_complete: true,
                port: data.system_port,
                community: data.system_community,
                address: data.system_address,
            },
            system: {
                directory: data.system_directory
            },
            discord: {
                id: data.discord_clientID,
                secret: data.discord_secret,
                token: data.discord_token
            }
        }

        var permissions = {
            overrides: {
                administrators: [data.discord_owner]
            }
        }


        if (!fs.existsSync(system_config.system.directory)) fs.mkdirSync(system_config.system.directory, { recursive: true }), console.log('Server Path did not exist so it has been created at: ' + system_config.system.directory)

        fs.writeFileSync('./local/system.json', JSON.stringify(system_config, null, '\t'))
        fs.writeFileSync('./local/permissions.json', JSON.stringify(permissions, null, '\t'))

        res.status(200).send('Configurations Saved!')
        spawn('util/nssm.exe start Torch.js', null, { detached: true, stdio: 'ignore' })
        process.exit()
    })

    app.post('/license', (req, res) => {
        fetch(`http://horizons.gg:9000/create?address=${req.body.license_address}&email=${req.body.license_email}&fname=${req.body.license_fname}&lname=${req.body.license_lname}`)
            .then(response => {
                response.text().then(text => res.status(response.status).send(text))

            })
            .catch(error => console.log(error))
    })

    app.get('/uninstall', (req, res) => {
        res.status(200).send()
        spawn('uninstall.bat', null, { detached: true, stdio: 'ignore' })
        process.exit()
    })

}