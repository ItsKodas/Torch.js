function createStandaloneInstance() {
    if (!confirm("Are you sure you want to create a New Standalone Instance?")) return
    var formdata = new FormData()

    var missedFields = false
    var data = $('input[id^="instance_"]')
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
            if (status == 200) window.location.reload()
            else alert(text)
        })
        .catch(error => console.log('error', error))

    return false
}