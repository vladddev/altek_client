<template>
  <v-dialog
    v-model="open"
    fullscreen
  >
    <v-card
      :loading="loading"
    >
      <v-toolbar
        dark
        color="blue">
        <v-toolbar-title>Assign shipment #{{ dialogData.id }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          class="mr-3"
          color="green"
          @click="confirm"
          elevation="0"
        >
          <v-icon>mdi-check</v-icon>
          Confirm
        </v-btn>
        <v-btn icon @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-container class="load-dialog-content" fluid>
        <v-row>
          <v-col cols="3">
            <v-card>
              <v-card-text>
                <load-map
                  v-if="this.$store.getters.getGmapApiKey != '' && mapData.startLoc"
                  :locData="mapData"
                ></load-map>
              </v-card-text>
              <v-card-text class="subtitle-2 load_meta">
                <div class="load_meta_1">
                  <h2>Order # {{ dialogData.id }}</h2>
                  <span class="grey--text">Received {{ dialogData.modifiedDateTime | dateFormat }}</span>
                  <br><br>
                </div>
                <div class="load_meta_2">
                  <div><b><span>Pick-up at:</span> <span class="px-1"> {{ dialogData.pickUpAt }} </span></b></div>
                  <div><b><span>Pick-up date:</span> <span class="px-1"> {{ dialogData.pick_up_date }} </span></b></div>
                  <br>
                  <div><b><span>Deliver to:</span> <span class="px-1"> {{ dialogData.deliverTo }} </span></b></div>
                  <div><b><span>Delivery date:</span> <span class="px-1"> {{ dialogData.delivery_date }} </span></b>
                  </div>
                  <br>
                  <div><span>Miles:</span> <span class="px-1"> {{ dialogData.miles }} </span></div>
                  <div><span>Pieces:</span> <span class="px-1"> {{ dialogData.pieces }} </span></div>
                  <div><span>Weight:</span> <span class="px-1"> {{ dialogData.weight }} </span></div>
                  <div><span>Dims:</span> <span class="px-1"> {{
                      dialogData.length != '' && dialogData.width != '' && dialogData.height != '' ? dialogData.length + 'L x ' + dialogData.width + 'W x ' + dialogData.height + 'H in' : 'Not suplied'
                    }} </span></div>
                  <div><span>Stackable:</span> <span class="px-1"> {{ dialogData.isCanPutOnTop ? 'Yes' : 'No' }} </span>
                  </div>
                  DockLevel?: <span class="px-1"> {{ dialogData.dock_level ? 'Yes' : 'No' }} </span>
                  <div><b><span>Suggested Truck Size:</span> <span class="px-1"> {{ dialogData.car }} </span></b></div>
                  <br>
                  <template v-if="dialogData.note">
                    <div><b><span>NOTE:</span> <span class="px-1w"> {{ dialogData.note }} </span></b></div>
                  </template>
                  <br>
                </div>
                <div class="load_meta_3" v-html="dialogData.mail_part"></div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="9">
            <v-row>
              <v-col cols="12">
                <v-card-title>Units found: {{ driversTable.count }}</v-card-title>
              </v-col>
              <v-col cols="12">
                <v-data-table
                  :headers="driversTable.headers"
                  :items="driversTable.items"
                  :options.sync="options"
                  :hide-default-footer="true"
                  :items-per-page="-1"
                  :server-items-length="driversTable.totalLoads"
                  :loading="driversTable.loading"
                  class="elevation-2"
                >
                  <template v-slot:item.check="{ item }">
                    <v-radio-group
                      v-model="selectedDriver">
                      <v-radio
                        class="justify-center"
                        :value="item"
                      ></v-radio>
                    </v-radio-group>
                  </template>
                  <template v-slot:item.driver="{ item }">
                    <p style="white-space: nowrap">{{
                        item.active_driver == null ? item.drivers[0].user.first_name : item.active_driver.user.first_name
                      }}</p>
                    <p class="grey--text">
                      {{ item.active_driver == null ? item.drivers[0].user.email : item.active_driver.user.email }}</p>
                  </template>
                  <template v-slot:item.available="{ item }">
                    <p
                      v-if="mapData.startLoc"
                    >
                      <a target="_blank"
                         :href="`https://www.google.com/maps/dir/${item.active_driver == null ? item.drivers[0].location : item.active_driver.location}/${mapData.startLoc}`">{{
                          item.availableCity
                        }}</a>
                    </p>
                    <p v-else>{{ item.availableCity }}</p>
                    <p class="grey--text">{{ item.availableDates | dateFormat }}</p>
                  </template>
                  <template v-slot:item.note="{ item }">
                    <span v-if="item.note != ''">{{ item.note }}</span>
                    <span v-else class="grey--text">Empty</span>
                  </template>
                  <template v-slot:item.unitTemplate="{ item }">
                    <p>{{ item.number }}</p>
                    <p class="grey--text" style="white-space: nowrap">⛟ {{ item.miles_out }} mi</p>
                  </template>
                  <template v-slot:item.vehicleTemplate="{ item }">
                    <p>{{ item.type }}</p>
                    <p class="grey--text" style="white-space: nowrap">{{ item.weight }}</p>
                  </template>
                  <template v-slot:item.dimensions="{ item }">
                    <span>{{ item.length }}x{{ item.width }}x{{ item.height }}in.</span>
                  </template>
                  <template v-slot:item.actions="{ item }">
                    <v-btn
                      icon
                      class="mr-2"
                      title="Call to driver"
                      color="green"
                      @click="callTo((item.active_driver == null ? item.drivers[0].phone_number : item.active_driver.user.phone_number))"
                    >
                      <v-icon>mdi-phone</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      color="green"
                      title="Call to owner"
                      @click="callTo(item.car_owner.phone)"
                    >
                      <v-icon>mdi-phone-in-talk</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      class="mt-1"
                      color="blue"
                      title="Open chat"
                      @click="openChat(item.active_driver == null ? item.drivers[0].user.id : item.active_driver.user.id)"
                    >
                      <v-icon>mdi-message-text-outline</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>

