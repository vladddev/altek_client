<template>
  <v-card width="100%" class="h-100">
    <v-dialog v-model="sendSmsDialog" max-width="400px">
      <v-card :loading="loading">
        <v-card-title class="headline"> Send sms </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-select
                :items="['Custom', 'Default']"
                value="Custom"
                @input="selectSms($event)"
                dense
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-text-field label="SMS template" v-model="smsTemplate" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="sendSmsDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="sendMassSms()"
            :loading="loading"
            :disabled="smsTemplate == ''"
            >Submit</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div class="d-flex h-100">
      <v-col class="pd-0 h-100" cols="4">
        <div class="chat-panel">
          <v-list-item class="h-100">
            <v-list-item-avatar>
              <!--              <v-img src="https://flynow.ru/wp-content/themes/flynow-new/images/default-user.png"></v-img>-->
              <v-img
                v-if="$store.state.currentUser.avatar !== undefined"
                :src="$store.state.backendUrl + $store.state.currentUser.avatar"
              ></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                <v-row class="mr-0">
                  {{ $store.state.currentUser.first_name }}
                  {{ $store.state.currentUser.last_name }}
                </v-row>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </div>
        <div class="btns-wrap pa-4">
          <v-btn
            @click="selectAll()"
            class="mr-4"
            :disabled="chats.length == 0"
            :color="chats.length == selectedDrivers.length ? 'primary' : 'gray'"
            >Select All</v-btn
          >
          <v-btn @click="sendSmsDialog = true">Send SMS</v-btn>
        </div>
        <div class="search-wrap">
          <v-text-field
            v-model="searchField"
            :loading="searchLoading"
            append-outer-icon="mdi-account-search"
            hide-details="auto"
            outlined
            dense
            label="Search..."
            type="text"
            @click:append-outer="search"
          ></v-text-field>
        </div>

        <v-list
          class="pd-0 scroll-view"
          style="overflow-y: overlay; height: calc(100% - 210px)"
        >
          <template v-if="chats.length > 0" v-for="(chat, index) in chats">
            <div :key="chat.id">
              <v-list-item
                @click="openChat(chat, $event)"
                two-line
                :style="chat.id == current_chat_id ? 'background-color: #EBEBEB' : ''"
              >
                <div
                  data-block="item-block"
                  :style="{
                    backgroundColor: 'transparent',
                    position: 'absolute',
                    height: '100%',
                    width: '100%',
                    zIndex: 0,
                  }"
                ></div>

                <v-list-item-avatar>
                  <v-img :src="chat.member.avatar"></v-img>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title>
                    <v-row class="mr-0">
                      #{{ chat.member.id }}
                      {{ chat.member.first_name + " " + chat.member.last_name }}
                      <v-spacer />
                    </v-row>
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    <span class="text--primary">{{
                      chat.lastMessage.modifiedDateTime
                    }}</span>
                    -
                    {{ chat.lastMessage.content }}
                  </v-list-item-subtitle>
                </v-list-item-content>

                <v-checkbox
                  v-model="selectedDrivers"
                  :value="chat.member.phone_number"
                ></v-checkbox>
              </v-list-item>
              <v-divider v-if="index + 1 < chats.length"></v-divider>
            </div>
          </template>
          <v-progress-circular
            v-else
            :width="3"
            color="red"
            indeterminate
          ></v-progress-circular>
        </v-list>
      </v-col>
      <v-col class="pd-0 h-100" cols="8">
        <div class="chat-window h-100">
          <div v-if="firstSelection" style="height: 100%">
            <div class="chat-window__header">
              <v-list-item>
                <v-list-item-avatar>
                  <v-img src="/images/group-chat-avatar.svg"></v-img>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title>
                    <v-row class="mr-0">
                      <span>
                        {{ members.email }}
                      </span>
                    </v-row>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </div>
            <div class="chat-window__body scroll-view scroll-overlay">
              <div class="chat-window-scroll-view h-100">
                <div
                  class="chat-window_chat-item"
                  v-for="(message, index) in currentChat"
                  :key="index"
                >
                  <v-card
                    elevation="1"
                    class="chat-window_msg"
                    v-bind:class="{
                      'chat-window_msg_right': message.fromMe,
                      'chat-window_msg_left': !message.fromMe,
                    }"
                  >
                    <div class="chat-window__msg-header" v-if="!message.fromMe">
                      {{ message.message.author.first_name }}
                    </div>
                    <div class="chat-window_msg-body">
                      <span class="message-text">{{
                        message.message.text
                      }}</span>
                    </div>
                    <div class="chat-window_msg-footer">
                      <span class="chat-window_msg-footer-time">
                        {{ message.message.time }}
                      </span>
                    </div>
                  </v-card>
                </div>
              </div>
            </div>
            <div class="chat-window__footer">
              <div style="display: flex; flex-direction: column; width: 100%">
                <v-form @submit.prevent="sendMessage" class="chat-form">
                  <input
                    v-model="inputModel"
                    class="chat-window__input"
                    placeholder="Message..."
                    type="text"
                  />
                  <v-btn icon @click="sendMessage">
                    <v-icon>mdi-send</v-icon>
                  </v-btn>
                </v-form>
              </div>
            </div>
          </div>
          <div v-else class="chat-empty-msg-block">
            <v-img
              max-height="121"
              max-width="121"
              contain
              src="/images/chat-empty.svg"
            ></v-img>
            <span class="grey--text" style="font-size: 25px"
              >Please choose chat</span
            >
          </div>
        </div>
      </v-col>
    </div>
  </v-card>
