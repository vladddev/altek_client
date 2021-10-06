<template>
  <v-row>
    <v-card class="mx-5" width="100%">
      <div class="d-flex">
        <v-col class="pd-0" cols="4">
          <v-list class="pd-0">
            <div class="chat-my-profile">
              <v-list-item>
                <v-list-item-avatar>
                  <v-img src="https://flynow.ru/wp-content/themes/flynow-new/images/default-user.png"></v-img>
                </v-list-item-avatar>

                <v-list-item-content>

                  <v-list-item-title>

                    <v-row class="mr-0">
                      {{ this.$store.getters.getCurrentUser.email }}
                    </v-row>

                  </v-list-item-title>

                </v-list-item-content>
              </v-list-item>
            </div>
            <template v-if="!chatsLoading" v-for="(chat, index) in chats">

              <v-list-item :key="chat.id" @click="openChat(chat)"
                :style="chat.id == current_chat_id ? 'background-color: #eaeaea' : ''">
                <v-list-item-avatar>
                  <v-img :src="chat.member.avatar"></v-img>
                </v-list-item-avatar>

                <v-list-item-content>

                  <v-list-item-title>

                    <v-row class="mr-0">
                      {{ chat.member.first_name }} {{ chat.member.last_name }}
                      <v-spacer />
                      <span class="grey--text " style="font-size: 13px">{{ chat.lastMessage.modifiedDateTime }}</span>
                    </v-row>

                  </v-list-item-title>

                  <v-list-item-subtitle>
                    <v-row class="mr-0">
                      {{ chat.lastMessage.content }}
                      <v-spacer />
                      <!--                                            <div>1</div>-->
                    </v-row>
                  </v-list-item-subtitle>

                </v-list-item-content>
              </v-list-item>

              <v-divider v-if="index + 1 < chats.length" :key="index"></v-divider>

            </template>
            <!--                        <v-progress-circular-->
            <!--                          v-else-->
            <!--                          :width="3"-->
            <!--                          color="red"-->
            <!--                          indeterminate-->
            <!--                        ></v-progress-circular>-->
          </v-list>
          <!--                    <v-banner v-else>-->
          <!--                        No active chats-->
          <!--                    </v-banner>-->
        </v-col>
        <v-col class="pd-0" cols="8">
          <div class="chat-window">
            <div v-if="currentChat != ''" style="height: 100%">
              <div class="chat-window__header">
                <v-list-item>
                  <v-list-item-avatar>
                    <v-img src="https://flynow.ru/wp-content/themes/flynow-new/images/default-user.png"></v-img>
                  </v-list-item-avatar>

                  <v-list-item-content>

                    <v-list-item-title>

                      <v-row class="mr-0">
                        {{ member.first_name }} {{ member.last_name }}
                      </v-row>

                    </v-list-item-title>

                  </v-list-item-content>
                </v-list-item>
                <!-- <v-btn
                icon
                color="#fff"
                @click="close"
                ><v-icon>mdi-close</v-icon>
                </v-btn> -->
              </div>
              <div class="chat-window__body">
                <div class="chat-window-scroll-view">
                  <div class="chat-window_chat-item" v-for="(message, index) in currentChat" :key="index">
                    <v-card elevation="1"
                      v-bind:class="{ 'chat-window_msg_right': message.fromMe, 'chat-window_msg_left': !message.fromMe }">
                      <!-- <div class="chat-window__msg-header">
                          {{message.myself ? myself.name : getParticipantsName(message.participantId)}}
                      </div> -->
                      <span class="chat-window_msg-body">
                        {{ message.message.text }}
                      </span>
                      <div class="chat-window_msg-footer">
                        <!-- <span class="chat-window_msg-footer-read">
                            read
                        </span> -->
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
                  <div class="files-wrapper">
                    <div class="files-item" v-for="(file, index) in files" :key="index">
                      <div class="files-delete-btn">
                        <v-btn icon color="#fff" @click="deleteFile(index)">
                          <v-icon>mdi-close</v-icon>
                        </v-btn>
                      </div>
                      <img v-if="file.type == 'image'" :src="file.path" class="files-item__image" alt="">
                    </div>
                  </div>
                  <v-form @submit.prevent="sendMessage" class="chat-form">
                    <input v-model="inputModel" class="chat-window__input" placeholder="Message..." type="text">
                    <input style="display: none" type="file" ref="file" @change="fileAttachHandler">
                    <v-btn icon @click="$refs.file.click()">
                      <v-icon>mdi-attachment</v-icon>
                    </v-btn>
                    <v-btn icon @click="sendMessage">
                      <v-icon>mdi-send</v-icon>
                    </v-btn>
                    <!-- <v-text-field
                    solo
                    dense
                    @click="sendMessage"
                    :append-icon="'mdi-send'"
                    label="Write text"
                    >
                    </v-text-field> -->
                  </v-form>
                </div>
              </div>
            </div>
            <div v-else style="width:100%; height: 100%; display: flex; justify-content: center; align-items: center">
              <span class="grey--text" style="font-size: 25px">Please choose chat</span>
            </div>
          </div>
        </v-col>
      </div>
    </v-card>
  </v-row>