import loadMap from '@/components/maps/load-map'

const axios = require('axios')
const moment = require('moment')

export default {
  name: 'assign-load-dialog',
  props: ['open', 'dialogData', 'bidData', 'mapData'],
  data() {
    return {
      loading: false,
      options: {},
      selectedDriver: {},
      qwe: false,
      driversTable: {
        count: 0,
        loading: false,
        headers: [
          {text: '', value: 'check', sortable: false, align: 'center'},
          {text: 'Unit', value: 'unitTemplate', align: 'center'},
          // { text: 'Miles', value: 'miles_before_load', align: 'center' },
          {text: 'Driver', value: 'driver', align: 'center'},
          // { text: 'Vehicle type', value: 'type'},
          {text: 'Vehicle', value: 'vehicleTemplate', align: 'center'},
          // { text: 'Max weigh', value: 'weight'},
          {text: 'Available', value: 'available', align: 'center'},
          {text: 'Dimensions', value: 'dimensions', align: 'center'},
          // { text: 'Note', value: 'note' },
          // { text: 'Status', value: 'status'},
          {text: 'Bid', value: 'bid', sortable: false},
          {text: 'Call', value: 'actions', sortable: false, align: 'center', width: '200px'},
        ],
        items: []
      },
    }
  },
  watch: {
    'selectedDriver': function (selectedCar) {

    },
    open: function (val, oldVal) {
      const self = this
      if (val) {
        self.driversTable.loading = true
        this.getAvailableCars(this.dialogData.id)
          .then(data => {
            const items = self.sortingAllCars(data)

            self.driversTable.items = items.items
            self.driversTable.count = items.total

            self.driversTable.items.forEach(element => {

              if (element.car_propositions.length == 0) return

              console.log(element.car_propositions)

              let car_proposition = {}

              element.car_propositions.forEach(function (proposition) {
                if (proposition.id == self.bidData.id) {
                  car_proposition = proposition
                }
              })

              if (self.bidData.car == element.id && self.bidData.driver.user.id == car_proposition.driver.user.id) {
                self.selectedDriver = element
              }
            });

            self.driversTable.loading = false
          })
      }
    },
    options: {
      handler() {
        if (this.dialogData.id == 0) {
          return
        }
        const self = this
        this.loading = true

        this.getAvailableCars()
          .then(data => {
            const items = self.sortingAllCars(data)

            self.driversTable.items = items.items
            self.driversTable.count = items.total

            self.driversTable.loading = false
          })
      },
    },
  },
  filters: {
    dateFormat(date) {
      return moment(date).format('hh:mm A') == 'Invalid date' ? '' : moment(date).format('hh:mm A')
    }
  },
  methods: {
    openChat(id) {

      let self = this
      let accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')

      axios({
        method: 'post',
        url: self.$store.state.backendUrl + '/backend/api/users/current/chats',
        data: {
          driver_id: id
        },
        headers: {'Authorization': 'JWT ' + accessToken},
      })
        .then(function (response) {

          console.log(response)

          if (response.data.message == "Driver doesn`t exist") {
            alert("Driver doesn`t exist. Error opening chat")
            return
          }

          response.data.chat_group_messages.reverse()

          let data = response.data

          let chat_title = ''

          data.users.forEach(function (val, index) {
            if (index == 0) {
              chat_title += val.first_name
            } else {
              chat_title += ', ' + val.first_name
            }
          })

          self.$globalEvents.$emit('setWindowChatData', true, {
            id: data.id,
            title: chat_title,
            messages: data.chat_group_messages,
            participants: data.users
          })

          // self.loading = false;
        })
        .catch(function (error) {
          // self.loading = false;
          console.log(error);
        });

    },
    sortingAllCars(cars) {
      const {sortBy, sortDesc, page, itemsPerPage} = this.options

      let items = cars.results
      const total = items.length
      const self = this

      items.forEach(item => {
        let driver = item.active_driver == null ? item.drivers[0].user : item.active_driver

        if (typeof driver.saved_loads !== 'undefined' && driver.saved_loads.length > 0) {
          driver.saved_loads.forEach(load => {
            if (load == this.dialogData.id) {
              item.bid = load.driver_price
            }
          })
        }

        // item.miles = 'Loading...'
        // this.getDistance(item.location, this.selectedLoad.pickUpAt, item).then(data => {self.$set(item, 'miles', data);})

      })

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

      if (itemsPerPage > 0) {
        items = items.slice((page - 1) * itemsPerPage, page * itemsPerPage)
      }

      return {
        items,
        total,
      }

    },
    getAvailableCars(load_id) {
      const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')
      const self = this

      // if(!this.qwe) {
      //   self.$globalEvents.$emit('companySentEvent', {
      //     action: 'new_load_offer',
      //     data: {
      //       load_id: self.dialogData.id
      //     }
      //   })
      //   this.qwe = true
      // }

      return new Promise((resolve, reject) => {
        let loads = null;

        axios({
          method: 'get',
          url: self.$store.state.backendUrl + '/backend/api/cars/my/?free_only=true&load_id=' + self.dialogData.id,
          headers: {'Authorization': 'JWT ' + accessToken},
        })
          .then(function (response) {
            // console.log(response)
            resolve(response.data)
            // self.loading = false;
          })
          .catch(function (error) {
            // self.loading = false;
            console.log(error);
          });
      })
    },
    confirm: function () {
      // console.log(this.bidData);

      const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')
      const self = this

      axios({
        method: 'put',
        url: self.$store.state.backendUrl + '/backend/api/propositions/' + self.bidData.id + '/',
        data: {
          status: 'Accept',
          driver: self.selectedDriver.active_driver == null ? self.selectedDriver.drivers[0].id : self.selectedDriver.active_driver.user.id,
          car: self.bidData.car
        },
        headers: {'Authorization': 'JWT ' + accessToken},
      })
        .then(function (response) {
          if (response.status == 200) {
            self.$globalEvents.$emit('companySentEvent', {
              action: 'new_load_offer',
              data: {
                load_id: self.dialogData.id
              }
            })
            self.$router.push('/my-loads/active/')
          }
        })
        .catch(function (error) {
          // self.loading = false;
          console.log(error);
        });

    },
    closeDialog: function () {
      this.$emit('closeDialog', false)
    }
  },
  computed: {
    brokerCostPerMile() {
      let cost = 0
      const miles = this.dialogData.miles
      const total = this.dialogData.broker_price

      if (Number(miles) > 0) {
        cost = (total / miles).toFixed(1)
      }

      return Number(cost)
    },
    driverCostPerMile() {
      let cost = 0
      const miles = this.dialogData.miles
      const total = this.dialogData.driver_price

      if (Number(miles) > 0) {
        cost = (total / miles).toFixed(1)
      }

      return Number(cost)
    }
  },
  created() {

  },
  beforeDestroy() {

  },
  components: {
    loadMap
  }
}

</script>

<style lang="sass" scoped>

.load_meta, .load_meta b, .load_meta span
  font-size: 13px !important

.load_meta
  font-weight: 400

.load_meta b
  font-weight: 900

.load_meta_2 *
  line-height: 1.3

.load_meta_3
  line-height: 1.3

.v-application p
  margin-bottom: 0 !important
</style>
