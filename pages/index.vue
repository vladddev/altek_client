<template>
    <v-container fluid>
      <div v-if="department === 'Carrier'">
        <carriers-dashboard :cards="cards"></carriers-dashboard>
      </div>
      <div v-else-if="department === 'Shipper'">
        <shippers-dashboard :cards="cards"></shippers-dashboard>
      </div>
      <div v-else>
        <!-- <div class="text-center">
            <h2>Hello, {{ $store.getters.getCurrentUser.first_name + ' ' + $store.getters.getCurrentUser.last_name }}</h2>
        </div> -->
        <shippers-dashboard :cards="cards"></shippers-dashboard>
      </div>
    </v-container>
</template>

<script>
import shippersDashboard from '@/components/shippers-dashboard'
import carriersDashboard from '@/components/carriers-dashboard'
const axios = require('axios')

export default {
    data() {
        return {
            department: '',
            cards: {
                my_workers: '',
                my_users_stats: {
                    my_workers: [],
                    users_online: []
                },
                loads_in_progress: [],
                my_loads_stats: {
                    loads_in_progress: []
                },
                my_vehicles_stats: {}
            }
        }
    },
    created() {

        // this.$store.commit('changeCurrentPageTitle', 'Dashboard')

        this.$store.commit('updateToolbarData', {
               title: 'Dashboard'
        })

        const self = this

        this.$globalEvents.$on('renewCurrentUser', () => {
            const accessToken =  this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')
            const user = this.$store.getters.getCurrentUser
            this.department = user.department

            axios({
                method: 'get',
                url: self.$store.state.backendUrl + '/backend/api/dashboard',
                headers: {'Authorization': 'JWT ' + accessToken},
            })
            .then(function (response) {
                self.cards = response.data
            })
            .catch(function (error) {
                console.log(error);
            });
        })

        this.$globalEvents.$on('heartbeat', () => {
            const accessToken =  this.$store.getters.getToken

            if (!this.department || !accessToken) {
                return
            }

            axios({
                method: 'get',
                url: self.$store.state.backendUrl + '/backend/api/dashboard/',
                headers: {'Authorization': 'JWT ' + accessToken},
            })
            .then(function (response) {
                self.cards = response.data
            })
            .catch(function (error) {
                console.log(error);
            });
        })

        if (this.$store.getters.getCurrentUser) {
            this.$globalEvents.$emit('renewCurrentUser')
        }
    },
    beforeDestroy() {
        this.$globalEvents.$off('renewCurrentUser')
        this.$globalEvents.$off('heartbeat')
    },
    components: {
        shippersDashboard,
        carriersDashboard
    },
}
</script>

