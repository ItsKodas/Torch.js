//? Modules
const fs = require('fs')
const fetch = require('node-fetch')
const { exec } = require('child_process')



//!
//! Installation Check
//!

if (!fs.existsSync('local')) {
    fs.mkdirSync('local')

    //? Write Configs
    var SystemConfig = {
        web: {
            setup_complete: false,
            port: 8080
        }
    }

    fs.writeFileSync('./local/system.json', JSON.stringify(SystemConfig, null, '\t'))
}
if (!fs.existsSync('local/users')) fs.mkdirSync('local/users')

//? Install Service
if (process.argv[2] === 'install') {
    return exec(`.\\util\\nssm.exe install "Torch.js" ${__dirname}\\start.bat`, (err, stdout, stderr) => {
        if (err) return console.error(err)
    }).on('exit', code => {
        console.log(`Process Exit | Code ${code}`)
    })
}

//? Uninstall Service
if (process.argv[2] === 'uninstall') {
    fs.rmdirSync('./local', { recursive: true })

    exec('.\\util\\nssm.exe stop "Torch.js"', (err, stdout, stderr) => {
        if (err) return console.error(err)
    })

    exec('.\\util\\nssm.exe remove "Torch.js" confirm', (err, stdout, stderr) => {
        if (err) return console.error(err)
    }).on('exit', code => {
        console.log(`Process Exit | Code ${code}`)
        process.exit()
    })
    return
}



//!
//! Load Configurations
//!

SystemConfig = require('./local/system.json')



//!
//! Startup
//!

//? Start Express
const express = require('express')
var multer = require('multer')
var upload = multer()
const app = express()
const port = SystemConfig.web.port
app.set('view engine', 'ejs')
app.use(upload.array())
app.use(require('cookie-parser')())
app.use(express.static('assets'))

//? Socket.io
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)
server.listen(SystemConfig.web.port, () => {
    console.log(`listening on ${SystemConfig.web.address}:${SystemConfig.web.port}`)
    if (!SystemConfig.web.setup_complete) exec('start http://localhost:' + port)
});

//? Setup Pages
if (!SystemConfig.web.setup_complete) return require('./site/special/setup.js')(app, __dirname), console.log('Booting in Setup Mode.')

app.use(async function(req, res, next) {
    if (req.originalUrl === '/login' || req.originalUrl.includes('/callback')) return next()

    var user = JSON.parse(await new Promise((resolve, reject) => {
        var token = req.cookies.token
        if (!token) resolve(false)

        var requestOptions = {
            'method': 'GET',
            'headers': {
                'Authorization': 'Bearer ' + token
            }
        }

        fetch("http://discordapp.com/api/users/@me", requestOptions)
            .then(response => response.text())
            .then(result => {
                if (JSON.parse(result).code === 0) resolve(false)
                resolve(result)
            })
            .catch(error => console.log('error', error));
    }))


    if (!user) return res.redirect('/login')

    req.account = await new Promise((resolve, reject) => {
        fs.readFile(`./local/users/${user.id}.json`, function(err, data) {
            var account

            if (err) {
                account = {
                    token: req.cookies.token,
                    discord: user
                }
            } else {
                oldAccount = JSON.parse(data)
                account = {
                    token: req.cookies.token,
                    discord: user
                }
            }
            //fs.promises.writeFile(`./local/users/${user.id}.json`, JSON.stringify(account, null, '\t'))

            resolve(account)
        })
    })

    req.permissions = JSON.parse(await fs.promises.readFile(`./local/permissions.json`))

    next()

})

fs.readdir('./site', (err, files) => {
    if (err) return console.log(err)
    else {
        for (file of files) {
            if (file.includes('.js')) require('./site/' + file)(app, SystemConfig, io)
        }

        require('./site/discord/callback.js')(app, SystemConfig)
    }
})