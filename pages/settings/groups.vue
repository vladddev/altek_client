<template>
  <v-container fluid>
    <v-row>
      <v-col v-for="(group, index) in groups" :key="index" cols="4">
        <v-card :color="group.color" :dark='getColorK(group.color)' @click="openGroupDialog(group)">
          <v-card-title>
            {{ group.group_name }}
          </v-card-title>
          <v-card-subtitle>
            Responsible user:
            <span v-if="group.group_lead">{{
                group.group_lead.first_name + ' ' + group.group_lead.last_name + ' (' + group.group_lead.email + ')'
              }}</span>
            <span v-else>not defined</span>
            <br>
            Users count: {{ group.users.length }}
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
    <v-btn fixed dark fab bottom right color="blue" @click="addGroup()">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <v-dialog v-model="groupDialog" max-width="500px">
      <v-form ref="form" v-model="valid" @submit.prevent="validate">
        <v-card class="elevation-12 pa-4" :loading="loading">
          <v-card-text>
            <v-row>
              <v-col cols="6">
                <v-row>
                  <v-col cols="12">
                    <v-text-field label="Group name" v-model.trim="newGroup.group_name" :rules="requiredRules" />
                  </v-col>
                  <v-col cols="12">
                    <v-select v-model="groupLead" :items="allDispatchers" item-text="email" item-value="id"
                      label="Group leader"></v-select>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="6">
                <v-color-picker v-model="newGroup.color" flat hide-inputs hide-mode-switch></v-color-picker>
              </v-col>
              <v-col cols="12">
                <v-select v-model="groupOwners" :items="allOwners" item-text="email" item-value="id" label="Owners"
                  multiple></v-select>
              </v-col>
              <v-col cols="12">
                <v-select v-model="groupDispatchers" :items="allDispatchers" item-text="email" item-value="id"
                  label="Dispatchers" multiple></v-select>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn
              @click="groupDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn color="error" @click="Delete()">Delete
            </v-btn>
            <v-spacer />
            <v-btn :disabled="!valid" color="primary" type="submit">Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-container>
</template>


<script>
  const axios = require('axios');
  const colorModel = {
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    'a': 10,
    'b': 11,
    'c': 12,
    'd': 13,
    'e': 14,
    'f': 15
  }


  export default {
    data() {
      return {
        groupDialog: false,
        loading: false,
        valid: true,
        groupLead: null,
        picker: '',
        groups: [],
        allUsers: [],
        groupOwners: [],
        groupDispatchers: [],
        allOwners: [],
        allDispatchers: [],
        newGroup: {
          group_name: '',
          color: '#fff',
          users: [],
          group_lead: null
        },
        requiredRules: [
          v => !!v || 'This field is required',
        ],
      }
    },
    methods: {
      getColorK(color) {
        let colorCodeArray = color.substring(1).split('')

        let K = 0
        for (const el of colorCodeArray) {
          K += Number(colorModel[el.toLowerCase()])
        }
        return K < 50
      },
      validate() {
        const self = this;
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')
        this.$refs.form.validate()

        if (this.valid === true) {
          this.loading = true

          let url = this.newGroup.id ? (self.$store.state.backendUrl + '/backend/api/users/current/working-groups/' +
            this.newGroup.id + '/') : self.$store.state.backendUrl + '/backend/api/users/current/working-groups/'
          let method = this.newGroup.id ? 'put' : 'post'

          this.newGroup.users = this.groupOwners.concat(this.groupDispatchers)
          this.newGroup.group_lead = this.groupLead

          axios({
              method: method,
              url: url,
              data: self.newGroup,
              headers: {
                'Authorization': 'JWT ' + accessToken
              },
            })
            .then(function (response) {
              self.updateGroups();
              self.newGroup = {
                group_name: '',
                color: '#fff',
                users: [],
                group_lead: null
              }

              self.loading = false
              self.groupDialog = false
              self.groupLead = false
            })
            .catch(function (error) {
              self.loading = false;
              console.log(error);
            });
        }
      },
      openGroupDialog(group) {
        this.newGroup = Object.assign({}, group)
        this.groupOwners = []
        this.groupDispatchers = []
        this.groupLead = group.group_lead

        console.log(group);

        group.users.forEach(user => {
          if (user.department == 'Owner') {
            this.groupOwners.push(user.id)
          } else if (user.department == 'Dispatcher') {
            this.groupDispatchers.push(user.id)
          }
        });

        this.groupDialog = true
      },
      addGroup() {
        this.newGroup = {
          group_name: '',
          color: '#eeeeee',
          users: [],
          group_lead: null
        }
        this.groupLead = null
        this.groupOwners = []
        this.groupDispatchers = []
        this.groupDialog = true
      },
      Delete() {
        const self = this;
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        axios({
            method: 'delete',
            url: self.$store.state.backendUrl + '/backend/api/users/current/working-groups/' + self.newGroup.id + '/',
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            self.updateGroups();
            self.newGroup = {
              group_name: '',
              color: '#fff',
              users: [],
              group_lead: null
            }

            self.loading = false
            self.groupDialog = false
            self.groupLead = false
          })
          .catch(function (error) {
            console.log(error);
          });
      },
      updateGroups() {
        const self = this
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/users/current/working-groups/',
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            console.log(response.data);
            self.groups = response.data
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    },
    created() {
      const self = this
      const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
        'etl-user-token')

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
            if (!response.data.allow) {
              self.$router.push('/')
            }
          })
          .catch(function (error) {
            console.log(error);
          });

      })

      this.updateGroups();

      axios({
          method: 'get',
          url: self.$store.state.backendUrl + '/backend/api/owners/my/?for_working_group=true',
          headers: {
            'Authorization': 'JWT ' + accessToken
          },
        })
        .then(function (response) {
          self.allOwners = response.data
        })
        .catch(function (error) {
          console.log(error);
        });

      axios({
          method: 'get',
          url: self.$store.state.backendUrl + '/backend/api/users/my/?for_working_group=true',
          headers: {
            'Authorization': 'JWT ' + accessToken
          },
        })
        .then(function (response) {
          self.allDispatchers = response.data
        })
        .catch(function (error) {
          console.log(error);
        });

    },
    mounted() {
      this.$store.commit('updateToolbarData', {
        title: 'Groups',
        backBtn: {
          callback: function () {
            window.history.back();
          }
        },
      })
    },
    beforeDestroy() {
      this.$store.commit('updateToolbarData', {})
      this.$globalEvents.$off('refreshTokens')
    },
  }

</script>

<style lang="sass">

</style>
