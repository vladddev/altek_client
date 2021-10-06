<template>
  <div v-if="load_data === ''" class="h-100 centered">
    <v-progress-circular
      :size="100"
      color="blue"
      indeterminate
    ></v-progress-circular>
  </div>
  <div
    v-else
  >
    {{ load_data }}
  </div>
</template>

<script>

const axios = require('axios')

export default {
  name: 'shipment-details',
  props: ['load_id'],
  data() {
    return {
      load_data: ''
    }
  },
  watch: {},
  methods: {},
  mounted() {

  },
  created() {
    const self = this;
    const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')

    axios({
      method: 'get',
      url: self.$store.state.backendUrl + '/backend/api/loads/' + self.load_id + '/',
      headers: {'Authorization': 'JWT ' + accessToken},
    })
      .then(function (response) {
        // self.load_data = response.data
      }).catch(function (error) {
      console.log(error);
    });
  },
  beforeDestroy() {

  }
}

</script>
