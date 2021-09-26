var socket = io()

function createNewServer() {
    var formdata = new FormData()

    var missedFields = false
    var data = $('[id^="server_"]')
    for (id of data) {
        if (!id.value) $(`#${id.id}`).css('border-color', 'red'), missedFields = true
        else $(`#${id.id}`).css('border-color', 'green')
        formdata.append(id.id, id.value)
    }
    if (missedFields) return

    var requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
    };

    fetch("/servers/create", requestOptions)
        .then(async response => {
            var text = await response.text()
            var status = response.status
            if (status == 200) {

                $('#setup_cancel').hide()
                $('#setup_next').hide()
                $('#setup_content').hide()


                $('#setup_title').html('Downloading Files...')
                $('#setup_installing').show()


            } else alert(text)
        })
        .catch(error => console.log('error', error))

    return false
}

function importServer(id) {
    var formdata = new FormData()
    formdata.append('id', id)
    formdata.append('action', 'import')

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
            } else alert('An error has occured, please try again.'), window.location.reload()
        })
        .catch(error => console.log('error', error))
}

function resetServer(id) {
    if (!confirm('Are you sure you want to reset this servers config?')) return

    var formdata = new FormData()
    formdata.append('id', id)
    formdata.append('action', 'reset')

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
            } else alert('An error has occured, please try again.'), window.location.reload()
        })
        .catch(error => console.log('error', error))
}


socket.on('server_install_torch', function (data) {
    if (!data.time.includes('/')) {
        $('#setup_title').html(`Downloading Torch... ${data.time}`)
        $('#setup_download_torch').find('p').html(`Downloading Torch... (${data.percent}%)`)
    } else {
        $('#setup_title').html('Extracting Torch...')
        $('#setup_download_torch').html(`<p>Torch Downloaded!</p><i class="fas fa-check" style="color: #66ec54; margin: 1em 0 0 16.5em; position: absolute;"></i>`)
    }
})

socket.on('server_install_extract_torch', () => {
    $('#setup_extract_torch').html(`<p>Torch Extracted!</p><i class="fas fa-check" style="color: #66ec54; margin: 1em 0 0 16.5em; position: absolute;"></i>`)
})

socket.on('server_install_world', () => {
    $('#setup_import_world').html(`<p>World Imported!</p><i class="fas fa-check" style="color: #66ec54; margin: 1em 0 0 16.5em; position: absolute;"></i>`)
})

socket.on('server_install_config', () => {
    $('#setup_title').html('Preparing SteamCMD...')
    $('#setup_import_config').html(`<p>Config Imported!</p><i class="fas fa-check" style="color: #66ec54; margin: 1em 0 0 16.5em; position: absolute;"></i>`)
})

socket.on('server_install_steam_prep', () => {
    $('#setup_prep_steam').find('p').html(`Preparing SteamCMD...`)
})

socket.on('server_install_cmd_download', (data) => {
    if (parseInt(data.percent) < 80) {
        $('#setup_title').html('Downloading SteamCMD...')
        $('#setup_prep_steam').find('p').html(`Downloading SteamCMD... (${data.percent}%)`)
    } else {
        $('#setup_title').html('Finalizing SteamCMD...')
        $('#setup_prep_steam').html(`<p>SteamCMD Downloaded!</p><i class="fas fa-check" style="color: #66ec54; margin: 1em 0 0 16.5em; position: absolute;"></i>`)
    }
})

socket.on('server_install_steam_ready', () => {
    $('#setup_title').html('Download Will Start Shortly...')
    $('#setup_prep_steam').html(`<p>SteamCMD Downloaded!</p><i class="fas fa-check" style="color: #66ec54; margin: 1em 0 0 16.5em; position: absolute;"></i>`)
    $('#setup_prep_download').html(`<p>SteamCMD Ready!</p><i class="fas fa-check" style="color: #66ec54; margin: 1em 0 0 16.5em; position: absolute;"></i>`)
    $('#setup_download_se').find('p').html(`Download SEDS (stby 3m~)`)
})

socket.on('server_install_steam_download', (data) => {
    var state
    if (data.code === '0x3') state = 'Reconfiguring'
    if (data.code === '0x11') state = 'Preallocating'
    if (data.code === '0x61') state = 'Downloading'
    if (data.code === '0x81') state = 'Verifying'
    if (data.code === '0x101') state = 'Extracting'

    $('#setup_title').html(`${state} SEDS...`)
    $('#setup_download_se').find('p').html(`${state} SEDS... (${data.percent}%)`)
})

socket.on('server_install_steam_done', () => {
    $('#setup_title').html('Preparing to Patch...')
    $('#setup_download_se').html(`<p>SEDS Installed!</p><i class="fas fa-check" style="color: #66ec54; margin: 1em 0 0 16.5em; position: absolute;"></i>`)
})

socket.on('server_install_seds_patching', (data) => {
    $('#setup_title').html('Patching SEDS...')
    $('#setup_patch_seds').find('p').html(`Patching SEDS... (${data.stage})`)
})

socket.on('server_install_seds_done', (data) => {
    $('#setup_title').html(`${data.server} Setup Complete!`)
    $('#setup_patch_seds').html(`<p>SEDS Ready!</p><i class="fas fa-check" style="color: #66ec54; margin: 1em 0 0 16.5em; position: absolute;"></i>`)

    setTimeout(() => { window.location.href = `/server?id=${data.server}` }, 3000)
})



socket.on('server_failure', (data) => {
    alert(data.error)
    window.location.reload()
})