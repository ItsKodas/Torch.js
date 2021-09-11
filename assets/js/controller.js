function startServer(id) {
    var formdata = new FormData()
    formdata.append('id', id)
    formdata.append('action', 'start')

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

function stopServer(id) {
    var formdata = new FormData()
    formdata.append('id', id)
    formdata.append('action', 'stop')

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