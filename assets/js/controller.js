function sendServerAction(id, action) {
    var formdata = new FormData()
    formdata.append('id', id)
    formdata.append('action', action)

    var requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
    };

    fetch(`/server`, requestOptions)
        .then(async response => {
            var text = await response.text()
            var status = response.status
            if (status == 200) {
                window.location.reload()
            } else alert(text)
        })
        .catch(error => console.log('error', error))
}

function fetchConfig() {
    var preset = $('#server_config_preset').find(':selected').val().split('%')

    var formdata = new FormData()
    formdata.append('cfg', preset[1])
    formdata.append('location', preset[0])

    var requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
    };

    var urlParams = new URLSearchParams(window.location.search)

    fetch(`/server/preset?id=${urlParams.get('id')}`, requestOptions)
        .then(async response => {
            var text = await response.text()
            var status = response.status
            if (status == 200) {
                $('#server-editor').val(text)
                $('#preset-name').val($('#server_config_preset').find(':selected').text().split(' | ')[0])
            } else alert(text)
        })
        .catch(error => console.log('error', error))
} fetchConfig()

function saveConfig() {
    var preset = $('#server_config_preset').find(':selected').val().split('%')

    var formdata = new FormData()
    formdata.append('cfg', preset[1])
    formdata.append('location', preset[0])
    formdata.append('data', $('#server-editor').val())
    formdata.append('name', $('#preset-name').val())

    var requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
    };

    var urlParams = new URLSearchParams(window.location.search)

    fetch(`/server/preset/save?id=${urlParams.get('id')}`, requestOptions)
        .then(async response => {
            var text = await response.text()
            var status = response.status
            if (status == 200) {
                window.location.reload()
            } else alert(text)
        })
        .catch(error => console.log('error', error))
}

function createConfig() {
    $('#server_config_preset').find(':selected').text('NewConfig')
    $('#server_config_preset').find(':selected').val('local%NewConfig.cfg')
    $('#preset-name').val('NewConfig')
    saveConfig()
}

function globalConfig() {
    var preset = $('#server_config_preset').find(':selected').val().split('%')
    preset[0] = 'global'
    $('#server_config_preset').find(':selected').val(preset.join('%'))
    saveConfig()
}

function deleteConfig() {
    var preset = $('#server_config_preset').find(':selected').val().split('%')

    var formdata = new FormData()
    formdata.append('cfg', preset[1])
    formdata.append('location', preset[0])

    var requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
    };

    var urlParams = new URLSearchParams(window.location.search)

    fetch(`/server/preset/delete?id=${urlParams.get('id')}`, requestOptions)
        .then(async response => {
            var text = await response.text()
            var status = response.status
            if (status == 200) {
                window.location.reload()
            } else alert(text)
        })
        .catch(error => console.log('error', error))
}

function applyServerSettings() {
    var formdata = new FormData()
    formdata.append('world_name', $('#world-name').val())
    formdata.append('server_name', $('#server-name').val())
    formdata.append('server_port', $('#server-port').val())
    formdata.append('rcon_port', $('#rcon-port').val())

    var requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
    };

    var urlParams = new URLSearchParams(window.location.search)

    fetch(`/server/settings/update?id=${urlParams.get('id')}`, requestOptions)
        .then(async response => {
            var text = await response.text()
            var status = response.status
            if (status == 200) {
                window.location.reload()
            } else alert(text)
        })
        .catch(error => console.log('error', error))
}

function updateDiscord() {
    fetch(`/server/discord/channels?guild=${$('#discord-guild').find(':selected').val()}`)
        .then(async response => {
            var text = await response.text()
            var status = response.status
            if (status == 200) {
                var channels = JSON.parse(text)
                var channelSelect = ''
                for (channel of channels) {
                    if (channel.type !==  'GUILD_TEXT') continue
                    channelSelect += `<option value="${channel.id}">${channel.name}</option>`
                }
                $('#discord-notifications-channel').html(channelSelect)
            } else alert(text)
        })
} updateDiscord()

function applyDiscord() {

    var formdata = new FormData()
    formdata.append('guild', $('#discord-guild').find(':selected').val())
    formdata.append('channel', $('#discord-notifications-channel').find(':selected').val())

    var requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
    };

    var urlParams = new URLSearchParams(window.location.search)

    fetch(`/server/discord/apply?id=${urlParams.get('id')}`, requestOptions)
        .then(async response => {
            var text = await response.text()
            var status = response.status
            if (status == 200) {
                alert('Discord settings have been Applied!')
            } else alert(text)
        })
}