export default function ({ store, redirect }) {
    if (localStorage.getItem('etl-user-token') || store.getters.hasToken) {
        let localTokens = JSON.parse(localStorage.getItem('etl-user-token'));

        if (!localTokens.access && !store.getters.hasToken) {
            redirect('/login/')
        }
                
    } else {
        redirect('/login/')
    }
}

