const SystemConfig = require('../local/system.json')
const Permissions = require('./permissions')
const Controls = require('./controls')

const fs = require('fs')
const Gamedig = require('gamedig');

module.exports = {

    ReplaceXml: function (file, field, replace) {
        var extra = file.split(`<${field}`)[1].split(`>`)[0]
        var value = file.split(`<${field}${extra}>`)[1].split(`</${field}>`)[0]
        if (!replace) return value
        return file.replace(`<${field}${extra}>${value}</${field}>`, `<${field}${extra}>${replace}</${field}>`)
    },

    UpdateFiles: async function (id) {
        var config = await fs.promises.readFile(`${SystemConfig.system.directory}\\${id}\\Torch.js\\config.json`).catch((err) => console.log(err))
        if (!config) return false
        config = JSON.parse(config)

        //? Plugins
        var mandatory_plugins = ['c1b62cf3-9566-4cb5-97cc-d8d2368bc0a6', 'cbfdd6ab-4cda-4544-a201-f73efa3d46c0']
        for (plugin of mandatory_plugins) {
            if (!config.plugins.includes(plugin)) config.plugins.push(plugin)
        }
        var torch_cfg = (await fs.promises.readFile(`${SystemConfig.system.directory}\\${id}\\Torch.cfg`).catch((err) => console.log(err))).toString()

        var plugins = '<Plugins>\n'
        for (plugin of config.plugins) {
            plugins += `\t\t<guid>${plugin}</guid>\n`
        }
        plugins += '\t</Plugins>'

        if (torch_cfg.includes('<Plugins />')) torch_cfg = torch_cfg.replace('<Plugins />', plugins)
        else {
            this.ReplaceXml(torch_cfg, 'Plugins', plugins)
        }

        await fs.promises.writeFile(`${SystemConfig.system.directory}\\${id}\\Torch.cfg`, torch_cfg).catch((err) => console.log(err))


        //? Rcon
        await fs.promises.copyFile(`.\\resources\\plugins\\asset\\RconPlugin.zip`, `${SystemConfig.system.directory}\\${id}\\Plugins\\RconPlugin.zip`).catch((err) => console.log(err))
        var rcon_cfg = (await fs.promises.readFile(`.\\resources\\plugins\\config\\Rcon.cfg`).catch(() => { console.log('Failed to Read Rcon.cfg!') })).toString()
        if (fs.existsSync(`${SystemConfig.system.directory}\\${id}\\Instance\\Rcon.cfg`)) rcon_cfg = (await fs.promises.readFile(`${SystemConfig.system.directory}\\${id}\\Instance\\Rcon.cfg`).catch((err) => console.log(err))).toString()
        
        if (config.rcon_password === 'sIHb6F4ew//D1OfQInQAzQ==') rcon_cfg = this.ReplaceXml(rcon_cfg, 'PassHash', 'sIHb6F4ew//D1OfQInQAzQ==')
        rcon_cfg = this.ReplaceXml(rcon_cfg, 'Port', config.rcon)
        await fs.promises.writeFile(`${SystemConfig.system.directory}\\${id}\\Instance\\Rcon.cfg`, rcon_cfg).catch((err) => console.log(err))


        return true
    }

}