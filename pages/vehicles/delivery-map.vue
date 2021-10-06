<template>
  <v-row justify="center">
    DELIVERY MAP
  </v-row>
</template>

<script>
  const axios = require('axios');
  export default {
    created() {
      this.$globalEvents.$on('refreshTokens', () => {
        const accessToken = this.$store.getters.getToken

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/check-permissions/',
            params: {
              page: self.$router.history.current.path
            },
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
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
    mounted() {
      this.$store.commit('updateToolbarData', {
        title: 'Delivery map',
      })
    },
    beforeDestroy() {
      this.$store.commit('updateToolbarData', {})
      this.$globalEvents.$off('refreshTokens')
    },
  }

</script>
