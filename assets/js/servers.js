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


socket.on('server_install_torch', function (data) {
    if (!data.time.includes('/')) {
        $('#setup_title').html(`Downloading Torch... ${data.time}`)
        $('#setup_download_torch').find('p').html(`Downloading Torch... (${data.percent}%)`)
    } else {
        $('#setup_title').html('Extracting Torch...')
        $('#setup_download_torch').html(`<p>Torch Downloaded! (100%)</p><i class="fas fa-check" style="color: #66ec54; margin: 1em 0 0 16.5em; position: absolute;"></i>`)
    }
})

socket.on('server_install_torch', () => {
    $('#setup_extract_files').html(`<p>Torch Extracted!</p><i class="fas fa-check" style="color: #66ec54; margin: 1em 0 0 16.5em; position: absolute;"></i>`)
})

socket.on('server_install_world', () => {
    $('#setup_import_world').html(`<p>World Imported!</p><i class="fas fa-check" style="color: #66ec54; margin: 1em 0 0 16.5em; position: absolute;"></i>`)
})

socket.on('server_install_config', () => {
    $('#setup_import_config').html(`<p>Config Imported!</p><i class="fas fa-check" style="color: #66ec54; margin: 1em 0 0 16.5em; position: absolute;"></i>`)
})