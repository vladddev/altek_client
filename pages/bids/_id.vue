<template>
  <v-container fluid>
    <assign-load-dialog @closeDialog="closeAssignDialog" :open="assignDialog" :dialogData="loadData" :bidData="bidData"
      :mapData="mapData">
    </assign-load-dialog>

    <v-dialog v-model="editDialog" max-width="400px">
      <v-form ref="form" @submit.prevent="saveProp">
        <v-card class="elevation-12 pa-4" :loading="loading">
          <v-card-text>
            <v-row>
              <v-col cols="6">
                <v-text-field label="Price for broker" v-model="bidData.broker_price" />
              </v-col>
              <v-col cols="6">
                <v-text-field label="Price for driver" v-model="bidData.driver_price" />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field label="Price per mile" @input="brokerCostUpdate($event)" :value="brokerCostPerMile" />
              </v-col>
              <v-col cols="6">
                <v-text-field label="Price per mile" @input="driverCostUpdate($event)" :value="driverCostPerMile" />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="editDialog = false"> Cancel </v-btn>
            <v-btn color="primary" type="submit">Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-row>
      <v-col cols="4">

        <load-map v-if="this.$store.getters.getGmapApiKey != ''" :locData="mapData"></load-map>

        <div class="load_meta_1 mt-3">
          <h2>Order # {{ loadData.id }}</h2>
          <span class="grey--text">Received {{ loadData.modifiedDateTime | dateFormat }}</span>
          <br><br>
        </div>
        <div class="load_meta_2">
          <div><b><span>Pick-up at:</span> <span class="px-1"> {{ loadData.pickUpAt }} </span></b></div>
          <div><b><span>Pick-up date:</span> <span class="px-1"> {{ loadData.pick_up_date }} </span></b></div>
          <br>
          <div><b><span>Deliver to:</span> <span class="px-1"> {{ loadData.deliverTo }} </span></b></div>
          <div><b><span>Delivery date:</span> <span class="px-1"> {{ loadData.delivery_date }} </span></b></div>
          <br>
          <div><span>Miles:</span> <span class="px-1"> {{ loadData.miles }} </span></div>
          <div><span>Pieces:</span> <span class="px-1"> {{ loadData.pieces }} </span></div>
          <div><span>Weight:</span> <span class="px-1"> {{ loadData.weight }} </span></div>
          <div><span>Dims:</span> <span class="px-1"> {{
              loadData.length != '' && loadData.width != '' && loadData.height != '' ? loadData.length + 'L x ' + loadData.width + 'W x ' + loadData.height + 'H in' : 'Not suplied'
            }} </span></div>
          <div><span>Stackable:</span> <span class="px-1"> {{ loadData.isCanPutOnTop ? 'Yes' : 'No' }} </span>
          </div>
          DockLevel?: <span class="px-1"> {{ loadData.dock_level ? 'Yes' : 'No' }} </span>
          <div><b><span>Suggested Truck Size:</span> <span class="px-1"> {{ loadData.car }} </span></b></div>
          <br>
          <template v-if="loadData.note">
            <div><b><span>NOTE:</span> <span class="px-1w"> {{ loadData.note }} </span></b></div>
          </template>
          <br>
        </div>
        <div class="load_meta_3" v-html="loadData.mail_part"></div>

      </v-col>
      <v-col cols="8" class="d-flex" style="flex-direction: column">
        <v-col>
          <email-chat :from='chatData.from' :to='chatData.to' :subject='chatData.subject'
            :advRecipients="advRecipients"></email-chat>
        </v-col>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import loadMap from '@/components/maps/load-map'
  import emailChat from '@/components/chat/email-chat'
  import assignLoadDialog from '@/components/bids/assign-load'

  const axios = require('axios')
  const moment = require('moment')

  export default {
    data() {
      return {
        loading: false,
        bidData: {},
        loadData: {},
        assignDialog: false,
        editDialog: false,
        brokerCostPerMile: 0,
        driverCostPerMile: 0,
        mapData: {
          startLoc: '',
          endLoc: ''
        },
        advRecipients: [{
            name: "Ruslan",
            adress: "r.musaev@welbex.ru"
          },
          {
            name: "Mark",
            adress: "mark@gmail.com"
          },
          {
            name: "Irvin",
            adress: "irvin@gmail.com"
          }
        ],
        chatData: {
          from: 'postedloads@sylectus.com',
          to: 'ruslan-4742@mail.ru',
          subject: ''
        }
      }
    },
    mounted() {

      const self = this
      const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
        'etl-user-token')

      this.loading = true

      this.$store.commit('updateToolbarData', {
        title: 'Bid #' + this.$route.params.id,
        backBtn: {
          callback: function () {
            window.history.back();
          }
        },
        actions: [
          // {type: 'icon-text', text: "Logs", icon:'mdi-information-outline', action: this.qwe, class: 'blue--text text-capitalize'},
          // {type: 'icon-text', text: "Post shipment", icon:'mdi-send', action: this.qwe, class: 'blue--text text-capitalize'},
          {
            type: 'icon-text',
            text: "Assign Shipment",
            icon: 'mdi-checkbox-marked-outline',
            action: this.openAssignDialog,
            class: 'blue--text text-capitalize'
          },
          // {type: 'icon-text', text: "Email Notifications", icon:'mdi-email-outline', action: this.qwe, class: 'blue--text text-capitalize'},
          {
            type: 'icon-menu',
            icon: 'mdi-dots-horizontal',
            color: 'blue',
            items: [{
                title: 'Edit',
                icon: 'mdi-pencil',
                action: function () {
                  self.editDialog = true
                }
              },
              {
                title: 'Decline',
                icon: 'mdi-close',
                color: 'red',
                action: function () {
                  axios({
                      method: 'put',
                      url: self.$store.state.backendUrl + '/backend/api/propositions/' + self.bidData.id +
                        '/',
                      data: {
                        status: 'Decline'
                      },
                      headers: {
                        'Authorization': 'JWT ' + accessToken
                      },
                    })
                    .then(function (response) {
                      if (response.status == 200) {
                        self.$router.push('/bids/')
                      }
                    })
                    .catch(function (error) {
                      // self.loading = false;
                      console.log(error);
                    });
                }
              }
            ],
          },
        ]
      })
    },
    methods: {
      openAssignDialog() {
        this.assignDialog = true
      },
      closeAssignDialog(value) {
        this.assignDialog = value
      },
      brokerCostUpdate($event) {
        if (isNaN(+$event)) {
          this.bidData.broker_price = 0
        } else {
          this.bidData.broker_price = Math.floor($event * this.bidData.miles_out)
        }
      },
      driverCostUpdate($event) {
        if (isNaN(+$event)) {
          this.bidData.driver_price = 0
        } else {
          this.bidData.driver_price = Math.floor($event * this.bidData.miles_out)
        }
      },
      saveProp() {
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')
        const self = this

        axios({
          method: 'put',
          url: self.$store.state.backendUrl + '/backend/api/propositions/' + self.bidData.id + '/',
          data: {
            driver_price: self.bidData.driver_price,
            broker_price: self.bidData.broker_price,
          },
          headers: {'Authorization': 'JWT ' + accessToken},
        })
          .then(function (response) {
            if (response.status == 200) {
              self.updateProp()
              self.editDialog = false
            }
          })
          .catch(function (error) {
            // self.loading = false;
            console.log(error);
          });
      },
      updateProp() {
        const self = this
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/propositions/' + self.$route.params.id + '/',
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {

            self.bidData = response.data
            self.loadData = response.data.load

            self.$set(self.chatData, 'subject', "LOAD-" + self.loadData.id)

            self.mapData = {
              startLoc: response.data.load.start_location,
              endLoc: response.data.load.end_location
            }
            self.loading = false
          })
          .catch(function (error) {
            window.location.replace("/bids");
            console.log(error);
          });
      }
    },
    filters: {
      dateFormat(date) {
        return moment(date).format('hh:mm A') == 'Invalid date' ? '' : moment(date).format('hh:mm A')
      }
    },
    created() {
      this.updateProp()
    },
    beforeDestroy() {
      this.$store.commit('updateToolbarData', {})
    },
    components: {
      loadMap,
      emailChat,
      assignLoadDialog
    },
    middleware: 'single-bids'
  }

</script>

<style lang="sass" scoped>
  .load_meta,
  .load_meta b,
  .load_meta span 
    font-size: 13px !important 
  .load_meta 
    font-weight: 400 
  .load_meta 
    b 
      font-weight: 900 
  .load_meta_2 
    * 
      line-height: 1.3 
  .load_meta_3 
    line-height: 1.3

</style>
