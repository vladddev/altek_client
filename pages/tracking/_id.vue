<template>
  <v-row v-if="loading" align="center" justify="center">
    <v-progress-circular :size="100" color="blue" indeterminate></v-progress-circular>
  </v-row>
  <v-card v-else-if="!loading && !success">
    <v-container>
      <v-row>
        <v-col>
          {{ loadData }}
        </v-col>
      </v-row>
    </v-container>
  </v-card>
  <v-card v-else>
    <v-container>
      <v-row>
        <v-col cols="6">
          <div>
              <v-row>
                  <v-col cols='12'>
                        <h1>
                            Shipment information
                        </h1>
                  </v-col>
                  <v-col cols='12' class="deliver-points-date pt-0">
                    #Load {{ loadData.id }}
                  </v-col>
              </v-row>
              <v-divider></v-divider>
              <v-row>
                  <v-col>
                      <div class="deliver-points-value">Current Shipment Status</div>
                      <div>{{ loadData.status.name }}</div>
                  </v-col>
                  <v-col>
                      <div class="deliver-points-value">Location Updated</div>
                      <div>{{ loadData.load_locations.length > 0 ? loadData.load_locations[0].timestamp * 1000 : null | formatDate }}</div>
                  </v-col>
              </v-row>
            <v-row>
              <div class="mr-2">
                <div class="deliver-points-number">
                  <span class="deliver-points-number__item">
                    1
                  </span>
                </div>
              </div>
              <div class="mb-3">
                <div class="deliver-points-title">Pick-up</div>
                <div class="deliver-points-value">{{ loadData.pickUpAt }}</div>
                <div class="deliver-points-date">{{ loadData.pick_up_date | formatDate }} <span
                    class="grey--text">(local)</span>
                </div>
              </div>
            </v-row>
            <v-row>
              <div class="mr-2">
                <div class="deliver-points-number">
                  <span class="deliver-points-number__item">
                    2
                  </span>
                </div>
              </div>
              <div class="mb-2">
                <div class="deliver-points-title">Delivery</div>
                <div class="deliver-points-value">{{ loadData.deliverTo }}</div>
                <div class="deliver-points-date">{{ loadData.delivery_date | formatDate }} <span
                    class="grey--text">(local)</span>
                </div>
              </div>
            </v-row>
          </div>
          <div class="mt-4">
            <v-row>
              <div class="mr-3 font-weight-bold">Cargo</div>
              <div class="grey--text">({{ loadData.isCanPutOnTop ? 'stackable' : 'not stackable' }}, {{ loadData.wait_and_return ? 'turnable' : 'not turnable' }})</div>
            </v-row>
            <v-row>
              <table>
                <tbody>
                  <tr>
                    <td>
                      <div class="grey--text mr-3">Pallets</div>
                    </td>
                    <td>
                      <div>{{ loadData.pallets }}</div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div class="grey--text mr-3">Weight</div>
                    </td>
                    <td>
                      <div>{{ loadData.weight }} lb</div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div class="grey--text mr-3">Dims (LxWxH)</div>
                    </td>
                    <td>
                      <div>{{ loadData.length + 'x' + loadData.width + 'x' + loadData.height }} in</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </v-row>
          </div>
        </v-col>
        <v-col cols="6">
          <driver-map v-if="mapData.status" :locData="mapData"></driver-map>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
  import driverMap from '@/components/maps/driver-map'

  const axios = require('axios')
  const moment = require('moment');

  export default {
    layout: 'tracking',
    data() {
      return {
        loading: true,
        success: true,
        loadData: '',
        loadLocationData: '',
        emailNotifDialog: false,
        chatTitle: '',
        statusConfirmDialog: false,
        driverPhone: '',
        ownerPhone: '',
        childStatusConfirmDialog: false,
        mapData: {
          status: false,
          startLoc: '',
          endLoc: '',
          carLoc: ''
        },
        statusLoading: false,
        allStatuses: [],
        mainStatusValue: {},
        substatusValue: {},
        parentStatusModel: {},
        childStatusModel: {},
        parentStatusItems: [],
        childStatusItems: [],
        changeParentStatusEvent: {},
        changeChildStatusEvent: {},
      }
    },
    filters: {
      formatDate(date) {
        if (date === null) {
            return 'not defined'
        }
        var date = moment(date);
        return date.format('ddd D MMM h:mm');
      },
      formatEtaDate(date) {
        var date = moment().add(date, 'seconds');
        return date.format('DD/M/Y hh:mm');
      },
      formatDefaultData(date) {
        var date = moment(date);
        return date.format('DD/M/Y hh:mm');
      }
    },
    methods: {
      discardChange(type) {
        if (type === 'main') {
          this.parentStatusModel = this.mainStatusValue
          this.statusConfirmDialog = false
        } else if (type === 'substatus') {
          this.childStatusModel = this.substatusValue
          this.childStatusConfirmDialog = false
        }
      },
      updateLoadData() {
        const self = this
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/guest/load/' + self.$route.params.id + '/',
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            const load = response.data
            self.loadData = load.result
            self.loading = false
            self.success = load.success

            
            self.mapData = {
              status: true,
              startLoc: self.loadData.start_location,
              endLoc: self.loadData.end_location,
              carLoc: self.loadData.load_locations.length > 0 ? self.loadData.load_locations[0].point : null,
              roadLocs: self.loadData.load_locations
            }

          })
          .catch(function (error) {
            console.log(error);
          });
      }
    },
    created() {
      this.updateLoadData()
    },
    components: {
      driverMap
    },
  }

</script>

<style lang="css" scoped>
  .deliver-points-title {
    font-size: 13px;
  }

  .deliver-points-value {
    font-size: 17px;
    font-weight: bold;
  }

  .deliver-points-date {
    font-size: 14px;
  }

  .deliver-points-number {
    background-color: #58A7EF;
    color: #fff;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    text-align: center;
    display: inline-block;
    margin-top: 20px;
  }

  .deliver-points-number__item {
    margin: 0;
  }

  .picture-input {
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    flex-direction: column;
    background: #FFFFFF;
    color: #1067C5;
    border: 1px solid #1067C5;
    box-sizing: border-box;
    box-shadow: -1px -1px 4px 1px #F3F3F3, 1px 1px 4px 1px #F3F3F3;
    border-radius: 6px;
  }

</style>
