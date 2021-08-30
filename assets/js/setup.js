function uninstall() {
    if (!confirm("Are you sure you want to uninstall SectorToolbox?")) return
    fetch("/uninstall")
}

function system_next() {
    if (!confirm("Finalize System Configurations?")) return
    var formdata = new FormData(document.system_configurations)
    console.log(formdata)

    /*var requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
    };

    fetch("/trade/flagged-options", requestOptions)
        .then(response => response.json())
        .then(result => {
            console.log(result.status)
            if (result.status === 200) window.location.reload()
                //else return alert(result.body)
        })
        .catch(error => console.log('error', error))*/

    return false
}