</template>

<script>
const axios = require("axios");

export default {
  data: () => ({
    loading: false,
    searchLoading: false,
    sendSmsDialog: false,
    searchField: "",
    selected: [],
    interval: null,
    chats: [],
    selectedDrivers: [],
    chatLoading: false,
    inputModel: "",
    current_chat_id: "",
    chatSocket: "",
    files: [],
    members: {},
    firstSelection: false,
    currentChat: false,
    smsTemplate: "",
  }),
  methods: {
    checkAttributeData(tag) {
      return tag.dataset.block === "item-block" ? true : false;
    },
    prepareChat(dirtyData) {
      const self = this;
      this.members.id = dirtyData.id;
      this.members.email = dirtyData.email;
      this.members.phone_number = dirtyData.phone_number;

      let chat = [];

      dirtyData.messages.forEach((item) => {
        self.currentChat.push({
          fromMe: item.user_from != self.members.id,
          message: {
            author: dirtyData.email,
            text: item.content,
            time: self.$globalFunctions.repairDatetime(item.modifiedDateTime),
          },
        });
      });

      self.chat = chat;
    },
    sendMessage() {
      const self = this;
      let accessToken = this.$store.getters.getToken;

      this.loading = true;

      const $container = document.querySelector("html");
      $container.scrollTop = $container.scrollHeight;

      axios({
        method: "post",
        url: self.$store.state.backendUrl + "/backend/api/sms/new/",
        data: {
          content: self.inputModel,
          toNumber: self.members.phone_number,
        },
        headers: {
          Authorization: "JWT " + accessToken,
        },
      })
        .then(function (response) {
          console.log(response);

          self.currentChat.push({
            fromMe: true,
            message: {
              author: self.$store.getters.getCurrentUser.email,
              text: self.inputModel,
              time: self.$globalFunctions.repairDatetime(
                new Date().toISOString()
              ),
            },
          });
          const $container = document.querySelector("html");
          $container.scrollTop = $container.scrollHeight;

          self.loading = false;
          self.message = "";
          self.inputModel = "";
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    filterChatGroups(dirtyData) {
      const self = this;

      const cleanData = dirtyData.map((item) => {
        let output = {};

        output.id = item.id;
        output.isNew = item.last_message.status == "Send";

        output.member = {
          id: "",
          first_name: "",
          last_name: "",
          email: "",
          phone_number: "",
          avatar: "",
        };

        output.member.id = item.id;
        output.member.first_name = item.first_name;
        output.member.last_name = item.last_name;
        output.member.email = item.email;
        output.member.phone_number = item.phone_number;
        output.member.avatar =
          item.avatar != null
            ? item.avatar
            : self.$store.getters.getDefaultAvatar;

        if (item.last_message.content !== "") {
          output.lastMessage = {
            content: item.last_message.content,
            modifiedDateTime: self.$globalFunctions.repairDatetime(
              item.last_message.modifiedDateTime
            ),
          };
        } else {
          output.lastMessage = {
            content: "",
            modifiedDateTime: "",
          };
        }

        return output;
      });

      return cleanData;
    },
    updateChats() {
      const accessToken = this.$store.getters.getToken
        ? this.$store.getters.getToken
        : localStorage.getItem("etl-user-token");
      const self = this;

      axios({
        method: "get",
        url: self.$store.state.backendUrl + "/backend/api/users/drivers/",
        headers: {
          Authorization: "JWT " + accessToken,
        },
      })
        .then(function (response) {
          self.chats = self.filterChatGroups(response.data);

          axios({
            method: "get",
            url: self.$store.state.backendUrl + "/backend/api/users/drivers/",
            headers: {
              Authorization: "JWT " + accessToken,
            },
          })
            .then(function (response) {
              self.loading = false;
              self.chats = self.filterChatGroups(response.data);
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    openChat(chat, event) {
      if (!this.checkAttributeData(event.target)) {
        return;
      }

      const self = this;

      this.files = [];
      this.inputModel = "";

      self.firstSelection = true;

      const accessToken = this.$store.getters.getToken;

      this.currentChat = [];

      axios({
        method: "get",
        url:
          self.$store.state.backendUrl +
          "/backend/api/driver-chat/" +
          chat.id +
          "/",
        params: {
          // page: self.$router.history.current.path
          page: 1,
        },
        headers: {
          Authorization: "JWT " + accessToken,
        },
      })
        .then(function (response) {
          // console.log("response =>", response);
          self.prepareChat(response.data);
          self.current_chat_id = chat.id;
          if (self.currentChat.length > 0) {
            self.scrollChatToBottom();
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    scrollChatToBottom() {
      let interval = setInterval(myTimer, 100);

      function myTimer() {
        console.log(1);
        let container = document.querySelector(
          ".chat-window__body.scroll-view"
        );
        let items = document.querySelector(
          ".chat-window__body.scroll-view .chat-window_chat-item"
        );
        if (items !== null) {
          container.scrollTop = container.scrollHeight;
          stopInterval();
        }
      }

      function stopInterval() {
        clearInterval(interval);
      }
    },
    connect(chat_id) {
      const accessToken = this.$store.getters.getToken
        ? this.$store.getters.getToken
        : localStorage.getItem("etl-user-token");

      if (this.chatSocket != "") {
        this.disconnect();
      }

      this.chatSocket = new WebSocket(
        this.$store.state.backendSocketUrl +
          "/ws/chat/" +
          chat_id +
          "/?access_token=" +
          accessToken
      );

      this.chatSocket.onopen = () => {
        const $container = document.querySelector(".chat-window__body");
        $container.scrollTop = $container.scrollHeight;

        this.chatSocket.onmessage = ({ data }) => {
          const message = JSON.parse(data);

          this.currentChat.push({
            fromMe: message.user_from.id === this.$store.state.currentUser.id,
            message: {
              author: message.user_from,
              text: message.content,
              time: moment(message.modifiedDateTime).format("h:mm"),
            },
          });

          this.loading = false;
        };
        this.chatSocket.onclose = function (err) {
          console.log(err);
          alert("Websocket error");
        };
        this.chatSocket.onerror = function (error) {
          console.log("WebSocket Error: " + error);
        };
      };
    },
    disconnect() {
      this.chatSocket.close();
      this.chatSocket = "";
    },
    receiveMessage(data) {
      const self = this;
      this.currentChat.push({
        fromMe: data.user_from.id === self.$store.state.currentUser.id,
        message: {
          author: data.user_from,
          files: data.media === false ? [] : data.media,
          text: data.content,
          time: moment(data.modifiedDateTime).format("h:mm"),
        },
      });
      self.scrollChatToBottom();
    },
    setGlobalEvents() {
      const self = this;
      this.$globalEvents.$on("receive_message", (data) => {
        self.receiveMessage(data);
      });
    },
    search() {
      const accessToken = this.$store.getters.getToken;
      const self = this;
      this.searchLoading = true;
      axios({
        method: "get",
        url:
          self.$store.state.backendUrl +
          "/backend/api/users/drivers/?search=" +
          self.searchField.trim(),
        headers: {
          Authorization: "JWT " + accessToken,
        },
      })
        .then(function (response) {
          self.chats = self.filterChatGroups(response.data);
          self.searchLoading = false;
          self.selectedDrivers = [];
        })
        .catch(function (error) {
          console.log(error);
          self.searchLoading = false;
        });
    },
    selectAll() {
      if (this.chats.length == this.selectedDrivers.length) {
        this.selectedDrivers = [];
      } else {
        this.selectedDrivers = this.chats.map((item) => {
          return item.member.phone_number;
        });
      }
      console.log(this.selectedDrivers);
    },
    selectSms($event) {
      if ($event == "Default") {
        this.smsTemplate = this.$store.getters.getSettings.sms_template;
      } else if ($event == "Custom") {
        this.smsTemplate = "";
      }
    },
    sendMassSms() {
      const self = this;
      const accessToken = this.$store.getters.getToken;

      this.loading = true;

      axios({
        method: "post",
        url: self.$store.state.backendUrl + "/backend/api/sms/new/",
        data: {
          content: self.smsTemplate,
          numbers: self.selectedDrivers,
        },
        headers: {
          Authorization: "JWT " + accessToken,
        },
      })
        .then(function (response) {
          console.log(response);
          self.loading = false;
          self.sendSmsDialog = false;
          self.updateChats();
        })
        .catch(function (error) {
          self.loading = false;
          self.sendSmsDialog = false;
          console.log(error);
        });
    },
  },
  created() {
    this.updateChats();
  },
  mounted() {
    this.$store.commit("updateToolbarData", {
      title: "SMS",
    });
    if (!this.loading) {
      this.$globalEvents.$emit("refreshTokens");
    }
  },
  beforeDestroy() {
    this.$store.commit("updateToolbarData", {});
    this.$globalEvents.$off("refreshTokens");
    clearInterval(this.interval);
  },
};
</script>

<style lang="css" scoped>
.search-wrap {
  display: flex;
  align-items: center;
  padding: 12px;
}
.pd-0 {
  padding: 0 !important;
}

.mr-0 {
  margin: 0 !important;
}

.card-wrapper {
  border: 1px solid #e0e0e0;
}

.chat-window-fixed {
  width: 250px;
  height: 330px;
  position: fixed;
  bottom: 10px;
  right: 12px;
}

.chat-window {
  height: 750px;
  z-index: 999;
  border-left: 1px solid #e0e0e0;
}

.chat-window__header {
  height: 75px;
  border-bottom: 1px solid silver;
  display: flex;
  color: #fff;
  justify-content: space-between;
  align-items: center;
}

.chat-window__body {
  height: calc(100% - 150px);
  background-color: #e6dedb;
  overflow-y: scroll;
}

.chat-window_msg {
  max-width: calc(100% - 150px);
}

.chat-window_msg_right {
  float: right;
  padding: 10px;
  min-width: 100px;
  background-color: #2196f3;
  color: #fff;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
}

.chat-window_msg_left {
  float: left;
  padding: 10px;
  min-width: 100px;
  background-color: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
}

.chat-window__footer {
  height: 75px;
  padding: 10px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-window__input {
  width: 100%;
  /* border: 1px solid silver; */
}

.chat-window__input:focus {
  outline: none;
}

.chat-window_chat-item {
  padding-bottom: 10px;
}

.chat-window__msg-header {
  margin-bottom: 5px;
}

.chat-window__msg-header {
  font-size: 15px;
  font-weight: bold;
}

.chat-window_msg-body {
  font-size: 13px;
  margin-bottom: 5px;
}

.chat-window_msg_left .chat-window_msg-footer-time {
  color: silver;
}

.chat-window_msg-footer {
  font-size: 10px;
  text-align: right;
}

.chat-window-scroll-view {
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.chat-panel {
  height: 75px;
  border-bottom: 1px solid #e0e0e0;
}

.chat-form {
  display: flex;
  width: 100%;
}

.files-wrapper {
  display: flex;
  flex-wrap: wrap;
}

.files-item {
  position: relative;
}

.files-item:not(:first-child) {
  margin-left: 10px;
}

.files-item__image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  display: block;
  border-radius: 3px;
}

.files-delete-btn {
  visibility: hidden;
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.files-item:hover .files-delete-btn {
  visibility: initial;
}

.message-files {
}

.message-files__item img {
  width: 100%;
}

.message-files__item:hover {
  cursor: pointer;
}

.files-item__sheet {
  width: 50px;
  height: 50px;
}

.chat-empty-msg-block {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.message-text {
  font-size: 15px;
  font-weight: 300;
}
</style>
