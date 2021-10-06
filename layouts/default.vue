<template>
  <v-app id="inspire">

    <main-menu :drawer="drawer" :menuItems="menuItems">
      <telephony_old
        v-if="telephone.version === 1"
        class="telephony-block"
        :instance="telephone"
      ></telephony_old>
    </main-menu>

    <main-header @change="drawer = !drawer" :notificationsCount="notificationsCount"></main-header>

    <v-navigation-drawer
      v-if="telephone.version === 2"
      app
      width="300"
      right
      fixed
      class="scroll-view"
      permanent
      :clipped="$vuetify.breakpoint.lgAndUp"
    >
      <telephony
        class="telephony-block"
        :instance="telephone"
      ></telephony>
    </v-navigation-drawer>

    <v-content>
      <v-toolbar
        class="single-page-toolbar"
        elevation="0"
      >
        <v-btn
          v-if="this.$store.getters.getToolbarData.backBtn"
          @click="this.$store.getters.getToolbarData.backBtn.callback"
          icon
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-toolbar-title>{{ this.$store.getters.getToolbarData.title }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <template
          v-if="this.$store.getters.getToolbarData.actions"
          class="d-flex row mr-1"
          style="justify-content: flex-end"
        >
          <template v-for="(val, index) in this.$store.getters.getToolbarData.actions">

            <v-btn
              v-bind:key="index"
              v-if="val.type=='icon'"
              icon
              @click="val.action"
              :class="val.class ? val.class : ''"
            >
              <v-icon>{{ val.icon }}</v-icon>
            </v-btn>

            <v-btn
              v-bind:key="index"
              v-else-if="val.type=='btn'"
              @click="val.action"
              :class="val.class ? val.class : ''"
            >{{ val.text }}
            </v-btn>
            <v-btn
              v-bind:key="index"
              v-else-if="val.type=='btn-icon'"
              @click="val.action"
              :color="val.color"
              :class="val.class ? val.class : ''"
            >
              <v-icon
                dark
                class="mr-1"
              >{{ val.icon }}
              </v-icon>
              {{ val.text }}
            </v-btn>

            <v-btn
              v-bind:key="index"
              v-else-if="val.type=='icon-text'"
              color="transparent"
              elevation="0"
              @click="val.action"
              class="text--lighten-1"
              :class="val.class ? val.class : ''"
            >
              <v-icon class="mr-1">{{ val.icon }}</v-icon>
              {{ val.text }}
            </v-btn>

            <!-- <v-btn
            v-bind:key="index"
            v-else-if="val.type=='icon-menu'"
            color="transparent"
            elevation="0"
            @click="val.action"
            :class="val.class ? val.class : ''"
            >
            <v-icon class="mr-1">{{val.icon}}</v-icon>
            {{val.text}}
            </v-btn> -->

            <v-menu
              v-bind:key="index"
              v-else-if="val.type=='icon-menu'"
              offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  dark
                  :icon="val.withBg !== undefined ? !val.withBg : true"
                  v-bind="attrs"
                  v-on="on"
                  :color="val.color ? val.color : ''"
                >
                  <v-icon class="mr-1">{{ val.icon }}</v-icon>
                  {{ val.text }}
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="(item, item_index) in val.items"
                  :key="item_index"
                  @click="item.action"
                >
                  <v-list-item-icon
                    style="margin-right: 10px;"
                  >
                    <v-icon
                      v-if="item.icon"
                    >
                      {{ item.icon }}
                    </v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

          </template>
        </template>

        <template v-if="$store.getters.getToolbarData.menu" v-slot:extension>
          <v-tabs
            color="blue"
            fixed-tabs
            background-color="#2196f31f"
          >
            <v-tab
            v-for="(item, index) in $store.getters.getToolbarData.menu"
            :key="index"
            @click="item.onclick"
            >
              <v-icon class="mr-2" v-if="item.icon">{{item.icon}}</v-icon>
              {{item.title}}
            </v-tab>
          </v-tabs>
        </template>
      </v-toolbar>
      <div class="page-main-content scroll-view">
        <nuxt/>
      </div>
    </v-content>
    <v-snackbar
      v-model="bidComes"
      :timeout="2000"
    >
      {{ bidText }}
      <template v-slot:action="{ attrs }">
        <v-btn
          color="blue"
          text
          v-bind="attrs"
          @click="bidComes = false"
        >
          Close
        </v-btn>
      </template>

    </v-snackbar>
    <chat-window
      :data="windowChatData"
      :isFixed="true"
    ></chat-window>
    <confirm-registration-dialog v-if="confirmDialog" :dialog='confirmDialog'
                                 :dialogData='dialogData'></confirm-registration-dialog>
  </v-app>
</template>

<script>
import '@mdi/font/css/materialdesignicons.css'
import mainHeader from '@/components/main-header'
import mainMenu from '@/components/main-menu'
import confirmRegistrationDialog from '@/components/confirm-registration-dialog'
import telephony_old from '@/components/telephony/telephony-old'
import telephony from '@/components/telephony/telephony'
import chatWindow from '@/components/chat/chat-window'

const axios = require('axios');

export default {
  data: () => ({
    drawer: true,
    isUserActive: true,
    menuItems: [],
    noActiveDelay: 60,
    nowNoActive: 0,
    windowChatData: {},
    confirmDialog: false,
    telephone: {
      version: 2,
      inputNumber: '',
      call: {},
      hungUp: {}
    },

    dialogData: {
      first_name: '',
      last_name: '',
      req_status: '',
    },
    interval1: null,
    interval2: null,
    notificationsCount: 0,
    chatSocket: '',
    bidComes: false,
    bidText: '',
    companySocket: '',
    notificationAudio: ''
  }),
  created() {

    this.setGlobalEvents()

    const self = this;
    let token = '';
    let localToken = localStorage.getItem('etl-user-token');
    this.notificationAudio = new Audio('https://sound-pack.net/download/Sound_17211.mp3')

    if (localStorage.getItem('etl-user-token') || self.$store.getters.hasToken) {
      token = self.$store.getters.getToken ? self.$store.getters.getToken : localToken;

      if (!token) {
        console.log("No access token");
        self.$globalEvents.$emit('refreshTokensError')
        self.$router.push('/login/')

        return
      }

      // axios({
      //     method: 'post',
      //     url: self.$store.state.backendSocketUrl + '/backend/api/token/refresh/',
      //     data: {
      //         token: token,
      //     }
      // })
      // .then(function (response) {
      self.$store.commit('setToken', token)
      self.$globalEvents.$emit('refreshTokens')
      self.$globalEvents.$emit('renewLoads')
      self.$globalEvents.$emit('renewUserList')

      axios({
        method: 'get',
        url: self.$store.state.backendUrl + '/backend/api/users/current/',
        headers: {'Authorization': 'JWT ' + token},
      })
        .then(function (response) {

          self.$store.commit('renewCurrentUser', response.data)
          self.$globalEvents.$emit('renewCurrentUser')
          // self.connect()
          self.connectToCompanySocket()

          if (Number(response.data.id) === 0) {
            self.confirmDialog = true
            self.dialogData = response.data
          }

          axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/get-menu/',
            headers: {'Authorization': 'JWT ' + token},
          })
            .then(function (response) {

              let menu = response.data.items

              menu.forEach(item => {
                if (item.icon_alt) {
                  item['icon-alt'] = item.icon_alt
                }
              });

              self.menuItems = menu
              self.$globalEvents.$emit('loadMenu')
            }).catch(function (error) {
            console.log(error);
          });

          axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/settings/',
            headers: {'Authorization': 'JWT ' + token},
          })
            .then(function (response) {
              self.$store.commit('renewSettings', response.data)
              self.$globalEvents.$emit('renewSettings')
            }).catch(function (error) {
            console.log(error);
          });

          self.heartbeat(self)

          // self.interval1 = setInterval(() => {
          //   if (self.isUserActive) {
          //     self.heartbeat(self)
          //   }
          // }, 5000);
          //
          // self.interval2 = setInterval(self.updateUserOnline, 1000)
          // document.addEventListener('mousemove', self.activateUser)
        })
        .catch(function (error) {
          console.log(error);
          self.$globalEvents.$emit('currentUserError')
          self.$router.push('/login/')
        })

      // })
      // .catch(function (error) {
      //     console.log(error);
      // self.$router.push('/login/')
      // });

    } else {
      self.$router.push('/login/')
      self.$globalEvents.$emit('refreshTokensError')
    }

    this.$globalEvents.$on('extraHeartbeat', () => {
      this.heartbeat(this)
    })

    this.$nuxt.$on('drawer-menu', (is_open) => {
      this.drawer = is_open
    })

    // setInterval(() => {
    //     axios({
    //         method: 'post',
    //         url: self.$store.state.backendUrl + '/backend/api/token/refresh/',
    //         data: {
    //             refresh: refreshToken,
    //         }
    //     })
    //     .then(function (response) {
    //         console.log(response);
    //         self.$store.commit('setToken', token)
    //         self.$globalEvents.$emit('refreshTokens')
    //     })
    //     .catch(function (error) {
    //         console.log(error);
    // self.$router.push('/login/')
    //         self.$globalEvents.$emit('refreshTokensError')
    //     });
    // }, 36000000);


  },
  methods: {
    setGlobalEvents() {
      const self = this
      this.$globalEvents.$on('companySentEvent', (data) => {
        if (self.companySocket.readyState === self.companySocket.OPEN) {
          self.companySocket.send(JSON.stringify(data))
        }
      })

      this.$globalEvents.$on('notify', data => {
        self.bidComes = true
        self.bidText = data
      })
    },
    heartbeat(self) {
      const token = self.$store.getters.getToken

      if (!token) {
        return;
      }

      axios({
        method: 'get',
        url: self.$store.state.backendUrl + '/backend/api/heart/',
        headers: {'Authorization': 'JWT ' + token},
      })
        .then(function (response) {
          self.$store.commit('renewNitifications', response.data.new_notices)
          self.notificationsCount = response.data.new_notices.length
          self.$globalEvents.$emit('heartbeat')
        })
        .catch(function (error) {
          console.log(error);
          self.$globalEvents.$emit('heartbeatError')
        });
    },
    activateUser() {
      this.nowNoActive = 0;
    },
    updateUserOnline() {
      this.nowNoActive++
      if (this.nowNoActive >= this.noActiveDelay) {
        this.isUserActive = false
        this.$store.commit('updateUserActivityStatus', false)
      } else {
        this.isUserActive = true
        this.$store.commit('updateUserActivityStatus', true)
      }
    },
    connectToCompanySocket() {

      if (this.$store.getters.getCurrentUser.company_info == null) return false

      const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')
      const company_hash = this.$store.getters.getCurrentUser.company_info.company_hash

      const self = this

      if (this.companySocket != '') {
        return
      }

      this.companySocket = new WebSocket(self.$store.state.backendSocketUrl + '/ws/company/' + company_hash + '/?access_token=' + accessToken)

      self.companySocket.onopen = () => {

        self.companySocket.onmessage = ({data}) => {

          let sData = JSON.parse(data)

          if (sData.action === 'load_status_change') {
            self.$globalEvents.$emit('updateLoadStatuses', sData.data)
            self.$globalEvents.$emit('extraHeartbeat')
            this.bidComes = true
            this.bidText = 'Status changed'
            this.notificationAudio.play()
          } else if (sData.action === 'driver_bid') {
            self.bidComesAction(sData.data)
          } else if (sData.action === 'update_loads') {
            self.$globalEvents.$emit('updateLoads')
          }else if (sData.action === 'group_chat_message') {
            self.$globalEvents.$emit('receive_message', sData.data)
            if (self.$route.name != 'group-chat') {
              self.$store.commit('setMessages', 1)
            }
          }
        }
        this.companySocket.onclose = function (err) {

        }
        this.companySocket.onerror = function (error) {
          console.log('CompanyWebSocket Error: ' + error);
        }
      };
    },
    bidComesAction(data) {

      this.$globalEvents.$emit('bidComes')
      this.bidComes = true
      this.bidText = 'Load #' + data.load_id + ' was bidded by ' + data.phone_number

      this.notificationAudio.play()
    },
    connect() {
      const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')
      const groupID = this.$store.getters.getCurrentUser.user_owner ? this.$store.getters.getCurrentUser.user_owner : this.$store.getters.getCurrentUser.id
      const self = this

      if (this.chatSocket != '') {
        return
      }
      this.chatSocket = new WebSocket(self.$store.state.backendSocketUrl + '/ws/driver-bids/' + groupID + '/?access_token=' + accessToken)

      this.chatSocket.onopen = () => {
        this.chatSocket.onmessage = ({data}) => {
          const message = JSON.parse(data)

          this.$globalEvents.$emit('bidComes')
          this.bidComes = true
          this.bidText = 'Load #' + message.load_id + ' was bidded by ' + message.phone_number

          this.notificationAudio.play()
        };
        this.chatSocket.onclose = function (err) {
          console.log(err)
        }
        this.chatSocket.onerror = function (error) {
          console.log('WebSocket Error: ' + error);
        }
      };
    },
    disconnect() {
      if (this.chatSocket != '') {
        this.chatSocket.close()
      }
      if (this.companySocket != '') {
        this.companySocket.close()
      }
    },
  },
  computed: {
    hasToken() {
      return this.$store.getters.hasToken;
    }
  },
  mounted() {
  },
  beforeDestroy() {
    this.interval1 = null
    this.interval2 = null
    this.$globalEvents.$off('extraHeartbeat')
    this.$globalEvents.$off('companySentEvent')
    this.disconnect()
  },

  components: {
    mainHeader,
    mainMenu,
    confirmRegistrationDialog,
    telephony,
    telephony_old,
    chatWindow
  },
  // middleware: ['auth']
}

</script>

<style src="assets/main.css"></style>

<style lang="sass">
a
  text-decoration: none

.telephony-block
  transition: left 0.2s
  bottom: 0
</style>
