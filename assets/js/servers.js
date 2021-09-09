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


socket.on('server_install_download', function (data) {
    if (!data.time.includes('/')) {
        $('#setup_title').html(`Downloading Files... ${data.time}`)
        $('#setup_download_files').find('p').html(`Downloading Files... (${data.percent}%)`)
    } else {
        $('#setup_title').html('Extracting Files...')
        $('#setup_download_files').html(`<p>Files Downloaded! (100%)</p><i class="fas fa-check" style="color: #66ec54; margin: 1em 0 0 16.5em; position: absolute;"></i>`)
    }
})

socket.on('server_install_extract', () => {
    $('#setup_extract_files').html(`<p>Files Extracted!</p><i class="fas fa-check" style="color: #66ec54; margin: 1em 0 0 16.5em; position: absolute;"></i>`)
})