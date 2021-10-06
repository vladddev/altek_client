<template>
  <v-container fluid class="pa-6 mb-10">
    <template v-if="pageIndex === 1">
      <v-row>
        <v-col>Load Ref.:#{{ load_data.id }}</v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field v-model="load_data.dispatcher_note" label="Text field" hint="Write your text here">
          </v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field v-model="load_data.sys_ref" label="Customer Ref" hint="Write your text here"></v-text-field>
          <v-row>
            <v-col cols="6" v-for="(customerRef, index) in customerRefs" :key="index">
              <v-text-field v-model="customerRefs[index]" label="New Customer Ref" prepend-icon="mdi-minus"
                @click:prepend="deleteCustomerRef(index)"></v-text-field>
            </v-col>
          </v-row>
          <v-btn @click="addCustomerRef()">Add customer ref</v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field v-model="load_data.dispatcher_note" label="Text field" hint="Write your text here">
          </v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field v-model="load_data.dispatcher_note" label="Text field" hint="Write your text here">
          </v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field v-model="load_data.dispatcher_note" label="Text field" hint="Write your text here">
          </v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field v-model="load_data.dispatcher_note" label="Text field" hint="Write your text here">
          </v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-spacer></v-spacer>
        <v-col cols="1">
          <v-btn @click="pageIndex++">Next</v-btn>
        </v-col>
      </v-row>
    </template>
    <template v-else-if="pageIndex === 2">
      <v-row>
        <v-col>
          <v-select v-model="load_data.weight_units" :items="['Pounds', 'Kilograms']" label="Weight units" hide-details
            single-line></v-select>
        </v-col>
        <v-col>
          <v-select v-model="load_data.dimensions_units" :items="['Inches', 'Сentimeters']" label="Dimensions units"
            hide-details single-line></v-select>
        </v-col>
        <v-col>
          <v-checkbox v-model="load_data.isDanger" label="Dangerouus"></v-checkbox>
        </v-col>
        <v-col>
          <v-checkbox v-model="load_data.isUrgent" label="Urgent"></v-checkbox>
        </v-col>
        <v-col>
          <v-checkbox v-model="load_data.isCanPutOnTop" label="Stackable"></v-checkbox>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="3">
          <v-row>
            <v-col cols="12" v-for="(point, index) in load_data.points" :key="index">
              <div class="mr-2">
                <div class="deliver-points-number">
                  <span class="deliver-points-number__item">
                    {{ index + 1 }}
                  </span>
                </div>
              </div>
              <div class="mb-3">
                <div class="deliver-points-title">{{ point.type }}</div>
                <div class="deliver-points-value">{{ point.full_name }}</div>
                <div class="deliver-points-date">{{ point.datetime }}</div>
                <v-btn v-if="index > 1" @click="deletePoint(index)">Remove point</v-btn>
              </div>
            </v-col>
            <!-- <v-col cols="12">
              <v-btn @click="newPointDialog = true">Add Point</v-btn>
            </v-col> -->
          </v-row>
        </v-col>
        <v-col cols="6">
          <v-row>
            <v-col>
              <v-text-field v-model="load_data.company" label="Company name">
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" v-for="(cargo, index) in load_data.cargos" :key="index">
              <v-card>
                <v-card-title>Cargo</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="4">
                      <v-select v-model="load_data.cargos[index].package_type" :items="['Pieces', 'Pieces']" label="Package type">
                      </v-select>
                    </v-col>
                    <v-col cols="4">
                      <v-text-field label="Quantity" v-model="load_data.cargos[index].quantity" type="number"></v-text-field>
                    </v-col>
                    <v-col cols="4">
                      <v-text-field label="Total weight" v-model="load_data.cargos[index].total_weight" type="number"></v-text-field>
                    </v-col>
                    <v-col cols="4">
                      <v-text-field label="Width" v-model="load_data.cargos[index].width" type="number"></v-text-field>
                    </v-col>
                    <v-col cols="4">
                      <v-text-field label="Height" v-model="load_data.cargos[index].height" type="number"></v-text-field>
                    </v-col>
                    <v-col cols="4">
                      <v-text-field label="Length" v-model="load_data.cargos[index].length" type="number"></v-text-field>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="3">
          <h3>Total Shipment Info</h3>
          <h3>Total Quantity</h3>
          {{ load_data.cargos[0].package_type ? load_data.cargos[0].package_type : 'Pieces' }}: {{ load_data.cargos[0].quantity }}
          <h3>Total Weight</h3>
          {{ load_data.cargos[0].total_weight }} {{ load_data.weight_units }}
        </v-col>
      </v-row>
      <v-row>
        <v-spacer></v-spacer>
        <v-col cols="1">
          <v-btn @click="pageIndex--">Prev</v-btn>
        </v-col>
        <v-col cols="1">
          <v-btn @click="pageIndex++">Next</v-btn>
        </v-col>
      </v-row>
    </template>
    <template v-else-if="pageIndex === 3">
      <v-row>
        <v-col cols="4">Customer Ref: {{ pageIndex }}</v-col>
        <v-col cols="4">Dangerous?: {{ load_data.isDanger ? 'Yes' : 'No' }}</v-col>
        <v-col cols="4">Stackable?: {{ load_data.isCanPutOnTop ? 'Yes' : 'No' }}</v-col>
        <v-col cols="4">Dock Height?: {{ load_data.dock_level ? 'Yes' : 'No' }}</v-col>
        <v-col cols="4">Team?: {{ load_data.team ? 'Yes' : 'No' }}</v-col>
        <v-col cols="4">Liftgate?: {{ load_data.liftgate ? 'Yes' : 'No' }}</v-col>
        <v-col cols="4">Wait and return?: {{ load_data.wait_and_return ? 'Yes' : 'No' }}</v-col>
        <v-col cols="4">Urgent?: {{ load_data.isUrgent ? 'Yes' : 'No' }}</v-col>
        <v-col cols="4">Company: {{ load_data.company }}</v-col>
        <v-col cols="4">Authorization Co.: N/A</v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <v-row>
            <v-col cols="12" v-for="(point, index) in load_data.points" :key="index">
              <div class="mr-2">
                <div class="deliver-points-number">
                  <span class="deliver-points-number__item">
                    {{ index + 1 }}
                  </span>
                </div>
              </div>
              <div class="mb-3">
                <div class="deliver-points-title">{{ point.type }}</div>
                <div class="deliver-points-value">{{ point.full_name }}</div>
                <div class="deliver-points-date">{{ point.datetime }}</div>
              </div>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="6">
          <driver-map :locData="mapData"></driver-map>
        </v-col>
      </v-row>
      <v-row>
        <v-spacer></v-spacer>
        <v-col cols="1">
          <v-btn @click="pageIndex--">Prev</v-btn>
        </v-col>
      </v-row>
    </template>
    <v-dialog v-model="newPointDialog" max-width="400">
      <v-card class="elevation-12 pa-4">
        <v-card-title class="headline">
          Add point
        </v-card-title>
        <v-card-text>
          <v-select v-model="newPointData.type" :items="['Pick-up point', 'Delivery point']" label="Point type">
          </v-select>
          <v-text-field label="Country" v-model="newPointData.country"></v-text-field>
          <v-text-field label="State" v-model="newPointData.state"></v-text-field>
          <v-text-field label="City" v-model="newPointData.city"></v-text-field>
          <v-text-field label="Zip-code" v-model="newPointData.zip_code"></v-text-field>
          <v-text-field label="Time" v-model="newPointData.datetime" type="datetime-local"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn
            @click="open = false"
          >
            Cancel
          </v-btn>
          <v-btn @click="addPoint">Add Point</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import driverMap from '@/components/maps/driver-map'

  const axios = require('axios');
  const moment = require('moment');

  export default {
    data() {
      return {
        loading: false,
        pageIndex: 1,
        newPointDialog: false,
        newPointData: {
          full_name: "",
          type: "Pick-up point",
          country: "",
          state: "",
          city: "",
          zip_code: "",
          datetime: ""
        },
        mapData: {
          status: false,
          startLoc: '',
          endLoc: '',
          carLoc: '',
          roadLocs: []
        },
        load_id: this.$route.params.id,
        customerRefs: [],
        load_data: {}
      }
    },
    methods: {
      addCustomerRef() {
        this.customerRefs.push('')
      },
      deleteCustomerRef(index) {
        this.customerRefs.splice(index, 1)
      },
      addPoint() {
        this.newPointData.full_name = this.newPointData.city + ', ' + this.newPointData.state + ' ' + this.newPointData
          .zip_code
        this.load_data.points.push(this.newPointData)
        this.newPointData = {
          full_name: '',
          type: "Pick-up point",
          country: "",
          state: "",
          city: "",
          zip_code: "",
          datetime: ""
        }
        this.newPointDialog = false
      },
      deletePoint(index) {
        this.load_data.points.splice(index, 1)
      },
      sendNewLoadData() {
        if (this.customerRefs.length > 0) {
          this.load_data.sys_ref += '%~%' + this.customerRefs.join('%~%')
        }


      },
      updateLoadData() {
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
            const loadData = response.data.load_data
            const loadRefs = loadData.sys_ref.split('%~%')
            loadData.sys_ref = loadRefs.pop(0)

            self.customerRefs = loadRefs
            self.load_data = loadData
            self.mapData = {
              status: true,
              startLoc: response.data.location_data.load_start_coords,
              endLoc: response.data.location_data.load_end_coords,
              carLoc: response.data.location_data.car_coords,
              roadLocs: []
            }
          })
          .catch(function (error) {
            console.log(error);
          });
      },
    },
    computed: {},
    filters: {
      formatDate(date) {
        var date = moment(date);
        return date.format('ddd D MMM h:mm');
      },
    },
    created() {
      this.updateLoadData()
    },
    mounted() {
      this.$store.commit('updateToolbarData', {
        title: 'Edit Shipment Ref. #' + this.$route.params.id,
        menu: [{
            title: 'SHIPMENT DETAILS',
            icon: 'mdi-file-document',
            onclick: () => this.pageIndex = 1
          },
          {
            title: 'LOCATIONS & CARGO',
            icon: 'mdi-truck',
            onclick: () => this.pageIndex = 2
          },
          {
            title: 'CONFIRMATION',
            icon: 'mdi-map-marker',
            onclick: () => this.pageIndex = 3
          }
        ]
      })
    },
    beforeDestroy() {

    },
    components: {
      driverMap
    }
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

</style>
