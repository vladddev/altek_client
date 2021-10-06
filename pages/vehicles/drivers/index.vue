<template>  
  <v-container fluid>
    <v-menu offset-y v-if="checkedDrivers.length > 0">
      <template v-slot:activator="{ on, attrs }">
        <v-btn class="mb-3" color="blue" dark v-bind="attrs" v-on="on">
          Change status
        </v-btn>
      </template>
      <v-list>
        <v-list-item v-for="(item, index) in driverStatuses" :key="index" :value="item.id"
          @click="changeDriverStatus(item.id)">
          <v-list-item-title>{{ item.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <template v-if="checkedDrivers.length > 0">
      <v-select style="width: 200px" v-model="responsible" :items="all_users" item-text="email" item-value="id"
        label="Responsible">
      </v-select>
    </template>
    <v-data-table :headers="headers" :items="users" :style="loading ? 'opacity: 0.7; pointer-events: none;' : ''"
      :options.sync="options" :server-items-length="totalUsers" :loading="loading" :footer-props="{
          'items-per-page-options': [-1, 10, 25, 50]
        }" class="elevation-1">
      <div class="checkbox-all">
        asd
      </div>
      <template v-slot:item.actions="{item}">
        <v-btn icon color="blue" @click="openLocationDialog(item)">
          <v-icon>mdi-map-marker</v-icon>
        </v-btn>
        <v-btn icon color="blue" @click="openChat(item.id)">
          <v-icon>mdi-message-text-outline</v-icon>
        </v-btn>
        <v-btn icon color="blue" @click="openDetails(item.id)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>

      <template v-slot:item.check="{item}">
        <v-checkbox v-model="checkedDrivers" color="blue" :value="item.id"></v-checkbox>
      </template>

      <template v-slot:item.responsible="{item}">
        <span>{{ item.driver_info.responsible_user != null ? item.driver_info.responsible_user.email : '' }}</span>
      </template>

      <template v-slot:item.driver_status="{item}">
        <span>{{ item.driver_info.status }}</span>
      </template>

      <template v-slot:item.driver="{item}">
        <p>{{ item.email }}</p>
        <p>{{ item.first_name }}</p>
      </template>

    </v-data-table>

    <v-dialog v-model="dialog" max-width="500px">
      <v-form ref="form" v-model="valid" @submit.prevent="validate">
        <v-card class="elevation-12 pa-4" :loading="loading">
          <v-card-text>
            <v-text-field label="Email" prepend-icon="mdi-at" :rules="emailRules" v-model.trim="email"
              :error-messages="emailErrors" :error="emailErrors.length > 0" @input="emailErrors = []" />
            <v-text-field v-model="firstName" label="First Name" prepend-icon="mdi-account-details"
              :rules="requiredRules"></v-text-field>
            <v-text-field v-model.trim="lastName" label="Last Name" prepend-icon="mdi-account-details"
              :rules="requiredRules"></v-text-field>
            <v-text-field v-model.trim="zip" label="Zip Code" prepend-icon="mdi-account-details" :rules="requiredRules">
            </v-text-field>
            <v-text-field label.trim="Phone number" prepend-icon="mdi-phone" :rules="requiredRules" v-model="phone" />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="dialog = false" > Cancel </v-btn>
            <v-btn :disabled="!valid" color="primary" type="submit">Add driver
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-dialog v-model="locationDialog" max-width="500px">
      <v-form ref="form">
        <v-card class="elevation-12 pa-4">
          <v-card-title>
            <span>Driver location</span>
            <v-spacer />
            <v-btn icon @click="locationDialog = false, locationDialogData = {}">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-subtitle>Driver email: {{ locationDialogData.email }}</v-card-subtitle>
          <v-card-text>
            <v-text-field label="Adress" color="blue" :value="locationDialogData.address" prepend-icon="mdi-map" />
            <v-text-field label="Coordinates" color="blue" :value="locationDialogData.coordinates"
              prepend-icon="mdi-map-marker"></v-text-field>
            <v-text-field label="Zip code" color="blue" :value="locationDialogData.zipcode"
              prepend-icon="mdi-map-marker-radius"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="locationDialog = false" > Cancel </v-btn>
            <v-btn color="blue" dark>
              Update
              <v-icon right dark>mdi-cloud-upload
              </v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-container>
</template>

<script>
  const axios = require('axios');
  export default {
    data() {
      return {
        loading: true,
        totalUsers: 0,
        options: {
          itemsPerPage: -1
        },
        users: [],
        locationDialog: false,
        locationDialogData: {},
        driverStatuses: [],
        checkedDrivers: [],
        headers: [{
            text: '',
            value: 'check',
            align: 'center'
          },
          {
            text: 'Driver',
            value: 'driver',
            align: 'center'
          },
          {
            text: 'Zip code',
            value: 'zip_code',
            align: 'center'
          },
          {
            text: 'Phone number',
            value: 'phone_number',
            align: 'center'
          },
          {
            text: 'Adress',
            value: 'address',
            align: 'center'
          },
          {
            text: 'Responsible',
            value: 'responsible',
            align: 'center'
          },
          {
            text: 'Status',
            value: 'driver_status',
            align: 'center'
          },
          {
            text: 'Actions',
            value: 'actions',
            sortable: false,
            align: 'center'
          },
        ],
        dialog: false,
        message: '',
        valid: true,
        phone: '',
        zip: '',
        email: '',
        emailErrors: [],
        firstName: '',
        lastName: '',
        responsible: {},
        all_users: [],
        emailRules: [
          v => !!v || 'E-mail is required',
          v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
        ],
        requiredRules: [
          v => !!v || 'This field is required',
        ],
      }
    },
    methods: {
      openLocationDialog(item) {
        this.locationDialogData = {
          id: item.id,
          email: item.email,
          address: item.address,
          coordinates: item.driver_info.location,
          zipcode: item.zip_code
        }
        this.locationDialog = true
      },
      updateDriversList() {

        this.loading = true

        const self = this
        const accessToken = this.$store.getters.getToken

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/users/drivers/',
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            // console.log(response);

            let usersData = self.sortingAll(response.data)
            self.users = usersData.items
            self.totalUsers = usersData.total
            self.loading = false
            self.checkedDrivers = []
          })
          .catch(function (error) {
            console.log(error);
          });

        if (this.users.length < 1) {
          this.$globalEvents.$emit('renewUserList')
        }
      },
      changeDriverStatus(id) {

        const self = this
        const accessToken = this.$store.getters.getToken

        axios({
            method: 'post',
            url: self.$store.state.backendUrl + '/backend/api/users/drivers/update',
            data: {
              drivers: self.checkedDrivers,
              status_id: id
            },
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            self.$globalEvents.$emit('notify', 'Saved')
            if (response.data.result == 'ok') {
              self.updateDriversList()
            }
          })
          .catch(function (error) {
            console.log(error);
          });
      },
      sortingAll(users) {
        const {
          sortBy,
          sortDesc,
          page,
          itemsPerPage
        } = this.options

        let items = users
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
          item.name = item.first_name + ' ' + item.last_name
        });

        if (itemsPerPage > 0) {
          items = items.slice((page - 1) * itemsPerPage, page * itemsPerPage)
        }

        return {
          items,
          total,
        }

      },
      validate() {
        let self = this;

        this.$refs.form.validate()
        if (this.valid === true) {
          let email = this.email
          let zip = this.zip
          let firstName = this.firstName
          let lastName = this.lastName
          let phoneNumber = this.preparePhone(this.phone)

          const accessToken = this.$store.getters.getToken

          this.loading = true

          axios({
              method: 'post',
              url: self.$store.state.backendUrl + '/backend/api/users/drivers/',
              data: {
                email: email,
                zip_code: zip,
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNumber,
                password: 'password'
              },
              headers: {
                'Authorization': 'JWT ' + accessToken
              },
            })
            .then(function (response) {
              // let data = {"email":["user with this email already exists."]}
              // let errorMessage = data.email[0]
              // errorMessage = errorMessage[0].toUpperCase() + errorMessage.slice(1)
              // self.emailErrors.push(errorMessage)
              self.loading = false
              self.dialog = false
              self.$refs.form.reset()
              self.$globalEvents.$emit('renewUserList')
              self.$globalEvents.$emit('notify', 'Saved')
              self.updateDriversList()
            })
            .catch(function (error) {
              if (error.response.status === 400) {
                let errorMessage = error.response.data.email[0]
                errorMessage = errorMessage[0].toUpperCase() + errorMessage.slice(1)
                self.emailErrors.push(errorMessage)
              }

              self.loading = false;
              console.log(error);
            });

        }
      },
      getUsers() {
        const self = this;
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        return new Promise((resolve, reject) => {
          let users = null;

          axios({
              method: 'get',
              url: self.$store.state.backendUrl + '/backend/api/users/drivers/',
              headers: {
                'Authorization': 'JWT ' + accessToken
              },
            })
            .then(function (response) {
              console.log(response);
              users = response.data
              resolve(users)
              // self.loading = false;
            })
            .catch(function (error) {
              // self.loading = false;
              console.log(error);
            });
        })
      },
      preparePhone(number) {
        return number.replace(/[^+\d]/g, '')
      },
      openChat(id) {
        this.$router.push('/sms/' + id + '/')
      },
      openDetails(id) {
        this.$router.push('/vehicles/drivers/' + id + '/')
      },
    },
    watch: {
      responsible: function (val, oldVal) {
        const self = this;
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        axios({
            method: 'post',
            url: self.$store.state.backendUrl + '/backend/api/users/drivers/update',
            data: {
              drivers: self.checkedDrivers,
              responsible_user: self.responsible
            },
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            if (response.data.result == "ok") {
              self.checkedDrivers = []
              self.updateDriversList()
            }
          })
          .catch(function (error) {
            // self.loading = false;
            alert('error')
            console.log(error);
          });
      },
      options: {
        handler() {
          if (this.users.length < 1) {
            return
          }

          this.loading = true
          this.getUsers()
            .then(data => {
              let usersData = this.sortingAll(data)
              this.users = usersData.items
              this.totalUsers = usersData.total

              this.loading = false
            })

        },
      },
    },
    created() {
      const self = this
      const accessToken = this.$store.getters.getToken

      this.$globalEvents.$on('refreshTokens', () => {
        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/check-permissions/',
            params: {
              page: self.$router.history.current.path
            },
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            console.log(response);

            if (response.data.allow) {

            } else {
              self.$router.push('/')
            }
          })
          .catch(function (error) {
            console.log(error);
          });
      })

      this.updateDriversList()

      axios({
          method: 'get',
          url: self.$store.state.backendUrl + '/backend/api/driver-statuses',
          headers: {
            'Authorization': 'JWT ' + accessToken
          },
        })
        .then(function (response) {
          self.driverStatuses = response.data
        })
        .catch(function (error) {
          console.log(error);
        });

      axios({
          method: 'get',
          url: self.$store.state.backendUrl + '/backend/api/users/all',
          headers: {
            'Authorization': 'JWT ' + accessToken
          },
        })
        .then(function (response) {
          self.all_users = response.data
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    mounted() {
      const self = this
      this.$store.commit('updateToolbarData', {
        title: 'Drivers',
        backBtn: {
          callback: function () {
            window.history.back();
          }
        },
        actions: [{
          type: 'icon-text',
          icon: 'mdi-pencil-box-outline',
          text: 'Add driver',
          color: 'blue',
          class: 'blue--text text-capitalize',
          action: () => {
            self.dialog = true
          }
        }]
      })
    },
    beforeDestroy() {
      this.$store.commit('updateToolbarData', {})
      this.$globalEvents.$off('refreshTokens')
      this.$globalEvents.$off('renewUserList')
    },
  }

</script>

<style lang="css" scoped>
  .v-application p {
    margin-bottom: 0 !important;
  }

</style>
