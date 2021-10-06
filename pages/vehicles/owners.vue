<template>
  <v-container fluid>
    <v-data-table :headers="headers" :items="owners" :options.sync="options" :server-items-length="totalOwners"
      :loading="loading" :footer-props="{
        'items-per-page-options': [-1, 10, 25, 50]
      }" class="elevation-1">
      
      <template v-slot:item.actions="{ item }">
        <v-btn icon color="blue" @click="$globalEvents.$emit('telephonyCallToNumber', item.phone_number, true)">
          <v-icon>mdi-phone</v-icon>
        </v-btn>
        <v-btn icon color="blue" @click="openChat(item)">
          <v-icon>mdi-message-text-outline</v-icon>
        </v-btn>
        <v-btn icon color="blue" @click="editMode=true; openEditDialog(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <newOwnerDialog :open="newOwnerDialogOpen" :close-event="closeNewOwnerDialog"></newOwnerDialog>

    <v-dialog v-model="dialog" max-width="700px">
      <v-form ref="form" v-model="valid" @submit.prevent="validate">
        <v-card class="elevation-12 pa-4" :loading="loading">
          <v-card-text>
            <v-row>
              <v-col cols="4">
                <v-text-field label="First name" v-model="editOwner.user.first_name" />
              </v-col>
              <v-col cols="4">
                <v-text-field label="Last name" v-model="editOwner.user.last_name" />
              </v-col>
              <v-col cols="4">
                <v-text-field label="Applicant name" v-model="editOwner.applicant_name" />
              </v-col>
              <v-col cols="4">
                <v-text-field label="Email" v-model="editOwner.user.email" :rules="requiredRules"
                  :disabled="Boolean(editOwner.user.id)" />
              </v-col>
              <v-col cols="4">
                <v-text-field label="SSN" v-model="editOwner.ssn" />
              </v-col>
              <v-col cols="4">
                <v-text-field label="Address" v-model="editOwner.user.address" />
              </v-col>
              <v-col cols="4">
                <v-text-field label="City" v-model="editOwner.city" />
              </v-col>
              <v-col cols="4">
                <v-text-field label="State" v-model="editOwner.state" />
              </v-col>
              <v-col cols="4">
                <v-text-field label="Phone" v-model="editOwner.user.phone_number" />
              </v-col>
              <v-col cols="4">
                <v-text-field label="Emergency phone" v-model="editOwner.user.emergency_phone" />
              </v-col>
              <v-col cols="4">
                <v-text-field label="Tax classification" v-model="editOwner.tax_classification" />
              </v-col>
              <v-col cols="4">
                <v-text-field label="Sub tax classification" v-model="editOwner.sub_tax_classification" />
              </v-col>
              <v-col cols="4">
                <v-text-field label="ZIP" v-model="editOwner.user.zip_code" />
              </v-col>
              <v-col cols="4">
                <v-text-field label="Routing number" v-model="editOwner.routing_number" />
              </v-col>
              <v-col cols="4">
                <v-text-field label="Accounting number" v-model="editOwner.accounting_number" />
              </v-col>
              <v-col cols="4">
                <v-text-field label="Bank name" v-model="editOwner.bank_name" />
              </v-col>
              <v-col cols="4">
                <v-text-field label="Company name" v-model="editOwner.company_name" />
              </v-col>
              <v-col cols="4">
                <v-text-field label="Company address" v-model="editOwner.company_street_address" />
              </v-col>
              <v-col cols="4">
                <v-text-field label="Company city" v-model="editOwner.company_city_state" />
              </v-col>
              <v-col cols="8">
                <v-text-field label="Description" v-model="editOwner.other_description" />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="dialog = false" > Cancel </v-btn>
            <v-btn v-if="editMode" color="red" outlined @click="deleteConfirmDialog=true">Delete
            </v-btn>
            <v-btn color="primary" type="submit">Submit
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <v-dialog v-model="deleteConfirmDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">
          Delete a owner
        </v-card-title>
        <v-card-text>Are you sure you want to delete a driver with id #{{ editOwner.user.id }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="deleteConfirmDialog = false">
            Cancel
          </v-btn>
          <v-btn color="red darken-1" text @click="deleteOwner(editOwner.user.id)">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import newOwnerDialog from '@/components/owners/new_owner'

  const axios = require('axios');

  export default {
    data() {
      return {
        loading: true,
        loaded: false,
        totalOwners: 0,
        editMode: false,
        options: {
          itemsPerPage: -1
        },
        newOwnerDialogOpen: false,
        owners: [],
        headers: [{
            text: 'ID',
            value: 'id',
            align: 'center'
          },
          {
            text: 'Company Name',
            value: 'company_name'
          },
          {
            text: 'Name',
            value: 'first_name'
          },
          {
            text: 'Address',
            value: 'address'
          },
          {
            text: 'Email',
            value: 'email'
          },
          {
            text: 'Actions',
            value: 'actions',
            sortable: false,
            align: 'center'
          },
        ],
        dialog: false,
        menu1: false,
        menu2: false,
        valid: true,
        deleteConfirmDialog: false,
        ownerID: null,
        editOwner: {
          applicant_name: null,
          ssn: null,
          city: null,
          state: null,
          tax_classification: null,
          sub_tax_classification: null,
          other_description: null,
          routing_number: null,
          accounting_number: null,
          bank_name: null,
          company_street_address: null,
          company_city_state: null,
          company_name: null,
          user: {
            email: "",
            address: "",
            first_name: "",
            last_name: "",
            phone_number: "",
            emergency_phone: "",
          }
        },
        // editOwner: {},
        requiredRules: [
          v => !!v || 'This field is required',
        ],
      }
    },
    methods: {
      closeNewOwnerDialog(with_update = false) {
        this.newOwnerDialogOpen = false

        if (with_update) {
          this.updateOwnersList()
        }
      },
      deleteOwner(id) {

        const self = this
        let accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        axios({
            method: 'DELETE',
            url: self.$store.state.backendUrl + '/backend/api/owners/' + id + '/',
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            self.deleteConfirmDialog = false
            self.dialog = false
            self.$globalEvents.$emit('notify', 'Deleted')
            self.updateOwnersList()
          })
          .catch(function (error) {
            console.log(error);
          });
      },
      openChat(item) {

        self = this
        let accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        axios({
            method: 'post',
            url: self.$store.state.backendUrl + '/backend/api/users/current/chats',
            data: {
              driver_id: item.id
            },
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
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
      sortingAll(owners) {
        const {
          sortBy,
          sortDesc,
          page,
          itemsPerPage
        } = this.options

        let items = owners
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

          const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
            'etl-user-token')
          this.loading = true

          let formData = JSON.parse(JSON.stringify(self.editOwner));

          delete formData.drivers
          delete formData.owner_cars
          delete formData.user.id

          axios({
              method: 'PUT',
              url: self.$store.state.backendUrl + '/backend/api/owners/' + this.editOwner.user.id + '/',
              data: formData,
              headers: {
                'Authorization': 'JWT ' + accessToken
              },
            })
            .then(function (response) {
              self.ownerID = null
              self.loading = false
              self.dialog = false
              self.$globalEvents.$emit('notify', 'Saved')
              self.$globalEvents.$emit('permissionChecked')
            })
            .catch(function (error) {
              self.loading = false;
              console.log(error);
            });

        }
      },
      getOwners() {
        const self = this;
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        return new Promise((resolve, reject) => {
          let owners = null;

          axios({
              method: 'get',
              url: self.$store.state.backendUrl + '/backend/api/owners/my/',
              headers: {
                'Authorization': 'JWT ' + accessToken
              },
            })
            .then(function (response) {
              owners = response.data
              resolve(owners)

            })
            .catch(function (error) {

              console.log(error);
            });
        })
      },
      addOwner() {
        this.newOwner = {
          owner_info: {
            user: {
              email: "",
              address: "",
              first_name: "",
              last_name: "",
              phone_number: "",
              emergency_phone: "",
            },
            applicant_name: null,
            ssn: null,
            city: null,
            state: null,
            tax_classification: null,
            sub_tax_classification: null,
            other_description: null,
            routing_number: null,
            accounting_number: null,
            bank_name: null,
            company_street_address: null,
            company_city_state: null,
            company_name: null
          },
          owner_drivers: [],
          owner_cars: []
        };
        this.dialog = true
      },
      updateOwnersList() {

        const self = this;
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/owners/my/',
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            console.log(response);
            let ownersData = self.sortingAll(response.data)
            self.owners = ownersData.items
            self.totalOwners = ownersData.total
            self.loading = false
          }).catch(function (error) {
            console.log(error);
          });
      },
      openEditDialog(item) {
        const ownerID = item.id
        const self = this;
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        this.loading = true
        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/owners/' + ownerID + '/',
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            self.editOwner = response.data
            self.dialog = true
            self.loading = false
          })
          .catch(function (error) {
            console.log(error);
          });
      },
    },
    watch: {
      options: {
        handler() {
          if (this.owners.length < 1) {
            return
          }

          this.loading = true
          this.getOwners()
            .then(data => {
              let ownersData = this.sortingAll(data)
              this.owners = ownersData.items
              this.totalOwners = ownersData.total

              this.loading = false
            })

        },
      },
    },
    created() {
      const self = this

      const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
        'etl-user-token')
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
            self.loaded = true
            self.$globalEvents.$emit('permissionChecked')

          } else {
            // self.$router.push('/')
          }
        })
        .catch(function (error) {
          console.log(error);
        });

      this.$globalEvents.$on('permissionChecked', () => {
        this.updateOwnersList()
      })

    },
    mounted() {
      const self = this;
      this.$store.commit('updateToolbarData', {
        title: 'Owners',
        actions: [{
          type: 'icon-text',
          icon: 'mdi-pencil-box-outline',
          text: 'Add owner',
          color: 'blue',
          class: 'blue--text text-capitalize',
          action: () => {
            self.newOwnerDialogOpen = true
          }
        }]
      })
    },
    beforeDestroy() {
      this.$store.commit('updateToolbarData', {})
      this.$globalEvents.$off('refreshTokens')
      this.$globalEvents.$off('permissionChecked')
    },
    components: {
      newOwnerDialog
    }
  }

</script>
