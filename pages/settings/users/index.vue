<template>
  <v-container fluid>
    <v-data-table :headers="headers" :items="users" :options.sync="options" :server-items-length="totalUsers"
      :loading="loading" class="elevation-1">
      <template v-slot:item.is_active="{ item }">
        <v-icon v-if="item.is_active" color="#4CAF50">mdi-alert-circle</v-icon>
        <v-icon v-else color="#F44336">mdi-alert-circle</v-icon>
      </template>
      <template v-slot:item.actions="{item}">
        <v-btn icon color="green" @click="openChat(item.id)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn class="ml-2" @click="openDetails(item.id)">
          Info
        </v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="500px">
      <v-form ref="form" v-model="valid" @submit.prevent="validate">
        <v-card class="elevation-12 pa-4" :loading="loading">
          <v-card-text>
            <v-text-field label="Email" prepend-icon="mdi-at" :rules="emailRules" v-model.trim="email"
              :error-messages="emailErrors" :error="emailErrors.length > 0" @input="emailErrors = []" />
            <v-text-field label="Phone number" prepend-icon="mdi-phone" :rules="requiredRules"
              v-model.trim="phone_number" />
            <v-text-field id="password" label="Password" prepend-icon="mdi-lock" :rules="passwordRules" type="password"
              v-model="password" />
            <v-text-field label="Repeat password" prepend-icon="mdi-lock" :rules="passwordRules2" type="password"
              v-model="password2" />
            <v-text-field v-model.trim="firstName" label="First Name" prepend-icon="mdi-account-details"
              :rules="requiredRules"></v-text-field>
            <v-text-field v-model.trim="lastName" label="Last Name" prepend-icon="mdi-account-details"
              :rules="requiredRules"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="dialog = false" > Cancel </v-btn>
            <v-btn :disabled="!valid" color="primary" type="submit">Add user</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <v-dialog v-model="messageDialog" max-width="600px" @click:outside="clear()">
      <v-card>
        <v-card-title>
          <span class="headline">Write your message</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-form @submit.prevent="sendMessage()">
                  <v-row>
                    <v-col class="py-0">
                      <v-textarea v-model="message" dense outlined label="Write your message here" auto-grow rows="5">
                      </v-textarea>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col class="py-0" cols="12">
                      <v-btn @click="messageDialog = false" > Cancel </v-btn>
                      <v-btn class="ma-0 ml-auto submit" color="secondary" type="submit" :disabled="loading"
                        :loading="loading">
                        Send
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
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
        options: {},
        users: [],
        headers: [{
            text: 'Id',
            value: 'id',
            align: 'center'
          },
          {
            text: 'Added',
            value: 'date_joined',
            align: 'center'
          },
          {
            text: 'Email',
            value: 'email',
            align: 'center'
          },
          {
            text: 'Name',
            value: 'name',
            align: 'center'
          },
          // { text: 'Is Active', value: 'is_active', align: 'center'},
          {
            text: 'Last Online',
            value: 'last_online',
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
        messageDialog: false,
        targetUser: 0,
        message: '',
        valid: true,
        password: '',
        password2: '',
        phone_number: '',
        email: '',
        emailErrors: [],
        firstName: '',
        lastName: '',
        emailRules: [
          v => !!v || 'E-mail is required',
          v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
        ],
        passwordRules: [
          v => !!v || 'Password is required',
          v => (v && v.length >= 5) || 'Password too short',
        ],
        passwordRules2: [
          v => v === this.password || 'Passwords don\'t match',
          v => !!v || 'This field is required',
        ],
        requiredRules: [
          v => !!v || 'This field is required',
        ],
      }
    },
    methods: {
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
          item.date_joined = this.$globalFunctions.repairDatetime(item.date_joined)
          item.last_online = this.$globalFunctions.repairDatetime(item.last_login)
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
          let login = this.login
          let email = this.email
          let password = this.password
          let firstName = this.firstName
          let lastName = this.lastName
          let phone_number = this.phone_number

          const accessToken = this.$store.getters.getToken

          this.loading = true

          axios({
              method: 'post',
              url: self.$store.state.backendUrl + '/backend/api/users/add/',
              data: {
                email: email,
                password: password,
                first_name: firstName,
                last_name: lastName,
                phone_number: phone_number
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
              url: self.$store.state.backendUrl + '/backend/api/users/my/',
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
      openChat(id) {
        this.targetUser = id
        this.messageDialog = true
      },
      openDetails(id) {
        this.$router.push('/settings/users/' + id + '/')
      },
      clear() {
        this.targetUser = 0
        this.loading = false
        this.message = ''
      },
      sendMessage() {
        const self = this
        let accessToken = this.$store.getters.getToken

        this.loading = true

        axios({
            method: 'post',
            url: self.$store.state.backendUrl + '/backend/api/chat-message/',
            data: {
              content: self.message,
              user_to: self.targetUser
            },
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            console.log(response);
            self.messageDialog = false
            self.targetUser = 0
            self.loading = false
            self.message = ''
          })
          .catch(function (error) {
            console.log(error);
          });
      },
    },
    watch: {
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

      // this.$globalEvents.$on('refreshTokens', () => {
      const accessToken = this.$store.getters.getToken
      console.log(self.$router);
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

      // })

      this.$globalEvents.$on('renewUserList', () => {
        const accessToken = this.$store.getters.getToken
        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/users/my/',
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            console.log(response);

            let usersData = self.sortingAll(response.data)
            self.users = usersData.items
            self.totalUsers = usersData.total
            self.loading = false
          })
          .catch(function (error) {
            console.log(error);
          });
      })

      if (this.users.length < 1) {
        this.$globalEvents.$emit('renewUserList')
      }
    },
    mounted() {
      const self = this

      this.$store.commit('updateToolbarData', {
        title: 'Users',
        backBtn: {
          callback: function () {
            window.history.back();
          }
        },
        actions: [{
          type: 'icon-text',
          icon: 'mdi-pencil-box-outline',
          text: 'Add user',
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
