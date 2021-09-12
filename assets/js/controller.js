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