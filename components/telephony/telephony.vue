<template>
  <div
    class="cellphone"
    :class="{ active: elements.phoneActive }"
    id="cellphone"
  >
    <div class="cellphone-container">
      <div class="cellphone-switcher">
        <div
          class="cellphone-switcher__item"
          :class="{ active: queue }"
          @click="setQueue(true)"
        >
          <span>Available</span>
        </div>
        <div
          class="cellphone-switcher__item"
          :class="{ active: !queue }"
          @click="setQueue(false)"
        >
          <span>Unavailable</span>
        </div>
      </div>

      <div
        class="cellphone-search"
        :class="{ margin: !elements.userInfo && currentPage === 'home' }"
      >
        <div class="cellphone-search__input" v-if="elements.numberInput">
          <span class="search-icon"
            ><img src="/icons/search-blue.svg" alt=""
          /></span>
          <input type="text" placeholder="Search" v-model="currentNumber" />
          <span
            v-if="currentNumber.length > 0 && elements.userInfo"
            class="search-clearBtn"
            @click="currentNumber = ''"
          >
            <img src="/icons/input-clear-blue.svg" alt="" />
          </span>
          <div
            class="cellphone-search__list"
            v-if="currentNumber.trim().length > 0 && filteredUsers.length > 0"
          >
            <div class="list celphone-scroll-view">
              <span
                class="list-item"
                v-for="(user, index) in filteredUsers"
                @click="chooseInterlocutor(user.id)"
                :key="index"
              >
                <div class="list-item-avatar">
                  <img v-if="user.avatar" :src="user.avatar" alt="" />
                  <img v-else :src="$store.state.defaultAvatar" alt="" />
                </div>
                <div class="list-item-name">
                  {{ user.first_name }} {{ user.last_name }}
                </div>
              </span>
            </div>
          </div>
          <!-- <div class="celphone-searchlist celphone-scroll-view"
              v-if="currentNumber.trim().length > 0 && filteredUsers.length > 0">
              <span
                v-for="(user, index) in filteredUsers"
                :key="index"
                class="celphone-searchlist-item"
                >{{ user.first_name }} {{ user.last_name }}</span>
            </div> -->
        </div>
        <div
          class="cellphone-search__input"
          v-if="elements.transferNumberInput"
        >
          <input
            type="text"
            placeholder="Type number or name..."
            v-model="currentNumber"
          />
          <span
            v-if="currentNumber.length > 0"
            class="search-clearBtn"
            @click="currentNumber = ''"
            ><img src="/icons/input-clear.svg" alt="" />
          </span>
          <div
            class="cellphone-search__list"
            v-if="currentNumber.trim().length > 0 && filteredUsers.length > 0"
          >
            <div class="list celphone-scroll-view">
              <span
                class="list-item"
                v-for="(user, index) in filteredUsers"
                :key="index"
              >
                <div class="list-item-avatar">
                  <img v-if="user.avatar" :src="user.avatar" alt="" />
                  <img v-else :src="$store.state.defaultAvatar" alt="" />
                </div>
                <div class="list-item-name">
                  {{ user.first_name }} {{ user.last_name }}
                </div>
              </span>
            </div>
          </div>
          <!-- <div class="celphone-searchlist celphone-scroll-view"
                v-if="currentNumber.trim().length > 0 && filteredUsers.length > 0">
            <span
              v-for="(user, index) in filteredUsers"
              :key="index"
              class="celphone-searchlist-item"
            >{{ user.first_name }} {{ user.last_name }}</span>
            </div>
          </div> -->
        </div>
      </div>

      <template v-if="currentPage == 'home'">
        <div class="cellphone-info-box" id="cellphone-info-box">
          <div class="cellphone-info-box__status">
            <span class="incomming" v-if="elements.incomingText"
              >Incomming call ◉</span
            >
            <div class="connected" v-if="elements.connectedText">
              <span>Connected</span>
              <timer :updateFunc="updateTimer" ref="timer"></timer>
            </div>
            <span class="outgoing" v-if="elements.outgoingText"
              >Outgoing call</span
            >
          </div>
        </div>

        <div class="cellphone-info-box__member" v-if="elements.userInfo">
          <div class="cellphone-info-box__member-avatar">
            <img v-if="interlocutor.avatar" :src="interlocutor.avatar" alt="" />
            <img v-else :src="$store.state.defaultAvatar" alt="" />
          </div>
          <div class="cellphone-info-box__member-name">
            <span>{{ interlocutor.name }}</span>
          </div>
          <div class="cellphone-info-box__member-phone">
            <span>{{ interlocutor.phone_number }}</span>
          </div>
          <div class="cellphone-info-box__member-meta">
            <span>{{ interlocutor.vehicle_number }}</span>
          </div>
        </div>

        <div class="cellphone-numpad">
          <!-- <div class="cellphone-numpad__input" v-if="elements.numberInput">
            <span class="numpad-search-icon"><img src='/icons/search-blue.svg' alt=""/></span>
            <input
              type="text"
              placeholder="Search"
              v-model="currentNumber"
            />
            <span v-if="currentNumber.length > 0" class="numpad-clearBtn" @click="currentNumber=''">
              <img src='/icons/input-clear-blue.svg' alt=""/>
            </span>
            <div class="celphone-searchlist celphone-scroll-view"
                 v-if="currentNumber.trim().length > 0 && filteredUsers.length > 0">
           <span
             v-for="(user, index) in filteredUsers"
             :key="index"
             class="celphone-searchlist-item"
           >{{ user.first_name }} {{ user.last_name }}</span>
            </div>
          </div> -->
          <!-- <div class="cellphone-numpad__input" v-if="elements.transferNumberInput">
            <input
              type="text"
              placeholder="Type number or name..."
              v-model="currentNumber"
            />
            <span v-if="currentNumber.length > 0" class="numpad-clearBtn" @click="currentNumber=''"><img
              src='/icons/input-clear.svg' alt=""/></span>
            <div class="celphone-searchlist celphone-scroll-view"
                 v-if="currentNumber.trim().length > 0 && filteredUsers.length > 0">
           <span
             v-for="(user, index) in filteredUsers"
             :key="index"
             class="celphone-searchlist-item"
           >{{ user.first_name }} {{ user.last_name }}</span>
            </div>
          </div> -->
          <div
            class="cellphone-numpad__callActions"
            v-if="elements.dialPad.allActive"
          >
            <div class="actions-row">
              <div
                class="call-action"
                :class="{ active: muted }"
                @click="mute(!muted)"
              >
                <div class="p-icon">
                  <img v-if="!muted" src="/icons/microphone.svg" alt="" />
                  <img v-else src="/icons/microphone-active.svg" alt="" />
                </div>
                <span>Mute</span>
              </div>
              <div @click="keypadClick" class="call-action">
                <div class="p-icon">
                  <img src="/icons/keypad.svg" alt="" />
                </div>
                <span>Keypad</span>
              </div>
              <div class="call-action">
                <div class="p-icon">
                  <img src="/icons/pause.svg" alt="" />
                </div>
                <span>Hold</span>
              </div>
            </div>
            <div class="actions-row">
              <div class="call-action" @click="transferClick">
                <div class="p-icon">
                  <img src="/icons/transfer-call.svg" alt="" />
                </div>
                <span>Transfer</span>
              </div>
              <div class="call-action">
                <div class="p-icon">
                  <img src="/icons/plus.svg" alt="" />
                </div>
                <span>Add</span>
              </div>
              <div class="call-action">
                <div class="p-icon">
                  <img src="/icons/record.svg" alt="" />
                </div>
                <span>Voicemail</span>
              </div>
            </div>
          </div>
          <div class="cellphone-numpad__numpad">
            <template v-if="elements.numpad">
              <div class="number-row">
                <div class="number" data-value="1" @click="numberClick(1)">
                  1
                </div>
                <div class="number" data-value="2" @click="numberClick(2)">
                  2
                </div>
                <div class="number" data-value="3" @click="numberClick(3)">
                  3
                </div>
              </div>
              <div class="number-row">
                <div class="number" data-value="4" @click="numberClick(4)">
                  4
                </div>
                <div class="number" data-value="5" @click="numberClick(5)">
                  5
                </div>
                <div class="number" data-value="6" @click="numberClick(6)">
                  6
                </div>
              </div>
              <div class="number-row">
                <div class="number" data-value="7" @click="numberClick(7)">
                  7
                </div>
                <div class="number" data-value="8" @click="numberClick(8)">
                  8
                </div>
                <div class="number" data-value="9" @click="numberClick(9)">
                  9
                </div>
              </div>
              <div class="number-row">
                <div
                  class="number symbol"
                  data-value="*"
                  @click="numberClick('*')"
                >
                  *
                </div>
                <div class="number" data-value="0" @click="numberClick(0)">
                  0<span class="symbol" data-value="+">+</span>
                </div>
                <div
                  class="number symbol"
                  data-value="#"
                  @click="numberClick('#')"
                >
                  #
                </div>
              </div>
            </template>

            <div class="number-action-buttons">
              <div
                class="number-action-buttons__left"
                v-if="elements.actionButtons.back"
                @click="actionPadBack"
              >
                <div class="call-action">
                  <div class="p-icon">
                    <img src="/icons/back.svg" alt="" />
                  </div>
                </div>
              </div>
              <div
                class="number-action-buttons__right"
                :class="{
                  'justify-center': elements.actionButtons.justify === 'center',
                  'justify-start': elements.actionButtons.justify === 'start',
                  'justify-between':
                    elements.actionButtons.justify === 'between',
                }"
              >
                <div
                  class="number-action-button messageBtn"
                  v-if="elements.messageBtn"
                  ref="callBtn"
                  @click="message"
                >
                  <img src="/icons/write-message.svg" alt="" />
                </div>
                <div
                  class="number-action-button accteptBtn"
                  v-if="elements.callBtn"
                  ref="callBtn"
                  @click="call"
                >
                  <img src="/icons/accpet-call.svg" alt="" />
                </div>
                <div
                  class="number-action-button declineBtn"
                  v-if="elements.hangupBtn"
                  ref="hungUpBtn"
                  @click="hungUp"
                >
                  <img src="/icons/decline-call.svg" alt="" />
                </div>
                <div
                  class="call-action"
                  v-if="elements.actionButtons.warmTransfer"
                >
                  <div class="p-icon">
                    <img src="/icons/warm-transfer.svg" alt="" />
                  </div>
                  <span>Warm Transfer</span>
                </div>
                <div
                  class="call-action"
                  v-if="elements.actionButtons.blindTransfer"
                >
                  <div class="p-icon">
                    <img src="/icons/phone-blind-transfer.svg" alt="" />
                  </div>
                  <span>Blind Transfer</span>
                </div>
              </div>
            </div>
          </div>
          <!--          <div class="number-action-buttons">-->
          <!--            <div class="number-action-button accteptBtn" v-if="elements.callBtn" ref="callBtn" @click="call">-->
          <!--              <img src='/icons/accpet-call.svg' alt=""/>-->
          <!--            </div>-->
          <!--            <div class="number-action-button declineBtn" v-if="elements.hangupBtn" ref="hungUpBtn" @click="hungUp">-->
          <!--              <img src='/icons/decline-call.svg' alt=""/>-->
          <!--            </div>-->
          <!--          </div>-->
        </div>
      </template>

      <template v-else-if="currentPage == 'fax'">
        <div class="cellphone-page-header">
          <div class="cellphone-page-backBtn" @click="currentPage = 'main'">
            <img src="/icons/phone-back.svg" alt="" />
          </div>
          <span class="cellphone-page-header__title">Send a fax</span>
        </div>
        <telephonyFax></telephonyFax>
      </template>

      <template v-else-if="currentPage == 'chat'">
        <telephonyChat></telephonyChat>
      </template>

      <template v-else-if="currentPage == 'history'">
        <div class="cellphone-page-header">
          <div class="cellphone-page-backBtn" @click="currentPage = 'main'">
            <img src="/icons/phone-back.svg" alt="" />
          </div>
          <span class="cellphone-page-header__title">History</span>
        </div>
        <telephonyHistory></telephonyHistory>
      </template>

      <div class="cellphone-bottom-menu">
        <div class="cellphone-bottom-menu__nav">
          <div
            class="cellphone-bottom-menu__item"
            :class="{ active: currentPage == 'home' }"
            @click="currentPage = 'home'"
          >
            <div class="pos-relative">
              <img
                v-if="currentPage != 'home'"
                src="/icons/phone-home.svg"
                alt=""
              />
              <img v-else src="/icons/phone-home-active.svg" alt="" />
              <!--          <div class="c-badge"><img src="/icons/phone-badge.svg" alt=""/></div>-->
            </div>
            <span>Home</span>
          </div>

          <div
            class="cellphone-bottom-menu__item"
            :class="{ active: currentPage == 'fax' }"
            @click="currentPage = 'fax'"
          >
            <div class="pos-relative">
              <img
                v-if="currentPage != 'fax'"
                src="/icons/phone-fax.svg"
                alt=""
              />
              <img v-else src="/icons/phone-fax-active.svg" alt="" />
              <!--          <div class="c-badge"><img src="/icons/phone-badge.svg" alt=""/></div>-->
            </div>
            <span>Fax</span>
          </div>

          <div
            class="cellphone-bottom-menu__item"
            :class="{ active: currentPage == 'chat' }"
            @click="currentPage = 'chat'"
          >
            <div class="pos-relative">
              <img
                v-if="currentPage != 'chat'"
                src="/icons/phone-chat.svg"
                alt=""
              />
              <img v-else src="/icons/phone-chat-active.svg" alt="" />
              <!--          <div class="c-badge"><img src="/icons/phone-badge.svg" alt=""/></div>-->
            </div>
            <span>Chat</span>
          </div>

          <div
            class="cellphone-bottom-menu__item"
            :class="{ active: currentPage == 'history' }"
            @click="currentPage = 'history'"
          >
            <div class="pos-relative">
              <img
                v-if="currentPage != 'history'"
                src="/icons/phone-history.svg"
                alt=""
              />
              <img v-else src="/icons/phone-history-active.svg" alt="" />
              <!--          <div class="c-badge"><img src="/icons/phone-badge.svg" alt=""/></div>-->
            </div>
            <span>History</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
