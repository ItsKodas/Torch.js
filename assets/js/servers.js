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

                $('#setup_cancel').fadeOut('slow')
                $('#setup_next').fadeOut('slow')
                $('#setup_content').fadeOut('slow')


                $('#setup_title').html('Downloading Files...')
                $('#setup_installing').fadeIn('slow')


            } else alert(text)
        })
        .catch(error => console.log('error', error))

    return false
}


socket.on('server_install_progress', function(data) {
    if (data.time.includes('/')) return $('#setup_title').html('Extracting Files...')
    $('#setup_title').html(`Downloading | ${data.percent}% | ${data.time}`)
    $('#setup_progress').attr('value', data.percent)
})

socket.on('server_install_complete', function(data) {
    alert('Sever Successfully Installed | Code: ' + data.code)
})