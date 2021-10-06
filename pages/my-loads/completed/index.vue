<template>
  <v-container fluid>
    <v-data-table :headers="headers" :items="loads" :options.sync="options" :server-items-length="totalLoads"
      :loading="loading" @click:row="openMyLoad" class="my-loads-table elevation-1">
      <template v-slot:item.pickUpAt="{ item }">
        <v-icon v-if="item.pickUpAt.toLowerCase() === 'asap'" color="#ff4700">mdi-fire</v-icon>
        <span v-else>{{ item.pickUpAt }}</span>
      </template>

      <template v-slot:top="{ pagination, options, updateOptions }">
        <v-container style="display: none">
          <v-row>
            <v-col cols="6">
              <v-row>
                <v-col cols="4">
                  <v-select :items="['Pick-up at', 'Deliver to', 'Vehicle', 'Match', 'Shipper']" label="Filter column"
                    v-model="filterColumn" dense solo></v-select>
                </v-col>
                <v-col cols="4">
                  <v-select
                    :items="['Equals', 'Does not equal', 'Contains', 'Does not contain', 'Starts with', 'Ends with', 'More than', 'Less than']"
                    label="Filter type" v-model="filterType" dense solo></v-select>
                </v-col>
                <v-col cols="3">
                  <v-text-field dense v-model="filterValue"></v-text-field>
                </v-col>
                <v-col cols="1">
                  <v-btn class="ma-2" :loading="loading" :disabled="loading" color="secondary" small @click="filter()">
                    Refresh
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="5">
              <v-data-footer :pagination="pagination" :options="options" @update:options="updateOptions"
                items-per-page-text="$vuetify.dataTable.itemsPerPageText" style="border: 0" />
            </v-col>
          </v-row>
        </v-container>

      </template>

      <template v-slot:item.chat="{ item }">
        <v-btn small icon @click="openChat(item)">
          <v-icon>mdi-message-text-outline</v-icon>
        </v-btn>
      </template>

      <!--            <template v-slot:item.info="{ item }">-->
      <!--                <v-btn-->
      <!--                    small-->
      <!--                    icon-->
      <!--                    color="blue"-->
      <!--                    @click="openMyLoad(item.id)">-->
      <!--                    <v-icon>mdi-eye</v-icon>-->
      <!--                </v-btn>-->
      <!--            </template>-->

      <template v-slot:item.resp_driver="{ item }">
        <span v-if="item.resp_driver !== null">{{ item.resp_driver.user.first_name }}
          {{ item.resp_driver.user.last_name }}</span>
      </template>

      <template v-slot:item.resp_car="{ item }">
        <span v-if="item.resp_car !== null">{{ item.resp_car.number }}</span>
      </template>

      <template v-slot:item.statusTemplate="{ item }">
        <span>{{ item.status.name }}</span>
      </template>

      <template v-slot:item.edit="{ item }">
        <v-btn small icon @click="openDetails(item.id)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>

    </v-data-table>
  </v-container>
</template>

