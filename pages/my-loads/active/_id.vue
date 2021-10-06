<template>
  <v-container fluid v-if="loadData">
    <!-- email-notification-dialog v-if="loadData.location_update_emails || loadData.status_update_emails" -->
    <email-notification-dialog 
      :open="emailNotifDialog" :close-event="() => emailNotifDialog=false" :load-data="loadData">
    </email-notification-dialog>

    <v-dialog v-model="actionsHistoryDialog" max-width="600" max-height="70vh">
      <v-card>
        <v-card-title>Actions history</v-card-title>
        <v-card-text>
          <div v-for="(action, index) in parsedLoadActions" :key="index">
            {{ index + 1 }}. {{ action.timestamp | formatDefaultData }} - {{ action.action }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn
            @click="actionsHistoryDialog = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="changeDriverDialog" max-width="600" max-height="70vh">
      <v-card>
        <v-card-title>Select new driver</v-card-title>
        <v-card-text>
          Current driver: {{ loadData.resp_driver_name}} <br>
          Current car: {{ loadData.resp_car}}
          <v-row>
            <v-col>
              <v-autocomplete
                :items="freeDrivers"
                label="Select new driver"
                item-text="first_name"
                item-value="id"
                v-model="newDriver"
                clearable
              ></v-autocomplete>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn
            @click="changeDriverDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn color="blue" @click="updateDriver()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="noteDialog" max-width="400">
      <v-card>
        <v-card-title>Note</v-card-title>
        <v-card-text>
          <v-textarea outlined v-model="loadData.dispatcher_note"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="noteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn color="blue" text @click="updateData('dispatcher_note')">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="statusConfirmDialog" persistent max-width="400">
      <v-card :loading="statusLoading">
        <v-card-title class="headline">
          Are you sure?
        </v-card-title>
        <v-card-text>Do you really want to change the parent status for this shipment ?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" text :disabled="statusLoading" @click="discardChange('main')">
            Disagree
          </v-btn>
          <v-btn color="blue" :disabled="statusLoading" text @click="changeStatus('main')">
            Agree
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="childStatusConfirmDialog" persistent max-width="400">
      <v-card :loading="statusLoading">
        <v-card-title class="headline">
          Are you sure?
        </v-card-title>
        <v-card-text>Do you really want to change the substatus status for this shipment ?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" text :disabled="statusLoading" @click="discardChange('substatus')">
            Disagree
          </v-btn>
          <v-btn color="blue" :disabled="statusLoading" text @click="changeStatus('substatus')">
            Agree
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-row>
      <v-col cols="6">
        <v-row>
          <v-col cols="4" class="py-0">
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
              <div class="deliver-points-date">{{ loadData.created_date | formatDate }} <span
                  class="grey--text">(local)</span>
              </div>
            </div>
          </v-col>
          <v-col cols="4" class="py-0">
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
              <div class="deliver-points-date">{{ loadData.created_date | formatDate }} <span
                  class="grey--text">(local)</span>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="6">
        <div class="d-flex align-center">
          <span class="font-weight-bold">Current status: </span>
          <div class="d-flex align-center ml-2">
            <span class="mr-1">{{ statusName }}</span>
            <!-- <v-btn icon>
              <v-icon color="blue">
                mdi-arrow-left-bold-circle-outline
              </v-icon>
            </v-btn>
            <v-btn icon>
              <v-icon color="blue">
                mdi-arrow-right-bold-circle-outline
              </v-icon>
            </v-btn> -->
          </div>
        </div>
        <div class="d-flex align-center">
          <span class="font-weight-bold">Location Updated: </span>
          <div class="d-flex align-center ml-2">
            <span v-if="typeof loadData.load_locations !== 'undefined' && loadData.load_locations.length">
              {{ loadData.load_locations[0].timestamp | formatDefaultData }}
            </span>
            <span v-else class="grey--text">Empty</span>
          </div>
        </div>
        <!-- <div class="d-flex align-center">
          <span class="font-weight-bold">ETA to next milestones: </span>
          <div class="d-flex align-center ml-2">
            <span class="nowrap text-block--blue">{{ loadLocationData.approximate_time | formatEtaDate }}
              (Local)</span>
          </div>
        </div> -->
        <div class="d-flex align-center">
          <span class="font-weight-bold">Current location: </span>
          <div class="d-flex align-center ml-2">
            <div v-if="typeof loadData.load_locations !== 'undefined' && loadData.load_locations.length">
              <span>{{ loadData.load_locations[0].location_name }}</span>
              <v-icon color="blue">
                mdi-map-marker
              </v-icon>
            </div>
            <div v-else class="grey--text">
              Empty
            </div>
          </div>
        </div>
      </v-col>
      <v-col cols="6">
        <v-row>
          <v-col>
            <driver-map v-if="mapData.status" :locData="mapData"></driver-map>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <div class="mr-3 font-weight-bold">Load info</div>
            <div class="load_meta_2 mt-3">
              <div><span>Miles:</span> <span class="px-1"> {{ loadData.miles }} </span></div>
              <div><span>Pieces:</span> <span class="px-1"> {{ loadData.pieces }} </span></div>
              <div><span>Weight:</span> <span class="px-1"> {{ loadData.weight }} </span></div>
              <div><span>Dims:</span> <span class="px-1"> {{
                        loadData.length != '' && loadData.width != '' && loadData.height != '' ? loadData.length + 'L x ' + loadData.width + 'W x ' + loadData.height + 'H in' : 'Not suplied'
                      }} </span></div>
              <div><span>Stackable:</span> <span class="px-1"> {{
                        loadData.isCanPutOnTop ? 'Yes' : 'No'
                      }} </span></div>
              <!--                                      Liftqate?: <span class="px-1 font-weight-bold body-1"> {{ loadData.liftgate ? 'Yes' : 'No' }} </span> <br>-->
              <!--                                      Wait and return?: <span class="px-1 font-weight-bold body-1"> {{ loadData.wait_and_return ? 'Yes' : 'No' }} </span> <br>-->
              <!--                                      Team?: <span class="px-1 font-weight-bold body-1"> {{ loadData.team ? 'Yes' : 'No' }} </span> <br>-->
              DockLevel?: <span class="px-1"> {{ loadData.dock_level ? 'Yes' : 'No' }} </span>
              <!--                                      Sys Ref: <span class="px-1 font-weight-bold body-1"> {{ loadData.sys_ref }} </span> <br>-->
              <!--                                      Pro # / Shipment ID: <span class="px-1 font-weight-bold body-1"> {{ loadData.id }} </span> <br>-->
              <!--                                      No.of items: <span class="px-1 font-weight-bold body-1"> {{ loadData.items_count }} </span> <br>-->
              <!--                                      Price: <span class="px-1 font-weight-bold body-1"> {{ loadData.price == 0 ? 'Best price' : loadData.price }} </span> <br>-->
              <div><b><span>Suggested Truck Size:</span> <span class="px-1"> {{ loadData.car }} </span></b>
              </div>
              <br>
              <template v-if="loadData.note.length > 0">
                <div><b><span>NOTE:</span> <span class="px-1w"> {{ loadData.note }} </span></b></div>
              </template>
              <br>
              <!--                                      Dangerous: <span class="px-1 font-weight-bold body-1"> {{ loadData.isDanger ? 'Yes' : 'No' }} </span> <br>-->
              <!--                                      Urgent: <span class="px-1 font-weight-bold body-1"> {{ loadData.isUrgent ? 'Yes' : 'No' }} </span> <br>-->
            </div>
          </v-col>
          <v-col cols="6">
            <div v-if="bidData.driver">
              <div class="mr-3 font-weight-bold">Bid</div>
              <v-row>
                <v-col>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <div class="grey--text mr-3">Driver name</div>
                        </td>
                        <td>
                          <div>{{ bidData.driver.user.first_name + ' ' + bidData.driver.user.last_name }}</div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="grey--text mr-3">Unit id</div>
                        </td>
                        <td>
                          <div>{{ bidData.driver.working_car }}</div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="grey--text mr-3">Driver price</div>
                        </td>
                        <td>
                          <div>
                            {{ bidData.driver_price }}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="grey--text mr-3">Broker email</div>
                        </td>
                        <td>
                          <div>
                            {{ loadData.reply_email }}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="grey--text mr-3">Broker price</div>
                        </td>
                        <td>
                          <div>
                            {{ bidData.broker_price }}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </v-col>
              </v-row>
            </div>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="3">
        <v-row>
          <v-col cols="12">
            <div class="form-group">
              <div class="font-weight-bold" style="margin-bottom: 20px">Details</div>
              <v-text-field label="Pieces" v-model="loadData.pieces" :value="loadData.pieces"
                @input="updateData('pieces')"></v-text-field>
              <v-text-field label="Total weight (Ibs)" v-model="loadData.weight" :value="loadData.weight"
                @input="updateData('weight')"></v-text-field>
            </div>
            <div class="form-group">
              <div class="font-weight-bold" style="margin-top: 20px">BOL</div>
              <v-text-field placeholder="BOL value" v-model="loadData.BOL" :value="loadData.BOL"
                @input="updateData('BOL')"></v-text-field>
            </div>
            <div class="form-group">
              <div class="font-weight-bold" style="margin-top: 20px">Address</div>
              <v-text-field :value="loadData.pickUpAt" v-model="loadData.pickUpAt" @input="updateData('pickUpAt')">
              </v-text-field>
            </div>
            <div class="form-group">
              <div class="font-weight-bold" style="margin-top: 20px">Recieved by</div>
              <v-text-field :value="loadData.recieved_by" v-model="loadData.recieved_by" @input="updateData('recieved_by')">
              </v-text-field>
            </div>
            <div class="form-group">
              <div class="font-weight-bold" style="margin-top: 20px">Uploaded pictures</div>
              <!-- <div style="display:flex; margin-top: 10px">
              <label class="picture-input" for="picture_1" style="width: 50%; margin-right: 20px">
                <v-icon large color="#1067C5">mdi-camera</v-icon>
                <span>Picture taken</span>
                <input ref="newPicture" id="picture_1" type="file" style="display: none" @change="uploadPicture">
              </label>
              <label class="picture-input" for="picture_2" style="width: 50%">
                <v-icon large color="#1067C5">mdi-camera</v-icon>
                <span>Picture taken</span>
                <input id="picture_2" type="file" style="display: none">
              </label>
            </div> -->
              <template v-if="loadData.documents && loadData.documents.length > 0">
                <div v-for="(document, index) in loadData.documents" :key="index">
                  {{ index + 1}}. <a :href="document.file" target="_blank">{{ document.name }}</a>
                </div>
              </template>
              <template v-else>
                <div>
                  No documents
                </div>
              </template>
            </div>
            <!-- <div class="form-group">
            <div class="font-weight-bold" style="margin-top: 20px">Uploaded by</div> -->
            <!-- <v-text-field
                label="Your name"
                :value="loadData.resp_driver ? loadData.resp_driver.user.first_name : ''"
              ></v-text-field> -->
            <!-- <v-text-field label="Your name"></v-text-field>
          </div> -->

            <!-- <div class="form-group">
            <div class="font-weight-bold" style="margin-top: 20px">Take Picture of the POD</div>
            <div style="display:flex; margin-top: 10px">
              <label class="picture-input" for="picture_3" style="width: 100%">
                <v-icon large color="#1067C5">mdi-camera</v-icon>
                <span>Take a picture</span>
                <input id="picture_3" type="file" style="display: none">
              </label>
            </div>
          </div> -->
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="3">
        <v-select :items="parentStatusItems" label="Main status" dense item-text="name" item-value="id"
          @change="statusConfirmDialog=true" v-model="parentStatusModel" outlined></v-select>
        <v-select :items="childStatusItems" label="Currently" dense item-text="name" item-value="id"
          @change="childStatusConfirmDialog=true" v-model="childStatusModel" outlined></v-select>
        <v-btn :disabled="!nextStatusButton" :dark="nextStatusButton" color="blue" @click="goToNextStatus">
          release unit
        </v-btn>
        <group-chat v-if="loadData && loadData.load_chat" :chatId="loadData.load_chat" :showFooter="true" class="mt-6"></group-chat>
      </v-col>

      <!-- <div class="mt-4" v-if="loadData.cargos.length > 0">
            <v-row>
              <v-col>
                <div class="mr-3 font-weight-bold">Cargo</div>
                <div class="grey--text">({{ loadData.isCanPutOnTop ? 'stackable' : 'not stackable' }},
                  {{ loadData.wait_and_return ? 'turnable' : 'not turnable' }})</div>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <div class="grey--text mr-3">Pallets</div>
                      </td>
                      <td>
                        <div>{{ loadData.cargos[0].quantity }}</div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div class="grey--text mr-3">Weight</div>
                      </td>
                      <td>
                        <div>{{ loadData.cargos[0].total_weight }} lb</div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div class="grey--text mr-3">Dims (LxWxH)</div>
                      </td>
                      <td>
                        <div>
                          {{ loadData.cargos[0].length + 'x' + loadData.cargos[0].width + 'x' + loadData.cargos[0].height }}
                          in</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </v-col>
            </v-row>
          </div> -->

    </v-row>
  </v-container>
</template>

<script>
  import driverMap from '@/components/maps/driver-map'
  import emailNotificationDialog from '@/components/loads/email-notification'
  import groupChat from '@/components/chat/group-chat'

  const axios = require('axios')
  const moment = require('moment');

  export default {
    data() {
      return {
        loading: false,
        loadData: null,
        bidData: {},
        noteDialog: false,
        actionsHistoryDialog: false,
        loadLocationData: '',
        emailNotifDialog: false,
        changeDriverDialog: false,
        chatTitle: '',
        statusConfirmDialog: false,
        driverPhone: '',
        ownerPhone: '',
        childStatusConfirmDialog: false,
        parsedLoadActions: [],
        mapData: {
          status: false,
          startLoc: '',
          endLoc: '',
          carLoc: '',
          roadLocs: []
        },
        statusLoading: false,
        allStatuses: [],
        mainStatusValue: {},
        substatusValue: {},
        parentStatusModel: {},
        childStatusModel: {},
        parentStatusItems: [],
        childStatusItems: [],
        freeDrivers: [],
        newDriver: null,
        changeParentStatusEvent: {},
        changeChildStatusEvent: {},
        statusName: ''
      }
    },
    watch: {},
    filters: {
      formatDate(date) {
        var date = moment(date);
        return date.format('ddd D MMM h:mm');
      },
      formatEtaDate(date) {
        var date = moment().add(date, 'seconds');
        return date.format('DD/M/Y hh:mm');
      },
      formatDefaultData(date) {
        var date = moment.unix(date);
        console.log(date);
        return date.format('DD/M/Y hh:mm');
      }
    },
    methods: {
      goToNextStatus() {
        if (this.mainStatusValue === 3 && this.substatusValue === 2) {
          this.parentStatusModel = 4
          this.childStatusModel = 1
          this.changeStatus('main')
        } else if (this.mainStatusValue === 5 && this.substatusValue === 2) {
          this.parentStatusModel = 6
          this.childStatusModel = 1
          this.changeStatus('main')
        }
      },
      discardChange(type) {
        if (type === 'main') {
          this.parentStatusModel = this.mainStatusValue
          this.statusConfirmDialog = false
        } else if (type === 'substatus') {
          this.childStatusModel = this.substatusValue
          this.childStatusConfirmDialog = false
        }
      },
      updateData(parametr) {
        const self = this
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        axios({
            method: 'put',
            url: self.$store.state.backendUrl + '/backend/api/loads/' + self.loadData.id + '/',
            data: formData,
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            console.log(response)
          })
          .catch(function (error) {
            console.log(error);
          });
      },
      updateDriver() {
        const self = this
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        axios({
            method: 'put',
            url: self.$store.state.backendUrl + '/backend/api/loads/' + self.loadData.id + '/',
            data: {
              resp_driver: self.newDriver
            },
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            console.log(response)
            self.updateLoadData();
            self.getFreeDrivers()
            self.changeDriverDialog = false
          })
          .catch(function (error) {
            console.log(error);
          });
      },
      uploadPicture() {

        let new_picture = this.$refs.newPicture.files[0]

        const self = this
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        let formData = new FormData()

        formData.append('file', new_picture)
        formData.append('name', new_picture.name)
        formData.append('load_id', self.loadData.id)

        axios({
            method: 'put',
            url: 'https://0ee7dc12c3a7.ngrok.io/file/',
            data: formData,
            headers: {
              'Authorization': 'JWT ' + accessToken,
              'Content-Type': 'multipart/form-data'
            },
          })
          .then(function (response) {
            console.log(response)
          })
          .catch(function (error) {
            console.log(error);
          });
      },
      changeStatus(type) {

        this.statusLoading = true
        const self = this

        if (type === 'main') {
          if (this.parentStatusModel === 3 || this.parentStatusModel === 4) {
            this.childStatusModel = 1
          }
        }

        this.mainStatusValue = this.parentStatusModel
        this.substatusValue = this.childStatusModel

        this.$globalEvents.$emit('companySentEvent', {
          action: 'load_status_change',
          data: {
            status: this.mainStatusValue,
            substatus: this.substatusValue,
            load_id: self.loadData.id
          }
        })

        this.statusConfirmDialog = false
        this.childStatusConfirmDialog = false
        this.statusLoading = false

        self.updateLoadData(false);
        self.formatStatusChanger()
      },
      updateLoadData(with_status_update = true) {
        const self = this
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/loads/' + self.$route.params.id + '/',
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {

            self.loadData = response.data.load_data
            self.loadLocationData = response.data.location_data
            self.parsedLoadActions = self.loadData.actions_json ? JSON.parse(self.loadData.actions_json).reverse() :
            []

            self.mapData = {
              status: true,
              startLoc: response.data.location_data.load_start_coords,
              endLoc: response.data.location_data.load_end_coords,
              carLoc: response.data.location_data.car_coords,
              roadLocs: response.data.load_data.load_locations
            }

            self.chatTitle = self.loadData.car
            self.bidData = response.data.bid_data

            self.updateCallsData()
            if (with_status_update) {
              self.updateStatusData()
            }

          })
          .catch(function (error) {
            console.log(error);
          });
      },
      updateCallsData() {

        const self = this
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/users/' + self.loadData.resp_driver + '/',
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            self.driverPhone = response.data.driver_info.user.phone_number
            if (response.data.owner_info === null) {
              self.ownerPhone = null
            } else {
              self.ownerPhone = response.data.owner_info.user.phone_number
            }
          })
          .catch(function (error) {
            console.log(error);
          });
      },
      formatStatusChanger() {

        let statuses = this.allStatuses
        const self = this

        statuses.forEach(function (val, index) {
          if (val.id != self.parentStatusModel && val.id != self.parentStatusModel + 1 && val.id != self
            .parentStatusModel - 1) {
            statuses[index].disabled = true
          } else {
            statuses[index].disabled = false
          }
        })

        this.parentStatusItems = statuses
      },
      getFreeDrivers() {
        const self = this
        const accessToken = this.$store.getters.getToken

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/users/drivers/?with_car=true',
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            self.freeDrivers = response.data
          })
          .catch(function (error) {
            console.log(error);
          });
      },
      updateStatusData() {
        const self = this
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/load-statuses',
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            self.allStatuses = response.data
            self.mainStatusValue = self.loadData.status
            self.parentStatusModel = self.loadData.status
            self.formatStatusChanger()
            self.statusName = self.parentStatusItems[self.parentStatusModel - 1].name
          })
          .catch(function (error) {
            console.log(error);
          });


        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/load-substatuses',
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            self.childStatusItems = response.data
            self.substatusValue = self.loadData.substatus
            self.childStatusModel = self.loadData.substatus
          })
          .catch(function (error) {
            console.log(error);
          });
      },
      setGlobalEvents() {
        const self = this
        this.$globalEvents.$on('updateLoadStatuses', (data) => {
          self.mainStatusValue = data.status
          self.substatusValue = data.substatus
          self.parentStatusModel = data.status
          self.childStatusModel = data.substatus
          self.formatStatusChanger()
        })
        this.$globalEvents.$on('updateLoadStatuses', (data) => {
          console.log(data);
          self.updateLoadData(false);
          self.formatStatusChanger()
        })
      },
    },
    created() {
      this.setGlobalEvents()
      this.updateLoadData();
      this.getFreeDrivers()
    },
    computed: {
      nextStatusButton() {
        if (this.mainStatusValue === 3 && this.substatusValue === 2) {
          return true
        } else if (this.mainStatusValue === 5 && this.substatusValue === 2) {
          return true
        }
      }
    },
    mounted() {
      const self = this
      this.$store.commit('updateToolbarData', {
        title: 'Load #' + this.$route.params.id,
        backBtn: {
          callback: function () {
            window.history.back();
          }
        },
        actions: [{
            type: 'icon-text',
            text: "Call driver",
            icon: 'mdi-phone',
            action: () => {
              self.$globalEvents.$emit('telephonyCallToNumber', self.driverPhone, false)
            },
            class: 'blue--text text-capitalize text--lighten-1'
          },
          {
            type: 'icon-text',
            text: "Call owner",
            icon: 'mdi-phone',
            action: () => {
              if (self.ownerPhone === null) {
                alert("Owner phone not found")
              } else {
                self.$globalEvents.$emit('telephonyCallToNumber', self.ownerPhone, false)
              }
            },
            class: 'blue--text text-capitalize text--lighten-1'
          },
          {
            type: 'icon-text',
            text: "Edit",
            icon: 'mdi-pencil',
            action: () => {
              self.$router.push('/loads/edit/' + self.loadData.id + '/')
            },
            class: 'blue--text text-capitalize text--lighten-1'
          },
          {
            type: 'icon-text',
            text: "Change driver",
            icon: 'mdi-pencil',
            action: () => {
              self.changeDriverDialog = true
            },
            class: 'blue--text text-capitalize text--lighten-1'
          },
          // {
          //   type: 'icon-text',
          //   text: "Copy",
          //   icon: 'mdi-content-copy',
          //   action: () => {},
          //   class: 'blue--text text-capitalize text--lighten-1'
          // },
          {
            type: 'icon-text',
            text: "Notes",
            icon: 'mdi-note-outline',
            action: () => {
              self.noteDialog = true
            },
            class: 'blue--text text-capitalize text--lighten-1'
          },
          {
            type: 'icon-text',
            text: "Logs",
            icon: 'mdi-information-outline',
            action: () => {
              self.actionsHistoryDialog = true;
            },
            class: 'blue--text text-capitalize text--lighten-1'
          },
          {
            type: 'icon-text',
            text: "Email Notifications",
            icon: 'mdi-email-outline',
            action: () => {
              self.emailNotifDialog = true
            },
            class: 'blue--text text-capitalize text--lighten-1'
          },
          // {
          //   type: 'icon-menu',
          //   icon: 'mdi-dots-horizontal',
          //   color: 'blue',
          //   items: [{
          //     title: 'Attachments',
          //     icon: 'mdi-file-document',
          //     action: function () {

          //     }
          //   }],
          // },
        ]
      })
    },
    beforeDestroy() {
      this.$store.commit('updateToolbarData', {})
    },
    components: {
      driverMap,
      emailNotificationDialog,
      groupChat
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
