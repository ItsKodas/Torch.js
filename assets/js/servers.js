var socket = io()

function createNewServer() {
    var formdata = new FormData()

    var missedFields = false
    var data = $('input[id^="server_"]')
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

    fetch("/servers/create/standalone", requestOptions)
        .then(async response => {
            var text = await response.text()
            var status = response.status
            if (status == 200) {
                $('[id^="createSA_"]').hide()
                $('[id^="installSA_"]').show()
            } else alert(text)
        })
        .catch(error => console.log('error', error))

    return false
}


socket.on('server_install_progress', function(data) {
    if (data.time.includes('/')) data.time = '...Extracting Files'
    $('#installSA_progress').attr('value', data.percent)
    $('#installSA_progress_percent').html(`${data.percent}%`)
    $('#installSA_progress_time').html(data.time)
})

socket.on('server_install_complete', function(data) {
    alert('Instance Successfully Installed | Code: ' + data.code)
    $('[id^="createSA_"]').show()
    $('[id^="installSA_"]').hide()
})