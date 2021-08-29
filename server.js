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
            port: 8080
        }
    }

    fs.writeFileSync('./local/toolbox.json', JSON.stringify(toolboxConfig, null, '\t'))

}



//!
//! Load Configurations
//!

toolbox = require('./local/toolbox.json')



//!
//! Startup
//!

if (toolbox.service_enabled) {
    //? Install Service
    exec('.\\util\\nssm.exe install "Sector Toolbox" .\\util\\start.bat', (err, stdout, stderr) => {
        if (err) return console.error(err)
    }).on('exit', code => {
        console.log('Process has exited with code ' + code)
    })
}