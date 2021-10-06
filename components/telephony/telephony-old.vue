<template>
    <div id="telephone">
      <div
        class="queue-switcher-block">
        <v-switch
          color="blue"
          inset
          v-model="queue"
          :loading="queueLoading"
          @change="setQueue"
          :label="queue ? 'In the queue' : 'Out of queue'"
          label.color="red"
        >
        </v-switch>
      </div>
      <v-card
        width="240"
        height="360"
        elevation="4"
      >
        <v-container>
          <v-col class="telephony-data-block" cols="12">
            <div style="margin-bottom: 10px">
              <p>ID: {{ interlocutor.id }}</p>
              <p>Name: {{ interlocutor.first_name }}</p>
              <p>Status: {{ status }}</p>
              <p v-if="numberFrom !== ''">From: {{ numberFrom }}</p>
              <p v-if="showNumber" >Number: +<input
                id="telephone-input"
                type="text" height="10px"
                v-model="currentNumber"
                maxlength="13"
                style="border-bottom: 1px solid #000; width: 115px;"></p>
            </div>
            <div>
              <div class="tNumbers telephony-numbers">
                <button
                  v-for="(number, index) in numbers"
                  :key="index"
                  @click="numberClick(number)"
                >{{ number }}
                </button>
              </div>
              <div class="tNumbers telephony-call-btns">
                <button
                  id="telephone-call"
                  @click="call"
                  ref="callBtn"
                >
                  <v-icon color="white">mdi-phone</v-icon>
                </button>
                <button
                  id="telephone-hangUp"
                  @click="hungUp"
                  ref="hungUpBtn"
                >
                  <v-icon color="white">mdi-phone-hangup</v-icon>
                </button>
                <button
                  id="telephone-transfer"
                  ref="transferBtn"
                  @click="dialog = true"
                >
                  <v-icon color="white">mdi-phone-outgoing</v-icon>
                </button>
              </div>
            </div>
          </v-col>
        </v-container>
        <v-dialog
          width="500px"
          v-model="dialog"
        >
          <v-card
            :disabled="usersLoading"
          >
            <v-container
            >
              <v-data-table
                :headers="dialogHeaders"
                :items="users"
                :loading="usersLoading"
                :options.sync="options"
                @click:row="selectTransfer"
              >
                <template v-slot:item.name="{ item }">
                  <p>{{ item.first_name }} {{ item.last_name }}</p>
                  <p class="grey--text" style="white-space: nowrap">{{ item.email }}</p>
                </template>
              </v-data-table>
            </v-container>
          </v-card>
        </v-dialog>
      </v-card>
    </div>

<!--  <div class="cellphone" id="cellphone">-->
<!--    <div v-if="currentPage=='main'">-->
<!--      <div class="cellphone-availability">-->
<!--        <div-->
<!--          class="cellphone-availability-btn"-->
<!--          :class="{'active': queue}"-->
<!--          @click="setQueue(true)">-->
<!--          <span>Available</span>-->
<!--        </div>-->
<!--        <div-->
<!--          class="cellphone-availability-btn"-->
<!--          :class="{'active': !queue}"-->
<!--          @click="setQueue(false)">-->
<!--          <span>Unavailable</span>-->
<!--        </div>-->
<!--      </div>-->
<!--      <div class="cellphone-info-box" id="cellphone-info-box">-->
<!--        <div class="cellphone-info-box__status">-->
<!--          <span class="incomming">Incomming call ◉</span>-->
<!--          <span class="connected">Connected 1:32</span>-->
<!--        </div>-->
<!--        <div class="cellphone-info-box__member">-->
<!--          <div class="cellphone-info-box__member-avatar">-->
<!--            <img src="https://image.freepik.com/free-photo/happy-man-with-newspaper_23-2147694656.jpg" alt=""/>-->
<!--          </div>-->
<!--          <div class="cellphone-info-box__member-name">-->
<!--            <span>Damien Jones</span>-->
<!--          </div>-->
<!--          <div class="cellphone-info-box__member-phone">-->
<!--            <span>+1 823 746 3456</span>-->
<!--          </div>-->
<!--          <div class="cellphone-info-box__member-meta">-->
<!--            <span>V204</span>-->
<!--          </div>-->
<!--        </div>-->