// import {AppCallFn} from '@/components/telephony/library/AppCall'

import { AppCall } from "@/components/telephony/library-new/AppCall";

import timer from "@/components/timer";
import telephonyFax from "@/components/telephony/pages/fax";
import telephonyHistory from "@/components/telephony/pages/history";
import telephonyChat from "@/components/telephony/pages/chat";
import Vue from "vue";
import VueSocketIO from "vue-socket.io";

const axios = require("axios");

export default {
  name: "telephony",
  props: ["drawer"],

  data: () => ({
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"],
    currentNumber: "",
    connect: {},
    AppCall: {},
    status: "Ready",
    dialog: false,
    options: {},
    callDuration: "",
    users: [],
    usersLoading: false,
    queue: true,
    muted: false,
    queueLoading: false,
    showNumber: true,
    myNumber: "",
    interlocutor: {},
    numberFrom: "",
    transferFrom: "",
    socket: "",
    transferTo: "",
    currentPage: "home", //init home
    dialogHeaders: [
      { text: "ID", value: "id", sortable: false, align: "center" },
      { text: "Name", value: "name", align: "center" },
    ],
    elements: {
      phoneActive: false,
      incomingText: false,
      connectedText: false,
      outgoingText: false,
      numberInput: true,
      transferNumberInput: false,
      userInfo: false,
      numpad: true,
      callBtn: true,
      hangupBtn: false,
      messageBtn: false,
      dialPad: {
        allActive: false,
        mute: true,
        keypad: true,
        hold: true,
        transfer: true,
        add: true,
        voicemail: true,
      },
      actionButtons: {
        back: false,
        justify: "center",
        warmTransfer: false,
        blindTransfer: false,
      },
    },
  }),
  watch: {
    connect: function (val, oldVal) {
      this.AppCall.updateConnect(this.connect);
    },
    dialog: function (val, oldVal) {
      if (!val) return;

      this.usersLoading = true;
      this.updateActiveUsers();
    },
    currentNumber: function (nextValue, oldVal) {
      if (nextValue !== oldVal && nextValue !== "") {
        this.searchDrivers(nextValue.trim());
      }
    },
  },
  sockets: {
    message_link: function (data) {
      let formData = new FormData();
      const self = this;

      formData.append("duration", data.duration);
      formData.append("number_to", data.to);
      formData.append("status", self.formatCallStatus(data.status));
      formData.append("number_from", data.from);
      if (data.link !== undefined) {
        formData.append("record_link", data.link);
      }
      formData.append("direction", data.direction);

      this.setHistoryData(formData);
    },
  },
  methods: {
    async searchDrivers(value) {
      let accessToken = this.$store.getters.getToken
        ? this.$store.getters.getToken
        : localStorage.getItem("etl-user-token");

      try {
        const { data } = await axios({
          method: "get",
          url:
            this.$store.state.backendUrl +
            `/backend/api/users/drivers/?search=${value}`,
          headers: { Authorization: "JWT " + accessToken },
        });

        if (data.length > 0) {
          this.users = data;
        } else {
          this.users = [];
        }
      } catch (error) {
        console.log(error);
      }
    },
    chooseInterlocutor(id) {
      const {
        driver_info: { user, working_car = "" },
      } = this.users.find((user) => user.id === id);

      const name = `${user.first_name} ${user.last_name}`;
      const { avatar, phone_number = "" } = user;

      this.currentNumber = name;
      this.elements.userInfo = true;
      this.elements.messageBtn = true;
      this.interlocutor = {
        name,
        avatar,
        phone_number,
        vehicle_number: phone_number && working_car,
      };
    },
    transferClick() {
      this.elements.transferNumberInput = true;
      this.elements.numpad = true;
      this.elements.dialPad.allActive = false;
      this.elements.actionButtons.back = true;
      this.elements.actionButtons.justify = "between";
      this.elements.hangupBtn = false;
      this.elements.actionButtons.warmTransfer = true;
      this.elements.actionButtons.blindTransfer = true;
    },
    mute(action) {
      this.AppCall.mute(action);
      this.muted = this.AppCall.isMuted();
    },
    toggleMute() {
      this.AppCall.mute(!this.AppCall.isMuted());
      this.muted = this.AppCall.isMuted();
    },
    actionPadBack() {
      this.elements.transferNumberInput = false;
      this.elements.numpad = false;
      this.elements.dialPad.allActive = true;
      this.elements.actionButtons.back = false;
      this.elements.actionButtons.justify = "center";
      this.elements.actionButtons.blindTransfer = false;
      this.elements.actionButtons.warmTransfer = false;
      this.elements.hangupBtn = true;
    },
    keypadClick() {
      this.elements.transferNumberInput = true;
      this.elements.numpad = true;
      this.elements.dialPad.allActive = false;
      this.elements.actionButtons.back = true;
      this.elements.actionButtons.justify = "start";
    },
    updateTimer(val) {
      this.callDuration = val;
    },
    async setQueue(queue) {
      this.queueLoading = true;
      let self = this;
      let accessToken = this.$store.getters.getToken
        ? this.$store.getters.getToken
        : localStorage.getItem("etl-user-token");
      
      await axios({
        method: "post",
        url: "https://sms.green-node.ru/set_dispatchers_list",
        data: {
          name: self.$store.getters.getCurrentUser.company_info.company_hash,
          number: self.myNumber,
          action: queue ? "addDispatcher" : "deleteDispatcher",
        },
        headers: { Authorization: "JWT " + accessToken },
      })
        .then(function (response) {
          if (response.data.msg === "Ok") {
            self.queueLoading = false;
            self.queue = queue;
          }
        })
        .catch(function (error) {
          console.log(error);
        });


      console.log(this.$store.getters.getCurrentUser.company_info.company_hash)
      // test не возвращает список очереди 
      const res = await axios({
        method: "get",
        url:
          "https://sms.green-node.ru/get_active_dispatchers/" +
          this.$store.getters.getCurrentUser.company_info.company_hash,
      });

      console.log(res);
      //
    },
    selectTransfer(user) {
      this.dialog = false;
      this.transferFn(user.phone_number);
    },
    numberClick(number) {
      if (this.currentNumber.length == 13) return;

      this.currentNumber += number;

      const Number = this.currentNumber;

      this.AppCall.sendDigits(Number.toString());
    },
    hungUp() {
      this.AppCall.decline();
    },
    message() {},
    call() {
      if (this.currentNumber == "" || this.currentNumber.length < 6) {
        alert("Phone number is incorrect!");
      } else {
        this.AppCall.call("+" + this.currentNumber, this.myNumber);
      }

      // Прошлый вариант действия при вызове на пустой номер
      // this.interlocutor = {
      //   name: 'IVR',
      //   phone: '',
      //   avatar: '/images/cnu_logo.png',
      //   id: ''

      // }
      // this.AppCall.call('', this.myNumber)
    },
    getUserByPhoneNumber(phone_number) {
      let result = {};
      this.users.forEach(function (user, index) {
        if (user.phone_number !== phone_number) return false;
        result = user;
      });
      return result;
    },
    setConnect(connect) {
      this.connect = connect;
    },
    connectHandler(connect) {
      this.elements.phoneActive = true;
      this.elements.incomingText = false;
      this.elements.connectedText = true;
      this.elements.outgoingText = false;
      this.elements.userInfo = true;
      this.elements.dialPad.allActive = true;
      this.elements.numpad = false;
      this.elements.callBtn = false;
      this.elements.hangupBtn = true;
    },
    disconnectHandler(connect) {
      this.elements.phoneActive = false;
      this.muted = this.AppCall.isMuted();
      this.elements.actionButtons.justify = "center";
      this.elements.actionButtons.back = false;
      this.elements.incomingText = false;
      this.elements.connectedText = false;
      this.elements.outgoingText = false;
      this.elements.userInfo = false;
      this.elements.dialPad.allActive = false;
      this.elements.numberInput = true;
      this.elements.transferNumberInput = false;
      this.elements.numpad = true;
      this.elements.callBtn = true;
      this.elements.hangupBtn = false;

      this.transferFrom = "";
      this.interlocutor = {};
      this.currentNumber = "";
      this.numberFrom = "";
      this.showNumber = true;
    },
    incomingHandler(from) {
      this.currentPage = "main";

      this.elements.incomingText = true;
      this.elements.connectedText = false;
      this.elements.outgoingText = false;
      this.elements.userInfo = true;
      this.elements.numpad = false;
      this.elements.dialPad.allActive = true;
      this.elements.callBtn = true;
      this.elements.hangupBtn = true;

      this.transferFrom = from;
      this.numberFrom = from;
      this.interlocutor = this.getUserByPhoneNumber(from);
      // this.$refs.callBtn.classList.add('flashing')
      this.status = "Incoming";
    },
    acceptHandler(from) {
      this.elements.incomingText = false;
      this.elements.connectedText = true;
      this.elements.outgoingText = false;
      this.elements.userInfo = true;
      this.elements.dialPad.allActive = true;
      this.elements.numpad = false;
      this.elements.callBtn = false;
      this.elements.hangupBtn = true;

      this.numberFrom = from;
      this.status = "In call with";
      // this.$refs.callBtn.classList.remove('flashing')
    },
    callingHandler(connect) {
      this.elements.incomingText = false;
      this.elements.connectedText = false;
      this.elements.outgoingText = true;
      this.elements.userInfo = true;
      this.elements.numberInput = false;
      this.elements.dialPad.allActive = true;
      this.elements.numpad = false;
      this.elements.callBtn = false;
      this.elements.hangupBtn = true;

      this.numberFrom = "";
      this.transferFrom = this.myNumber;
      this.status = "Calling";
    },
    missedCallHandler(connect) {
      console.log("missedCallHandler");
    },
    transferHandler(number, to, myExt, from, callback) {
      axios({
        method: "POST",
        url: `https://sms.green-node.ru/call_to_dispatcher/${to}/${myExt}/agent`,
        data: {
          from: from,
        },
        headers: { "Content-Type": "application/json" },
      })
        .then()
        .catch(function (error) {
          console.log(error);
        });
    },
    transferFn(number) {
      this.AppCall.connectGuard(this.connect, "open") &&
        this.transferHandler(
          number,
          this.myNumber,
          this.transferFrom,
          this.hungUp
        );
    },
    getActiveDispatchers(fromWhere) {
      // console.log("getActiveDispatchers", fromWhere);

      let accessToken = this.$store.getters.getToken
        ? this.$store.getters.getToken
        : localStorage.getItem("etl-user-token");
      const self = this;

      return new Promise((resolve, reject) => {
        axios({
          method: "get",
          url:
            "https://sms.green-node.ru/get_company_data/" +
            self.$store.getters.getCurrentUser.company_info.company_hash,
          headers: { Authorization: "JWT " + accessToken },
        })
          .then(function (response) {
            // console.log( fromWhere, response, "then getAct");
            resolve(response.data.company.dispatcher_numbers);
          })
          .catch(function (error) {
            console.log(error);
          });
      });
    },
    timer(action) {
      this.$globalEvents.$emit("phoneTimer", action);
    },
    updateActiveUsers() {
      let self = this;
      let accessToken = this.$store.getters.getToken
        ? this.$store.getters.getToken
        : localStorage.getItem("etl-user-token");

      axios({
        method: "get",
        url: self.$store.state.backendUrl + "/backend/api/users/drivers",
        headers: { Authorization: "JWT " + accessToken },
      })
        .then(function (response) {
          let all_users = response.data;

          const AvailableDepartments = [
            "Shipper",
            "Carrier",
            "Dispatcher",
            "User",
            "HR",
          ];

          self.getActiveDispatchers("updateActiveUsers").then((data) => {
            let active_users = data;
            let users = [];
            // console.log("updateActiveUsers", data);

            all_users.forEach((val, index) => {
              if (AvailableDepartments.includes(val.department) === false)
                return;
              if (active_users.includes(val.phone_number) === false) return;

              users.push({
                id: val.id,
                department: val.department,
                name: val.first_name + " " + val.last_name,
                phone_number: val.phone_number,
                emergency_phone: val.emergency_phone,
                car_id: val.driver_info.working_car,
              });
            });

            self.users = users;
            self.usersLoading = false;
            self.$store.commit("updateUsers", users);
          });
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    setGlobalEvents() {
      const self = this;
      this.$globalEvents.$on("telephonySetNumber", (number) => {
        this.currentNumber = number;
      });
      this.$globalEvents.$on("telephonyCall", () => {
        this.call();
      });
      this.$globalEvents.$on(
        "telephonyCallToNumber",
        (number, showNumber = false) => {
          this.showNumber = showNumber;
          this.currentNumber = number;
          this.call();
        }
      );
      document.addEventListener("telephonyCallToNumber", (e) => {
        this.showNumber = true;
        this.currentNumber = e.detail.number;
        this.call();
      });
    },
    connectToSocket() {
      const self = this;

      // if (this.socket != '') {
      //   return
      // }
      //
      // this.socket = new WebSocket('wss://sms.green-node.ru/socket.io/?EIO=3&transport=websocket&company=cnu&number=' + self.$store.state.currentUser.phone_number)
      //
      // self.socket.onopen = () => {
      //
      //   self.socket.onmessage = ({data}) => {
      //
      //     console.log(data)
      //
      //     data = data.substring(1)
      //
      //     let pData = JSON.parse(data)
      //
      //     console.log(pData)
      //     return
      //
      //     if(pData[0] === 'message_link') {
      //
      //       let formData = new FormData()
      //
      //       formData.append('duration', pData[1].duration)
      //       formData.append('number_to', pData[1].to)
      //       formData.append('status', self.formatCallStatus(pData[1].status))
      //       formData.append('number_from', pData[1].from)
      //       formData.append('record_link', pData[1].link)
      //       formData.append('direction', pData[1].direction)
      //
      //
      //       self.setHistoryData(formData)
      //     }
      //
      //     console.log(pData)
      //   }
      //   this.socket.onclose = function (err) {
      //     // alert("close")
      //     console.log("=======")
      //     console.log(err)
      //     console.log("=======")
      //   }
      //   this.socket.onerror = function (error) {
      //     // console.log('CompanyWebSocket Error: ' + error);
      //     alert("error")
      //   }
      // };
    },
    formatCallStatus(status) {
      switch (status) {
        case "completed":
          return "Successful call";
        case "busy":
          return "Busy";
        case "no-answer":
          return "Missed call";
        default:
          return status;
      }
    },
    setHistoryData(formData) {
      let self = this;
      let accessToken = this.$store.getters.getToken
        ? this.$store.getters.getToken
        : localStorage.getItem("etl-user-token");

      axios({
        method: "post",
        url: self.$store.state.backendUrl + "/backend/api/calls/",
        data: formData,
        headers: { Authorization: "JWT " + accessToken },
      })
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
    },
  },
  created() {
    const self = this;
    this.queueLoading = true;

    this.setGlobalEvents();
    this.$globalEvents.$on("renewCurrentUser", () => {
      if (self.$store.getters.getCurrentUser.phone_number === undefined) return;

      Vue.use(
        new VueSocketIO({
          debug: false,
          connection:
            "wss://sms.green-node.ru/?company=" +
            self.$store.getters.getCurrentUser.company_info.company_hash +
            "&number=" +
            self.$store.getters.getCurrentUser.phone_number,
        })
      );

      self.getActiveDispatchers("create").then((data) => {
        // console.log(data, "self.getActiveDispatchers");
        // self.queue = data.includes(self.$store.state.currentUser.phone_number);
        self.queueLoading = false;
      });

      let btns = document.querySelector(".telephony-numbers button");

      // self.AppCall = new AppCallFn(
      //   {
      //     connect: self.connect,
      //     setConnect: self.setConnect,
      //     missedCallHandler: self.missedCallHandler,
      //     callingHandler: self.callingHandler,
      //     acceptHandler: self.acceptHandler,
      //     incomingHandler: self.incomingHandler,
      //     disconnectHandler: self.disconnectHandler,
      //     connectHandler: self.connectHandler
      //   })
      //
      // self.AppCall.initEventsListener()
      // self.AppCall.initToken(self.$store.getters.getCurrentUser.phone_number)
      self.myNumber = self.$store.getters.getCurrentUser.phone_number;
      // // self.AppCall.initToken('888')

      self.AppCall = new AppCall({
        connect: self.connect,
        setConnect: self.setConnect,
        missedCallHandler: self.missedCallHandler,
        callingHandler: self.callingHandler,
        acceptHandler: self.acceptHandler,
        incomingHandler: self.incomingHandler,
        disconnectHandler: self.disconnectHandler,
        connectHandler: self.connectHandler,
      });

      self.AppCall.init(
        self.$store.getters.getCurrentUser.phone_number,
        String(self.$store.getters.getCurrentUser.company_info.company_hash)
      );
      self.connectToSocket();
      self.updateActiveUsers();
    });
  },
  beforeDestroy() {},
  mounted() {},
  computed: {
    filteredUsers() {
      return this.users.filter((user) => {
        return (
          user.first_name
            .toLowerCase()
            .includes(this.currentNumber.toLowerCase().trim()) ||
          user.last_name
            .toLowerCase()
            .includes(this.currentNumber.toLowerCase().trim()) ||
          (
            user.first_name.toLowerCase() +
            " " +
            user.last_name.toLowerCase()
          ).includes(this.currentNumber.toLowerCase().trim()) ||
          (
            user.last_name.toLowerCase() +
            " " +
            user.first_name.toLowerCase()
          ).includes(this.currentNumber.toLowerCase().trim())
        );
      });
    },
  },
  components: {
    telephonyFax,
    telephonyHistory,
    telephonyChat,
    timer,
  },
};
</script>

<style lang="css" scoped src="@/components/telephony/style.css"></style>
