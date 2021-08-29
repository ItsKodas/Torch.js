//? Modules
const fs = require('fs')
const { exec } = require('child_process')



//!
//! Installation Check
//!

if (!fs.existsSync('local')) {
    fs.mkdirSync('local')

    //? Write Configs
    var toolboxConfig = {
        web: {
            setup_complete: false,
            port: 8080
        }
    }

    fs.writeFileSync('./local/toolbox.json', JSON.stringify(toolboxConfig, null, '\t'))
}

//? Install Service
if (process.argv[2] === 'install') {
    return exec(`.\\util\\nssm.exe install "Sector Toolbox" ${__dirname}\\start.bat`, (err, stdout, stderr) => {
        if (err) return console.error(err)
    }).on('exit', code => {
        console.log(`Process Exit | Code ${code}`)
    })
}

//? Uninstall Service
if (process.argv[2] === 'uninstall') {
    fs.rmdirSync('./local', { recursive: true })
    return exec('.\\util\\nssm.exe remove "Sector Toolbox"', (err, stdout, stderr) => {
        if (err) return console.error(err)
    }).on('exit', code => {
        console.log(`Process Exit | Code ${code}`)
    })
}



//!
//! Load Configurations
//!

toolbox = require('./local/toolbox.json')



//!
//! Startup
//!

//? Start Express
const express = require('express')
const app = express()
const port = toolbox.web.port
app.set('view engine', 'ejs')
app.use(express.static('assets'))
app.listen(port, () => {
    if (!toolbox.web.setup_complete) exec('start http://localhost:' + port)
})

//? Setup Pages
if (!toolbox.web.setup_complete) return require('./site/setup.js')(app)