<!--      </div>-->
<!--      <div class="cellphone-numpad">-->
<!--        <div class="cellphone-numpad__input">-->
<!--          <input type="text" placeholder="Type number or name..."/>-->
<!--          <span class="numpad-clearBtn">-->
<!--          <img src='/icons/input-clear.svg' alt=""/>-->
<!--        </span>-->
<!--        </div>-->
<!--        <div class="cellphone-numpad__callActions">-->
<!--          <div class="actions-row">-->
<!--            <div class="action">-->
<!--              <div class="p-icon">-->
<!--                <img src='/icons/microphone.svg' alt=""/>-->
<!--              </div>-->
<!--              <span>Mute</span>-->
<!--            </div>-->
<!--            <div class="action">-->
<!--              <div class="p-icon">-->
<!--                <img src='/icons/keypad.svg' alt=""/>-->
<!--              </div>-->
<!--              <span>Keypad</span>-->
<!--            </div>-->
<!--            <div class="action">-->
<!--              <div class="p-icon">-->
<!--                <img src='/icons/pause.svg' alt=""/>-->
<!--              </div>-->
<!--              <span>Hold</span>-->
<!--            </div>-->
<!--          </div>-->
<!--          <div class="actions-row">-->
<!--            <div class="action">-->
<!--              <div class="p-icon">-->
<!--                <img src='/icons/transfer-call.svg' alt=""/>-->
<!--              </div>-->
<!--              <span>Transfer</span>-->
<!--            </div>-->
<!--            <div class="action">-->
<!--              <div class="p-icon">-->
<!--                <img src='/icons/plus.svg' alt=""/>-->
<!--              </div>-->
<!--              <span>Add</span>-->
<!--            </div>-->
<!--            <div class="action">-->
<!--              <div class="p-icon">-->
<!--                <img src='/icons/record.svg' alt=""/>-->
<!--              </div>-->
<!--              <span>Voicemail</span>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--        <div class="cellphone-numpad__numpad">-->
<!--          <div class="number-row">-->
<!--            <div class="number" data-value="1">1</div>-->
<!--            <div class="number" data-value="2">2</div>-->
<!--            <div class="number" data-value="3">3</div>-->
<!--          </div>-->
<!--          <div class="number-row">-->
<!--            <div class="number" data-value="4">4</div>-->
<!--            <div class="number" data-value="5">5</div>-->
<!--            <div class="number" data-value="6">6</div>-->
<!--          </div>-->
<!--          <div class="number-row">-->
<!--            <div class="number" data-value="7">7</div>-->
<!--            <div class="number" data-value="8">8</div>-->
<!--            <div class="number" data-value="9">9</div>-->
<!--          </div>-->
<!--          <div class="number-row">-->
<!--            <div style="color:#9DA8B2" class="number" data-value="*">*-->
<!--            </div>-->
<!--            <div class="number" data-value="0">0</div>-->
<!--            <div style="color: #9DA8B2" class="number" data-value="#">#-->
<!--            </div>-->
<!--          </div>-->
<!--          <div class="number-action-buttons">-->
<!--            <div class="number-action-button accteptBtn">-->
<!--              <img src='/icons/accpet-call.svg' alt=""/>-->
<!--            </div>-->
<!--            <div class="number-action-button declineBtn">-->
<!--              <img src='/icons/decline-call.svg' alt=""/>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--    <div v-else-if="currentPage=='fax'">-->
<!--      <span style="cursor: pointer" @click="currentPage='main'">← Back</span>-->
<!--      <telephonyFax></telephonyFax>-->
<!--    </div>-->
<!--    <div class="cellphone-bottom-menu">-->
<!--      <div class="cellphone-bottom-menu__item">-->
<!--        <img src='/icons/phone-history.svg' alt=""/>-->
<!--        <span>History</span>-->
<!--      </div>-->
<!--      <div class="cellphone-bottom-menu__item" :class="{'active': currentPage=='fax'}" @click="currentPage='fax'">-->
<!--        <img src='/icons/phone-fax.svg' alt=""/>-->
<!--        <span>Fax</span>-->
<!--      </div>-->
<!--      <div class="cellphone-bottom-menu__item">-->
<!--        <img src='/icons/phone-chat.svg' alt=""/>-->
<!--        <span>Chat</span>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->
</template>