<script>
  const axios = require('axios');

  export default {
    data() {
      return {
        totalLoads: 0,
        filterType: 'Equals',
        filterValue: '',
        filterColumn: '',
        loads: [],
        loading: true,
        options: {},
        headers: [{
            text: 'Received',
            value: 'modifiedDateTime',
            align: 'center'
          },
          {
            text: 'Pick-up at',
            value: 'pickUpAt',
            align: 'center'
          },
          {
            text: 'Deliver to',
            value: 'deliverTo',
            align: 'center'
          },
          {
            text: 'Vehicle',
            value: 'car',
            align: 'center'
          },
          {
            text: 'Car number',
            value: 'last_car',
            align: 'center'
          },
          {
            text: 'Driver',
            value: 'driver',
            align: 'center'
          },
          {
            text: 'Miles',
            value: 'miles'
          },
          {
            text: 'Company',
            value: 'company',
            align: 'center'
          }
        ]
      }
    },
    mounted() {
      this.$store.commit('updateToolbarData', {
        title: 'Completed loads',
        backBtn: {
          callback: function () {
            window.history.back();
          }
        },
        actions: [{
          type: 'icon-text',
          icon: 'mdi-pencil-box-outline',
          text: 'Add load',
          color: 'blue',
          class: 'blue--text text-capitalize',
          action: () => {
            self.$router.push('/add-load/')
          }
        }]
      })
    },
    watch: {
      options: {
        handler() {
          if (this.loads.length < 1) {
            return
          }

          this.loading = true
          const self = this

          this.getLoads()
            .then(data => {
              const items = self.sortingAll(data)

              self.loads = items.items
              self.totalLoads = items.total

              self.loading = false
            })
        },
      },
    },
    created() {
      // this.$globalEvents.$on('renewLoads', () => {
      this.getLoads()
        .then(data => {
          const items = this.sortingAll(data)

          this.loads = items.items
          this.totalLoads = items.total

          this.loading = false
        })
      // })

      // if (this.loads.length < 1) {
      //     this.$globalEvents.$emit('renewLoads')
      // }

    },
    beforeDestroy() {
      this.$store.commit('updateToolbarData', {})
      // this.$globalEvents.$off('renewLoads')
      this.$globalEvents.$off('renewCurrentUser')
    },
    methods: {
      openMyLoad(load) {
        this.$router.push('/my-loads/completed/' + load.id + '/')
      },
      openChat(item) {
        console.log(item);
      },
      translateFilterToOption(str) {
        switch (str) {
          case 'Received':
            return 'modifiedDateTime'
            break;
          case 'Pick-up at':
            return 'pickUpAt'
            break;
          case 'Deliver to':
            return 'deliverTo'
            break;
          case 'Vehicle':
            return 'car'
            break;
          case 'Match':
            return 'match'
            break;
          case 'Shipper':
            return 'shipper'
            break;
          default:
            return str;
            break;
        }
      },
      filter() {
        this.loading = true

        this.getLoads()
          .then(data => {
            const items = this.sortingAll(data)

            this.loads = items.items
            this.totalLoads = items.total

            this.loading = false
          })
      },
      sortingAll(loads) {
        const {
          sortBy,
          sortDesc,
          page,
          itemsPerPage
        } = this.options

        let items = []

        loads.forEach(load => {
          const item = load.load
          item.modifiedDateTime = this.$globalFunctions.repairDatetime(load.load.modifiedDateTime)
          item.driver = load.driver.user.first_name + ' ' + load.driver.user.last_name

          items.push(item)
        })

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

        if (this.filterValue !== '' && this.filterColumn !== '') {
          const $col = this.translateFilterToOption(this.filterColumn)
          const $val = this.filterValue

          switch (this.filterType) {
            case 'Equals':
              items = items.filter(item => {
                return item[$col].toString() == $val
              })
              break;
            case 'Does not equal':
              items = items.filter(item => {
                return item[$col].toString() != $val
              })
              break;
            case 'Contains':
              items = items.filter(item => {
                return item[$col].toString().includes($val)
              })
              break;
            case 'Does not contain':
              items = items.filter(item => {
                return !item[$col].toString().includes($val)
              })
              break;
            case 'Starts with':
              items = items.filter(item => {
                return item[$col].toString().startsWith($val)
              })
              break;
            case 'Ends with':
              items = items.filter(item => {
                return item[$col].toString().endsWith($val)
              })
              break;
            case 'More then':
              items = items.filter(item => {
                return +item[$col] > $val
              })
              break;
            case 'Less then':
              items = items.filter(item => {
                return +item[$col] < $val
              })
              break;
            default:
              break;
          }
        }




        if (itemsPerPage > 0) {
          items = items.slice((page - 1) * itemsPerPage, page * itemsPerPage)
        }

        return {
          items,
          total,
        }

      },
      getLoads() {
        const self = this;
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        return new Promise((resolve, reject) => {
          let loads = null;

          axios({
              method: 'get',
              url: self.$store.state.backendUrl + '/backend/api/loads/completed/',
              headers: {
                'Authorization': 'JWT ' + accessToken
              },
            })
            .then(function (response) {
              loads = response.data
              resolve(loads)
              // self.loading = false;
            })
            .catch(function (error) {
              // self.loading = false;
              console.log(error);
            });
        })
      },
      openDetails(id) {
        this.$router.push('/loads/' + id + '/')
      }
    },
    middleware: 'my-loads-completed'
  }

</script>

<style lang="css">
  .my-loads-table table tr {
    cursor: pointer;
  }

</style>
