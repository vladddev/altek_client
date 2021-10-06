<template>
  <v-dialog v-model="open" max-width="700px" @close="closeDialog(false)" @click:outside="closeDialog(false)">
    <v-card class="elevation-12 pa-4" :loading="loading">
      <v-card-title>Create new car</v-card-title>
      <v-form ref="form" v-model="valid">
        <v-card-text>
          <v-row>
            <v-subheader class="font-weight-bold subtitle-1">General info:</v-subheader>
          </v-row>
          <v-divider></v-divider>
          <v-row>
            <v-col cols="4">
              <v-text-field
                label="Number"
                v-model="newCar.number"
              />
            </v-col>
            <v-col cols="4">
              <v-select
                v-model="newCar.type"
                :items="carVariants"
                :menu-props="{ maxHeight: '400' }"
                label="Transport type"
              ></v-select>
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Car model"
                v-model="newCar.carModel"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Car year"
                type="number"
                v-model="newCar.carYear"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-subheader class="font-weight-bold subtitle-1">Car sizes:</v-subheader>
          </v-row>
          <v-divider></v-divider>
          <v-row>
            <v-col cols="4">
              <v-text-field
                label="Width"
                v-model="newCar.width"
                type="number"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Height"
                v-model="newCar.height"
                type="number"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Length"
                v-model="newCar.length"
                type="number"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-subheader class="font-weight-bold subtitle-1">Car details:</v-subheader>
          </v-row>
          <v-divider></v-divider>
          <v-row>
            <v-col cols="4">
              <v-text-field
                label="Available city"
                v-model="newCar.availableCity"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Available weight"
                v-model="newCar.weight"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Vin"
                v-model="newCar.vin"
                :rules="requiredRules"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="Licence plate"
                v-model="newCar.licensePlate"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="Licance state"
                v-model="newCar.licenseState"
              />
            </v-col>
            <v-col cols="6">
              <v-menu
                ref="expiryDateMenu"
                v-model="expiryDateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="newCar.licenseExpiryDate"
                    label="Licence expiry date"
                    readonly
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker v-model="newCar.licenseExpiryDate" no-title scrollable>
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="expiryDateMenu = false">Cancel</v-btn>
                  <v-btn text color="primary" @click="$refs.expiryDateMenu.save(newCar.licenseExpiryDate)">OK</v-btn>
                </v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="6">
              <v-menu
                ref="insuranceDateMenu"
                v-model="insuranceDateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="newCar.insuranceExpiry"
                    label="Insurance expiry"
                    readonly
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker v-model="newCar.insuranceExpiry" no-title scrollable>
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="insuranceDateMenu = false">Cancel</v-btn>
                  <v-btn text color="primary" @click="$refs.insuranceDateMenu.save(newCar.insuranceExpiry)">OK</v-btn>
                </v-date-picker>
              </v-menu>
            </v-col>
          </v-row>
          <v-row>
            <v-subheader class="font-weight-bold subtitle-1">Other information:</v-subheader>
          </v-row>
          <v-divider></v-divider>
          <v-row>
            <v-col cols="6">
              <v-select
                v-model="newCar.dispatcher"
                :items="dispatchers"
                item-text="email"
                item-value="id"
                :menu-props="{ maxHeight: '400' }"
                label="Dispatcher"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="newCar.car_owner"
                :items="owners"
                item-text="email"
                item-value="id"
                :menu-props="{ maxHeight: '400' }"
                label="Car owner"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                :loading="drivers == []"
                v-model="newCar.drivers"
                :items="drivers"
                item-text="email"
                item-value="id"
                :rules="multiSelectRules"
                :menu-props="{ maxHeight: '400' }"
                multiple
                :hint="newCar.car_owner == '' ? 'Please choose car owner' : ''"
                :persistent-hint="newCar.car_owner == ''"
                label="Drivers"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                :loading="drivers == []"
                v-model="activeDriver"
                :items="activeDriverItems"
                item-text="email"
                item-value="id"
                :menu-props="{ maxHeight: '400' }"
                label="Active driver"
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field
                label="Notice"
                v-model="newCar.note"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn
            @click="closeDialog(false)"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="submit"
          >Submit
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>

const axios = require('axios')
const moment = require('moment')

export default {
  name: 'new-car-dialog',
  props: ['open', 'dialogData', 'closeEvent'],
  data() {
    return {
      loading: false,
      is_open: false,
      newCar: {},
      valid: false,
      car_owners: [],
      expiryDateMenu: false,
      insuranceDateMenu: false,
      dispatchers: [],
      activeDriver: '',
      drivers: [],
      owners: [],
      carVariants: ['Cargo van', 'Small straight', 'Large straight'],
      multiSelectRules: [
        (v) => {
          if (v) {
            if (v.length === 0) {
              return false
            } else {
              return true
            }
          }
        },
      ],
      requiredRules: [
        v => !!v || 'This field is required',
      ],
      sortingOptions: {
        orderBy: '',
        order: ''
      },
      page: 1
    }
  },
  watch: {
    open: function (val) {
      if (val) {
        this.is_open = true
        this.setDriversList()
      }
    }
  },
  filters: {},
  methods: {
    closeDialog(with_update) {
      this.drivers = []
      this.newCar = {}
      this.$refs.form.reset()
      this.closeEvent(with_update)
    },
    submit() {

      if (!this.$refs.form.validate()) return false

      let self = this
      const accessToken = this.$store.getters.getToken

      let formData = JSON.parse(JSON.stringify(self.newCar));

      if (this.activeDriver !== '') {
        formData.active_driver_id = this.activeDriver
      }

      delete formData.active_driver

      axios({
        method: 'POST',
        url: self.$store.state.backendUrl + '/backend/api/cars/add/',
        data: formData,
        headers: {'Authorization': 'JWT ' + accessToken},
      })
        .then(function (response) {
          console.log(response)
          if (response.status == 201) {
            self.closeDialog(true)
          }
        })
        .catch(function (error) {
          self.loading = false;
          console.log(error);
        });
    },
    setDriversList() {

      const self = this
      const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')

      axios({
        method: 'get',
        url: self.$store.state.backendUrl + '/backend/api/users/drivers',
        headers: {'Authorization': 'JWT ' + accessToken},
      })
        .then(function (response) {
          if (response.data == []) return false

          let driverItems = []

          response.data.forEach(function (driver, index) {
            driverItems.push({
              id: driver.id,
              email: driver.email
            })
          })

          self.drivers = driverItems

          self.setOwnersList()
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    setOwnersList() {
      const self = this
      const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')

      axios({
        method: 'get',
        url: self.$store.state.backendUrl + '/backend/api/owners/my/',
        headers: {'Authorization': 'JWT ' + accessToken},
      })
        .then(function (response) {
          if (response.data == []) return false

          let ownerItems = []

          response.data.forEach(function (driver, index) {
            ownerItems.push({
              id: driver.id,
              email: driver.email
            })
          })

          self.owners = ownerItems
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  },
  computed: {
    activeDriverItems() {

      if (this.newCar.drivers === undefined) return
      if (this.newCar.drivers.length === 0) return

      let drivers = []
      const self = this
      self.drivers.map(function (val, index) {

        if(self.newCar.drivers[0].id !== undefined) {
          if(self.newCar.drivers.some(driver => driver.id === val.id)) {
            drivers.push(val)
          }
        }else {
          if(self.newCar.drivers.some(id => id === val.id)) {
            drivers.push(val)
          }
        }
      })
      return drivers
    }
  },
  created() {

  },
  beforeDestroy() {

  },
  components: {}
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