<script>

import {AppCallFn} from '@/components/telephony/library/AppCall'
import telephonyFax from '@/components/telephony/pages/fax'

const axios = require('axios')

export default {
  name: 'telephony',
  props: ['drawer'],
  data: () => ({
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'],
    currentNumber: '',
    connect: {},
    AppCall: {},
    status: 'Ready',
    dialog: false,
    options: {},
    users: [],
    usersLoading: false,
    queue: false,
    queueLoading: false,
    showNumber: true,
    myNumber: '',
    interlocutor: {},
    numberFrom: '',
    transferFrom: '',
    transferTo: '',
    currentPage: 'main',
    dialogHeaders: [
      {text: 'ID', value: 'id', sortable: false, align: 'center'},
      {text: 'Name', value: 'name', align: 'center'}
    ]
  }),
  watch: {
    connect: function (val, oldVal) {
      this.AppCall.updateConnect(this.connect)
    },
    dialog: function (val, oldVal) {
      if (!val) return

      this.usersLoading = true
      this.updateActiveUsers()
    }
  },
  methods: {
    setQueue(queue) {
      this.queueLoading = true
      let self = this
      let accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')
      axios({
        method: 'post',
        url: 'https://sms.green-node.ru/add_delete_dispatcher',
        data: {
          name: 'cnu',
          number: self.myNumber,
          action: queue ? 'addDispatcher' : 'deleteDispatcher'
        },
        headers: {'Authorization': 'JWT ' + accessToken},
      })
        .then(function (response) {
          if (response.data.msg === "Ok") {
            self.queueLoading = false
            self.queue = queue
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    selectTransfer(user) {
      this.dialog = false
      this.transferFn(user.phone_number)
    },
    numberClick(number) {

      if (this.currentNumber.length == 13) return

      this.currentNumber += number

      const Number = this.currentNumber

      if (AppCallFn.connectGuard(this.connect, 'open')) {
        this.connect?.sendDigits(Number.toString())
      }
    },
    hungUp() {
      this.AppCall.HungUp()
    },
    call() {
      if (this.status !== 'Incoming') if (this.currentNumber === '') return 0
      this.AppCall.Call('+' + this.currentNumber, this.myNumber)
    },
    getUserByPhoneNumber(phone_number) {
      let result = {}
      this.users.forEach(function (user, index) {
        if (user.phone_number !== phone_number) return false
        result = user
      })
      return result
    },
    setConnect(connect) {
      this.connect = connect
    },
    connectHandler(connect) {
      let btns = document.querySelector('.telephony-numbers button')
      btns.disabled = true
      this.$refs.callBtn.disabled = true
      this.$refs.transferBtn.disabled = false
    },
    disconnectHandler(connect) {
      this.$refs.callBtn.disabled = false
      this.transferFrom = ''
      this.interlocutor = {}
      this.currentNumber = ''
      this.numberFrom = ''
      this.$refs.callBtn.classList.remove('flashing')
      // this.$refs.transferBtn.disabled = true
      this.showNumber = true
      this.status = 'Ready'
    },
    incomingHandler(connect) {
      this.$nuxt.$emit('drawer-menu', true)
      this.$refs.hungUpBtn.disabled = false
      this.transferFrom = connect.parameters.From
      this.numberFrom = connect.parameters.From
      this.interlocutor = this.getUserByPhoneNumber(connect.parameters.From)
      console.log(this.interlocutor)
      this.$refs.callBtn.classList.add('flashing')
      this.status = 'Incoming'
    },
    acceptHandler(connect) {
      this.$refs.callBtn.disabled = false
      this.numberFrom = connect.parameters.From
      this.status = 'In call with'
      this.$refs.callBtn.classList.remove('flashing')
    },
    callingHandler(connect) {
      this.$refs.callBtn.disabled = true
      this.numberFrom = ''
      this.transferFrom = this.myNumber
      this.status = 'Calling'
    },
    missedCallHandler(connect) {

    },
    transferHandler(number, to, myExt, from, callback) {
      axios({
        method: 'POST',
        url: `https://sms.green-node.ru/call_to_dispatcher/${to}/${myExt}/agent`,
        data: {
          from: from
        },
        headers: {'Content-Type': 'application/json'},
      })
        .then()
        .catch(function (error) {
          console.log(error);
        });
    },
    transferFn(number) {
      AppCallFn.connectGuard(this.connect, 'open') && this.transferHandler(number, this.myNumber, this.transferFrom, this.hungUp)
    },
    getActiveDispatchers() {
      let accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')
      return new Promise((resolve, reject) => {
        axios({
          method: 'get',
          url: 'https://sms.green-node.ru/get_active_dispatchers/cnu',
          headers: {'Authorization': 'JWT ' + accessToken},
        })
          .then(function (response) {
            resolve(response.data.data)
          })
          .catch(function (error) {
            console.log(error);
          });
      })
    },
    updateActiveUsers() {
      let self = this
      let accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')
      axios({
        method: 'get',
        url: self.$store.state.backendUrl + '/backend/api/users/all',
        headers: {'Authorization': 'JWT ' + accessToken},
      })
        .then(function (response) {

          let all_users = response.data
          const AvailableDepartments = ['Shipper', 'Carrier', 'Dispatcher', 'User', 'HR']

          self.getActiveDispatchers()
            .then(data => {

              let active_users = data
              let users = []

              all_users.forEach((val, index) => {

                if (AvailableDepartments.includes(val.department) === false) return
                if (active_users.includes(val.phone_number) === false) return

                users.push({
                  id: val.id,
                  department: val.department,
                  first_name: val.first_name,
                  last_name: val.last_name,
                  phone_number: val.phone_number,
                  emergency_phone: val.emergency_phone,
                })
              })


              self.users = users
              self.usersLoading = false
              self.$store.commit('updateUsers', users)
            })
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    setGlobalEvents() {
      const self = this
      this.$globalEvents.$on('telephonySetNumber', (number) => {
        this.currentNumber = number
      })
      this.$globalEvents.$on('telephonyCall', () => {
        this.call()
      })
      this.$globalEvents.$on('telephonyCallToNumber', (number, showNumber = false) => {
        this.showNumber = showNumber
        this.currentNumber = number
        this.call()
      })
    }
  },
  created() {
    const self = this
    this.queueLoading = true

    this.setGlobalEvents()

    this.$globalEvents.$on('renewCurrentUser', () => {

      self.getActiveDispatchers()
        .then((data) => {
          self.queue = data.includes(self.$store.state.currentUser.phone_number)
          self.queueLoading = false
        })

      let btns = document.querySelector('.telephony-numbers button')

      self.AppCall = new AppCallFn(
        {
          connect: self.connect,
          setConnect: self.setConnect,
          missedCallHandler: self.missedCallHandler,
          callingHandler: self.callingHandler,
          acceptHandler: self.acceptHandler,
          incomingHandler: self.incomingHandler,
          disconnectHandler: self.disconnectHandler,
          connectHandler: self.connectHandler
        })

      console.log(self.$store.getters.getCurrentUser.phone_number)

      self.AppCall.initEventsListener()
      self.AppCall.initToken(self.$store.getters.getCurrentUser.phone_number)
      self.myNumber = self.$store.getters.getCurrentUser.phone_number
      // self.AppCall.initToken('888')

    })
  },
  beforeDestroy() {

  },
  mounted() {
  },
  computed: {},
  components: {
    telephonyFax
  }
}
</script>

<!--<style lang="css" scoped>-->
<!--.cellphone {-->
<!--  color: #232E42;-->
<!--  background-color: #fff;-->
<!--  box-shadow: 2px 2px 9px 6px rgba(228, 228, 228, 0.5);-->
<!--  padding: 15px;-->
<!--  border-radius: 4px;-->
<!--}-->

<!--.cellphone-availability {-->
<!--  display: flex;-->
<!--  width: 100%;-->
<!--  justify-content: center;-->
<!--  align-items: center;-->
<!--  border: 1px solid #489FFE;-->
<!--  border-radius: 6px;-->
<!--}-->

<!--.cellphone-availability-btn {-->
<!--  width: 50%;-->
<!--  text-align: center;-->
<!--  padding: 7px 15px;-->
<!--  font-size: 16px;-->
<!--  font-weight: 400;-->
<!--  color: #9DA8B2;-->
<!--  cursor: pointer;-->
<!--}-->

<!--.cellphone-availability-btn.active {-->
<!--  background-color: #489FFE;-->
<!--  color: #fff;-->
<!--  transition: 0.2s;-->
<!--}-->

<!--.cellphone-info-box {-->
<!--  min-height: 100px;-->
<!--}-->

<!--.cellphone-info-box__status {-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  justify-content: center;-->
<!--  align-items: center;-->
<!--  margin-top: 10px;-->
<!--  font-size: 16px;-->
<!--}-->

<!--.cellphone-info-box__status .incomming {-->
<!--  color: #FA6161;-->
<!--  font-weight: 500;-->
<!--}-->

<!--.cellphone-info-box__status .connected {-->
<!--  color: #68C186;-->
<!--  font-weight: 500;-->
<!--}-->

<!--.cellphone-info-box__member {-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  justify-content: center;-->
<!--  align-items: center;-->
<!--  margin-top: 30px;-->
<!--}-->

<!--.cellphone-info-box__member-avatar {-->
<!--  margin-bottom: 15px;-->
<!--  filter: drop-shadow(1px 1px 6px #AACCFF) drop-shadow(-1px -1px 6px #AACCFF);-->
<!--}-->

<!--.cellphone-info-box__member-avatar img {-->
<!--  width: 58px;-->
<!--  height: 58px;-->
<!--  border-radius: 50%;-->
<!--  object-fit: cover;-->
<!--}-->

<!--.cellphone-info-box__member-name {-->
<!--  font-size: 20px;-->
<!--  font-weight: 400;-->
<!--}-->

<!--.cellphone-info-box__member-phone {-->
<!--  font-size: 16px;-->
<!--  font-weight: 400;-->
<!--}-->

<!--.cellphone-info-box__member-meta {-->
<!--  font-size: 16px;-->
<!--  font-weight: 400;-->
<!--  color: #9DA8B2;-->
<!--}-->

<!--.cellphone-numpad {-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  justify-content: center;-->
<!--  align-items: center;-->
<!--  margin-top: 20px;-->
<!--}-->

<!--.cellphone-numpad__input {-->
<!--  position: relative;-->
<!--  width: 100%;-->
<!--}-->

<!--.cellphone-numpad__input input {-->
<!--  width: 100%;-->
<!--  background: #FFFFFF;-->
<!--  box-shadow: 1px 1px 4px #EFEFEF, -1px -1px 4px #EFEFEF;-->
<!--  border-radius: 6px;-->
<!--  color: #232E42;-->
<!--  border: none;-->
<!--  height: 40px;-->
<!--  padding: 0px 30px 0 10px;-->
<!--  font-size: 18px;-->
<!--}-->

<!--.cellphone-numpad__input input::placeholder {-->
<!--  color: #9DA8B2;-->
<!--}-->

<!--.cellphone-numpad__numpad {-->
<!--  width: 100%;-->
<!--  margin-top: 15px;-->
<!--}-->

<!--.cellphone-numpad__numpad .number-row {-->
<!--  display: flex;-->
<!--  justify-content: space-around;-->
<!--}-->

<!--.cellphone-numpad__numpad .number-row .number {-->
<!--  font-size: 26px;-->
<!--  font-weight: normal;-->
<!--  cursor: pointer;-->
<!--  padding: 10px 20px;-->
<!--}-->

<!--.cellphone-numpad__numpad .number-row .number:hover {-->
<!--  color: #5b6f92;-->
<!--}-->

<!--.numpad-clearBtn {-->
<!--  position: absolute;-->
<!--  right: 10px;-->
<!--  height: 100%;-->
<!--  top: 0;-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  cursor: pointer;-->
<!--}-->

<!--.number-action-buttons {-->
<!--  display: flex;-->
<!--  justify-content: center;-->
<!--  margin-top: 20px;-->
<!--}-->

<!--.number-action-buttons .number-action-button {-->
<!--  width: 55px;-->
<!--  height: 55px;-->
<!--  display: flex;-->
<!--  justify-content: center;-->
<!--  align-items: center;-->
<!--  border-radius: 50%;-->
<!--  cursor: pointer;-->
<!--}-->

<!--.number-action-buttons .number-action-button.accteptBtn {-->
<!--  background-color: #68C186;-->
<!--  box-shadow: -1px -1px 10px #AAEEB9, 1px 1px 10px #AAEEB9;-->
<!--}-->

<!--.number-action-buttons .number-action-button.declineBtn {-->
<!--  background-color: #EC5353;-->
<!--  box-shadow: -1px -1px 10px #EEAEAA, 1px 1px 10px #EEAEAA;-->
<!--}-->

<!--.number-action-buttons .number-action-button:not(:first-child) {-->
<!--  margin-left: 35px;-->
<!--}-->

<!--.cellphone-bottom-menu {-->
<!--  width: 100%;-->
<!--  border-top: 1px solid #F5F5F5;-->
<!--  margin-top: 30px;-->
<!--  display: flex;-->
<!--  justify-content: space-around;-->
<!--  padding-top: 15px;-->
<!--}-->

<!--.cellphone-bottom-menu .cellphone-bottom-menu__item {-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  justify-content: center;-->
<!--  align-items: center;-->
<!--  width: 33.33%;-->
<!--  cursor: pointer;-->
<!--  color: #828B92;-->
<!--  font-size: 13px;-->
<!--  font-weight: 500;-->
<!--}-->

<!--.cellphone-bottom-menu .cellphone-bottom-menu__item span {-->
<!--  margin-top: 5px;-->
<!--}-->

<!--.cellphone-bottom-menu .cellphone-bottom-menu__item:hover {-->
<!--  opacity: 0.9;-->
<!--}-->

<!--.cellphone-numpad__callActions {-->
<!--  margin-top: 20px;-->
<!--  width: 100%;-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--}-->

<!--.cellphone-numpad__callActions .actions-row {-->
<!--  width: 100%;-->
<!--  display: flex;-->
<!--  justify-content: space-around;-->
<!--}-->

<!--.cellphone-numpad__callActions .actions-row:not(:last-child) {-->
<!--  margin-bottom: 25px;-->
<!--}-->

<!--.cellphone-numpad__callActions .actions-row .action {-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  align-items: center;-->
<!--  cursor: pointer;-->
<!--}-->

<!--.cellphone-numpad__callActions .actions-row .action .p-icon {-->
<!--  width: 52px;-->
<!--  height: 52px;-->
<!--  display: flex;-->
<!--  justify-content: center;-->
<!--  align-items: center;-->
<!--  border-radius: 50%;-->
<!--  background: #FFFFFF;-->
<!--  box-shadow: -1px -1px 4px #E7E7E7, 1px 1px 4px #E7E7E7;-->
<!--}-->

<!--.cellphone-numpad__callActions .actions-row .action span {-->
<!--  font-size: 13px;-->
<!--  font-weight: 400;-->
<!--  margin-top: 5px;-->
<!--}-->
<!--</style>-->

<style lang="sass" scoped>

.v-application p
  margin-bottom: 0

.queue-switcher-block
  display: flex
  justify-content: center

.telephony-data-block
  font-size: 15px
  display: flex
  flex-wrap: wrap
  color: #000
  font-weight: 500

  p
    white-space: nowrap

  .telephony-numbers button
    padding: 4px
    width: 27.5%
    box-sizing: border-box
    margin: 5px
    background-color: #EEEEEE
    border-radius: 10px

    &:hover:not(:disabled)
      background-color: #e2e2e2

  .telephony-call-btns
    flex-wrap: nowrap

    button
      width: 26%
      padding: 4px
      margin: 5px
      background-color: #F6F6F6
      border-radius: 10px
      color: #fff

      &:first-child
        background-color: #4CAF50

        &:disabled
          background-color: #66BB6A

      &:nth-child(2n)
        background-color: #F44336

        &:disabled
          background-color: #EF5350

      &:nth-child(3n)
        background-color: #9E9E9E

        &:disabled
          background-color: #BDBDBD

  .tNumbers
    user-select: none
    border: 0
    outline: none

  input[type="button"]
    outline: none

  input[type="button"]::-moz-focus-inner
    border: 0

  .flashing
    animation: blinker 0.5s linear infinite

  @keyframes blinker
    50%
      opacity: 70%

  textarea:focus, input:focus, button:focus
    outline: none

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button
    display: none
    -webkit-appearance: none
    margin: 0

  .f-size-11
    font-size: 11px
</style>
