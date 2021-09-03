var fetch = require('node-fetch');

module.exports = function(app, SystemConfig) {

    app.get('/login', function(req, res) {
        res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${SystemConfig.discord.id}&redirect_uri=http%3A%2F%2F${SystemConfig.web.address}%3A${SystemConfig.web.port}%2Fdiscord%2Fcallback&response_type=code&scope=identify`)
    })

    app.get('/discord/callback', function(req, res) {
        var data = {
            client_id: SystemConfig.discord.id,
            redirect_uri: `http://${SystemConfig.web.address}:${SystemConfig.web.port}/discord/callback`,
            scope: "identify",
            client_secret: SystemConfig.discord.secret,
            grant_type: "authorization_code",
            code: req.query.code,
        }

        fetch('https://discord.com/api/v8/oauth2/token', {
                method: "POST",
                body: new URLSearchParams(data),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then(res => res.json())
            .then(response => {
                const { access_token } = response
                if (!access_token) return res.send('"access_token" was not found, please contact a server administrator if this error consists.'), console.log(response)

                res.cookie("token", access_token, { expires: new Date(Date.now() + 604800 * 1000) }).redirect('/')
            })
    })

}