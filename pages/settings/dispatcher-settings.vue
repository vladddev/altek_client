<template>
    <v-row justify="center">
        DISPATCHER SETTINGS
    </v-row>
</template>


<script>
const axios = require('axios');
export default {
    created() {
        const self = this

        this.$globalEvents.$on('refreshTokens', () => {
            const accessToken = this.$store.getters.getToken

            axios({
                method: 'get',
                url: self.$store.state.backendUrl + '/backend/api/check-permissions/',
                params: {
                    page: self.$router.history.current.path
                },
                headers: {'Authorization': 'JWT ' + accessToken},
            })
            .then(function (response) {
                console.log(response);
                if (!response.data.allow) {
                    self.$router.push('/')
                }
            })
            .catch(function (error) {
                console.log(error);
            });

        })
    },
    beforeDestroy() {
        this.$globalEvents.$off('refreshTokens')
    },
}
</script>
