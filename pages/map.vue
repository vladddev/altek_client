<template>
    <v-row>
        <v-col>
            <v-card>
                <simple-map v-if="!loading" :locData="mapData"></simple-map>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
    import simpleMap from '@/components/maps/simple-map'
    const axios = require('axios');

  export default {
    layout: 'map',
    data: () => ({
        loading: true
    }),
    methods: {
        getMap() {
            const self = this
            console.log(self.$route);
            axios({
                method: 'get',
                url: self.$store.state.backendUrl + '/backend/api/guest/map/?company=' + self.$route.query.company + '&load=' + self.$route.query.load
            })
            .then(function (response) {
                if (response.data.success === false) {
                    alert(response.data.result)
                }

                self.loading = false


                self.mapData = {
                    status: true,
                    locs: response.data.result
                }

            })
            .catch(function (error) {
                console.log(error);
            });
        }
    },
    mounted() {
        this.getMap()
    },
    components: {
        simpleMap
    }
  }

</script>
