<template>
  <v-container fluid>
    <v-data-table :headers="headers" :items="bids" :options.sync="options" :server-items-length="totalBids"
      :loading="loading" :disabled="loading" @click:row="openChat" class="my-bids-table elevation-1">
      <template v-slot:item.load="{ item }">
        <span>{{item.load.id}}</span>
      </template>
      <template v-slot:item.pick_up_at="{ item }">
        <span>{{item.load.pickUpAt}}</span>
      </template>
      <template v-slot:item.deliver_to="{ item }">
        <span>{{item.load.deliverTo}}</span>
      </template>
      <template v-slot:item.miles="{ item }">
        <span>{{item.load.miles}}</span>
      </template>
      <template v-slot:item.broker="{ item }">
        <span>{{item.load.brokerage}}</span>
      </template>

      <template v-slot:item.driver="{ item }">
        <div v-if="item.driver !== null" style="white-space: pre-wrap">
          <span>{{item.driver.user.first_name}}</span>
          <span>{{item.driver.user.last_name}}</span>
        </div>
      </template>
      <template v-slot:item.call="{ item }">
        <div style="display: flex; flex-direction: column">
          <v-btn color="blue" dark x-small>Driver
          </v-btn>
          <v-btn color="blue" dark x-small class="mt-1">Owner
          </v-btn>
        </div>
      </template>
      <!-- <template v-slot:top="{ pagination, options, updateOptions }">
          <v-data-footer
              :pagination="pagination"
              :options="options"
              @update:options="updateOptions"
              items-per-page-text="$vuetify.dataTable.itemsPerPageText"
              style="border: 0"/>
      </template> -->
    </v-data-table>
  </v-container>
</template>

<script>
  const axios = require('axios');

  export default {
    data() {
      return {
        totalBids: 0,
        filterType: 'Equals',
        filterValue: '',
        filterColumn: '',
        bids: [],
        loading: true,
        options: {},
        headers: [{
            text: 'Received',
            value: 'created_date',
            align: 'center'
          },
          {
            text: 'Load ID',
            value: 'load'
          },
          {
            text: 'Pick-up at',
            value: 'pick_up_at',
            align: 'center'
          },
          {
            text: 'Deliver to',
            value: 'deliver_to',
            align: 'center'
          },
          {
            text: 'Miles',
            value: 'miles',
            align: 'center'
          },
          {
            text: 'Broker price',
            value: 'broker_price',
            align: 'center'
          },
          {
            text: 'Driver price',
            value: 'driver_price',
            align: 'center'
          },
          {
            text: 'Broker',
            value: 'broker',
            align: 'center'
          },
          {
            text: 'Driver',
            value: 'driver',
            align: 'center'
          },
          {
            text: 'Status',
            value: 'status',
            align: 'center'
          },
          // { text: 'Driver chat', value: 'driver_chat', sortable: false, align: 'center' },
          {
            text: 'Call',
            value: 'call',
            sortable: false,
            align: 'center'
          },
        ],
      }
    },
    watch: {
      options: {
        handler() {
          if (this.bids.length < 1) {
            return
          }

          this.loading = true
          const self = this

          this.getBids()
            .then(data => {
              const items = self.sortingAll(data)

              self.bids = items.items
              self.totalBids = items.total

              self.loading = false
            })
        },
      },
    },
    mounted() {
      this.$store.commit('updateToolbarData', {
        title: 'My bids',
      })
    },
    created() {

      // this.$globalEvents.$on('renewbids', () => {
      this.getBids()
        .then(data => {
          const items = this.sortingAll(data)

          this.bids = items.items
          this.totalBids = items.total

          this.loading = false
        })
      // })

      // if (this.bids.length < 1) {
      //     this.$globalEvents.$emit('renewbids')
      // }


    },
    beforeDestroy() {
      this.$store.commit('updateToolbarData', {})
    },
    methods: {
      openChat(item) {
        this.$router.push('/bids/' + item.id + '/')
      },
      sortingAll(bids) {
        const {
          sortBy,
          sortDesc,
          page,
          itemsPerPage
        } = this.options

        let items = bids
        const total = items.length

        if (sortBy.length === 1 && sortDesc.length === 1) {
          items = items.sort((a, b) => {
            const sortA = a[sortBy[0]]
            const sortB = b[sortBy[0]]

            if (sortDesc[0]) {
              if (sortA < sortB) return 1
              if (sortA > sortB) return -1
              return 0
            } else {
              if (sortA < sortB) return -1
              if (sortA > sortB) return 1
              return 0
            }
          })
        }

        items.forEach(item => {
          item.created_date = this.$globalFunctions.repairDatetime(item.created_date)
        });

        if (itemsPerPage > 0) {
          items = items.slice((page - 1) * itemsPerPage, page * itemsPerPage)
        }

        return {
          items,
          total,
        }

      },
      getBids() {
        const self = this;
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        return new Promise((resolve, reject) => {
          let bids = null;

          axios({
              method: 'get',
              url: self.$store.state.backendUrl + '/backend/api/propositions/all/',
              headers: {
                'Authorization': 'JWT ' + accessToken
              },
            })
            .then(function (response) {
              bids = response.data
              resolve(bids)
              // self.loading = false;
            })
            .catch(function (error) {
              // self.loading = false;
              console.log(error);
            });
        })
      },
    },
    middleware: 'single-bids'
  }

</script>

<style lang="css">
  .my-bids-table table tr {
    cursor: pointer;
  }

</style>
