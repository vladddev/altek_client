export default function ({store, route, redirect}) {
    const axios = require('axios');
    const accessToken = store.getters.getAccessToken
    console.log(route);
    axios({
        method: 'get',
        url: 'https://altekloads.com/backend/api/check-permissions/',
        params: {
            page: route.path
        },
        headers: {'Authorization': 'JWT ' + accessToken},
    })
    .then(function (response) {
        console.log(response);
        if (!response.data.allow) {
            redirect('/')
        }
    })
    .catch(function (error) {
        console.log(error);
        redirect('/')
    });

}
