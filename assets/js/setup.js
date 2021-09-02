function uninstall() {
    if (!confirm("Are you sure you want to uninstall SectorToolbox?")) return
    fetch("/uninstall")
}

function submit_configurations() {
    if (!confirm("Finalize System Configurations?")) return
    var formdata = new FormData()

    var data = $('[id^=system_]')
    for (id of data) {
        formdata.append(id.id, id.value)
    }

    var requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
    };

    fetch("/", requestOptions)
        .then(async response => {
            var text = await response.text()
            var status = response.status
            if (status == 200) window.location.reload()
            else alert(text)
        })
        .catch(error => console.log('error', error))

    return false
}