</template>

<script>
  const axios = require('axios');
  const moment = require('moment');

  export default {
    data: () => ({
      loaded: false,
      chatLoading: false,
      chatsLoading: false,
      currentChatLoading: false,
      chats: [],
      inputModel: '',
      chatSocket: '',
      allowedFileExtensions: ['jpg', 'jpeg', 'png', 'xlsx', 'docx', 'txt'],
      extensionsStructure: [{
          exts: ['jpg', 'jpeg', 'png'],
          type: 'image'
        },
        {
          exts: ['xlsx'],
          type: 'sheet'
        },
        {
          exts: ['docx'],
          type: 'document'
        },
        {
          exts: ['txt'],
          type: 'textFile'
        }
      ],
      files: [],
      current_chat_id: '',
      member: {},
      currentChat: [],
    }),
    watch: {
      chats: function (val, oldVal) {
        const $container = document.querySelector('.chat-window__body')
        if ($container) {
          $container.scrollTop = $container.scrollHeight
        }
      }
    },
    methods: {
      checkExtensionStructure(extension) {
        let result = ''
        this.extensionsStructure.forEach(function (val, index) {
          if (val.exts.includes(extension)) {
            result = val
          }
        })
        return result
      },
      deleteFile(index) {
        let files = this.files
        this.files = [...files.slice(0, index), ...files.slice(index + 1)]
      },
      getType(file_name) {
        let ext = file_name.split('.').pop().toLowerCase()
        if (ext == 'jpg' || ext == 'jpeg' || ext == 'png') {
          return 'image'
        }
      },
      fileAttachHandler(event) {

        if (event.target.files[0] === undefined) return false
        if (this.allowedFileExtensions.includes(event.target.files[0].name.split('.').pop().toLowerCase()) === false)
          return false

        let selectedFile = event.target.files[0]
        let files = this.files

        let formData = new FormData()

        formData.append('path', selectedFile)
        formData.append('name', selectedFile.name)

        const self = this;
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        console.log(selectedFile)
        axios({
            method: 'put',
            url: self.$store.state.backendUrl + '/backend/api/upload/',
            data: formData,
            headers: {
              'Authorization': 'JWT ' + accessToken,
              'Content-Type': 'multipart/form-data'
            },
          })
          .then(function (response) {
            self.files.push({
              id: response.data.id,
              type: self.getType(response.data.name),
              path: response.data.path,
              name: response.data.name
            })
          })
          .catch(function (error) {
            console.log(error);
          });
      },
      sendMessage() {
        const self = this
        let accessToken = this.$store.getters.getToken

        this.loading = true

        let files = []

        if (this.files.length > 0) {
          this.files.forEach(function (val, index) {
            files.push(val.id)
          })
        }

        this.chatSocket.send(JSON.stringify({
          'content': self.inputModel,
          'media': files
        }));

        self.inputModel = ''
        self.files = []

        const $container = document.querySelector('.chat-window__body');
        $container.scrollTop = $container.scrollHeight;


        // axios({
        //     method: 'post',
        //     url: self.$store.state.backendUrl + '/backend/api/chat-message/',
        //     data: {
        //         content: self.message,
        //         user_to: self.member.id
        //     },
        //     headers: {'Authorization': 'JWT ' + accessToken},
        // })
        // .then(function (response) {
        //     console.log(response);

        //     self.chat.push({
        //         fromMe: true,
        //         message: {
        //             author: self.$store.getters.getCurrentUser.email,
        //             text: self.message,
        //             time: self.repairDate(new Date().toISOString())
        //         }
        //     })

        //     self.loading = false
        //     self.message = ''
        // })
        // .catch(function (error) {
        //     console.log(error);
        // });
      },
      prepareChat(dirtyData) {
        const self = this

        if (dirtyData.user_member !== 'self') {
          this.member = dirtyData.user_member
        } else {
          this.member = dirtyData.user_initiator
        }

        dirtyData.chat_group_messages.forEach(item => {
          self.currentChat.push({
            chat_id: dirtyData.id,
            fromMe: item.user_from.id !== self.member.id,
            message: {
              author: item.user_from.email,
              text: item.content,
              time: moment(item.modifiedDateTime).format('h:mm')
              // time: self.$globalFunctions.repairDatetime(item.modifiedDateTime)
            }
          })
        });
      },
      filterChatGroups(dirtyData) {

        console.log(dirtyData);
        const self = this

        const cleanData = dirtyData.map(item => {
          let output = {}

          output.id = item.id
          output.isNew = item.chat_group_messages.status == "Send"
          output.lastMessage = {
            content: item.chat_group_messages.content,
            by: item.chat_group_messages.content,
            modifiedDateTime: moment(item.chat_group_messages.modifiedDateTime).format('h:mm')
          }
          output.member = item.user_initiator !== 'self' ? item.user_initiator : item.user_member
          output.member.avatar = item.avatar != null ? item.avatar : self.$store.getters.getDefaultAvatar

          self.chatsLoading = false

          return output
        })

        return cleanData
      },
      openChat(chat) {
        // this.$router.push('/chat/' + id + '/')
        const self = this

        const accessToken = this.$store.getters.getToken

        this.currentChat = []

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/users/current/chat-groups/' + chat.id + '/',
            params: {
              // page: self.$router.history.current.path
              page: 1
            },
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            response.data.chat_group_messages.reverse()
            self.prepareChat(response.data)
            self.current_chat_id = chat.id
            self.connect(chat.id)
          })
          .catch(function (error) {
            console.log(error);
          });
      },
      connect(chat_id) {
        const self = this
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        if (this.chatSocket != '') {
          this.disconnect()
        }

        this.chatSocket = new WebSocket('wss://altekloads.com/ws/chat-groups/' + chat_id + '/?access_token=' +
          accessToken)

        this.chatSocket.onopen = () => {

          const $container = document.querySelector('.chat-window__body')
          $container.scrollTop = $container.scrollHeight

          this.chatSocket.onmessage = ({
            data
          }) => {

            const message = JSON.parse(data)

            this.currentChat.push({
              fromMe: message.user_from.id != this.member.id,
              message: {
                author: message.user_from.email,
                files: message.media,
                text: message.content,
                time: moment(message.modifiedDateTime).format('h:mm')
              }
            })

            this.loading = false
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
        this.chatSocket.close()
        this.chatSocket = ''
      }
    },
    created() {
      const self = this

      self.chatsLoading = true

      this.$globalEvents.$on('refreshTokens', () => {
        const accessToken = this.$store.getters.getToken

        if (!accessToken) {
          return
        }

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/users/current/chat-groups/',
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            console.log(response);
            self.chats = self.filterChatGroups(response.data)
          })
          .catch(function (error) {
            console.log(error);
          });

        this.loaded = true
      })

    },
    mounted() {
      this.$store.commit('updateToolbarData', {
        title: 'Chat',
      })

      if (!this.loaded) {
        this.$globalEvents.$emit('refreshTokens')
      }
    },
    beforeDestroy() {
      this.$store.commit('updateToolbarData', {})
      this.$globalEvents.$off('refreshTokens')
    },
  }

</script>

<style lang="css" scoped>
  .pd-0 {
    padding: 0 !important;
  }

  .mr-0 {
    margin: 0 !important;
  }

  .card-wrapper {
    border: 1px solid #E0E0E0
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
    border-left: 1px solid #E0E0E0;
  }

  .chat-window__header {
    border-bottom: 1px solid silver;
    display: flex;
    color: #fff;
    justify-content: space-between;
    align-items: center;
  }

  .chat-window__body {
    height: 82.4%;
    background-color: #E6DEDB;
    overflow-y: scroll;
  }

  .chat-window_msg_right {
    float: right;
    padding: 10px;
    min-width: 100px;
    background-color: #2196F3;
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
    height: 10%;
    padding: 10px;
    border-top: 1px solid #E0E0E0;
    display: flex;
    flex-direction: column;
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
    margin-bottom: 10px;
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

  .chat-my-profile {
    border-bottom: 1px solid #E0E0E0;
  }

  .chat-form {
    display: flex;
    width: 100%;
  }

</style>
