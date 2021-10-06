<template>
  <v-card>
    <div style="height: 600px">
      <div class="chat-window__header">
        <v-list-item style="max-width: 100%">
          <v-list-item-avatar>
            <v-img src="/images/group-chat-avatar.svg"></v-img>
          </v-list-item-avatar>

            <v-list-item-title>

                  <template v-for="(member, index) in members">
                    
                      <template v-if="index==0">
                        #{{ member.id }}
                      </template>

                      <template v-else>
                        , #{{ member.id }}
                      </template>

                  </template>

            </v-list-item-title>
        </v-list-item>
      </div>
      <div class="chat-window__body scroll-view scroll-overlay">
        <div class="chat-window-scroll-view h-100">
          <div class="chat-window_chat-item" v-for="(message, index) in currentChat" :key="index">
            <v-card elevation="1" class="chat-window_msg"
              v-bind:class="{ 'chat-window_msg_right': message.fromMe, 'chat-window_msg_left': !message.fromMe }">
              <div class="chat-window__msg-header" v-if="!message.fromMe">
                {{ message.message.author.first_name }}
              </div>
              <div class="chat-window_msg-body">
                <div v-if="message.message.files.length > 0" class="message-files">
                  <template v-for="(file, index) in message.message.files">
                    <div :key="index" class="message-files__item" @click="openFile(file.path)"
                      v-if="checkExtensionStructure(file.name.split('.').pop().toLowerCase()).type == 'image'">
                      <img :src="$store.state.backendUrl + '' + file.path" alt="">
                    </div> 
                    <div :key="index" class="message-files__item" @click="openFile(file.path)"
                      v-else-if="checkExtensionStructure(file.name.split('.').pop().toLowerCase()).type == 'sheet'">
                      <img style="width: 50px" :src="$store.state.backendUrl + '/icons/sheets.svg'" alt="">
                    </div>
                    <div :key="index" class="message-files__item" @click="openFile(file.path)"
                      v-else-if="checkExtensionStructure(file.name.split('.').pop().toLowerCase()).type == 'docx'">
                      <img style="width: 50px" :src="$store.state.backendUrl + '/icons/docs.svg'" alt="">
                    </div>
                  </template>
                </div>
                <span class="message-text">{{ message.message.text }}</span>
              </div>
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
      <div class="chat-window__footer" v-if="showFooter">
        <div style="display: flex; flex-direction: column; width: 100%">
          <div class="files-wrapper">
            <div class="files-item" v-for="(file, index) in files" :key="index">
              <div class="files-delete-btn">
                <v-btn icon color="#fff" @click="deleteFile(index)">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
              <img v-if="file.type.type == 'image'" :src="file.path" class="files-item__image" alt="">
              <img v-if="file.type.type == 'sheet'" src="https://altekloads.com/icons/sheets.svg"
                class="files-item__sheet" alt="">
              <img v-if="file.type.type == 'docx'" src="https://altekloads.com/icons/docs.svg" class="files-item__sheet"
                alt="">
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
  </v-card>
</template>

<script>
  const axios = require('axios');
  const moment = require('moment');

  export default {
    name: 'group-chat',
    props: ['chatId', 'showFooter'],
    data() {
      return {
        loaded: false,
        chatLoading: false,
        chats: [],
        users: [],
        inputModel: '',
        mode: 'empty',
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
            type: 'docx'
            },
            {
            exts: ['txt'],
            type: 'textFile'
            }
        ],
        files: [],
        members: [],
        newMembers: [],
        currentChat: [],
      }
    },
    watch: {},
    created() {
      const self = this
      this.$globalEvents.$on('renewCurrentUser', () => {
        self.myself = self.$store.getters.getCurrentUser
      })
    },
    beforeDestroy() {
      this.$globalEvents.$off('renewCurrentUser')
    },
    mounted() {
      this.setGlobalEvents()
    },
    methods: {
      openFile(path) {
        window.open(this.$store.state.backendUrl + '' + path, '_blank')
      },
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
              type: self.checkExtensionStructure(response.data.name.split('.').pop().toLowerCase()),
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

        if (self.inputModel.trim().length == 0 && self.files.length == 0) {
          self.inputModel = ''
          return false
        }

        this.loading = true

        let files = []

        if (this.files.length > 0) {
          this.files.forEach(function (val, index) {
            files.push(val.id)
          })
        }

        let data = {
          action: 'group_chat_message',
          data: {
            chat_id: self.chatId,
            content: self.inputModel,
          }
        }

        if (files.length > 0) {
          data.data.media = files
        }

        self.$globalEvents.$emit('companySentEvent', data)

        self.inputModel = ''
        self.files = []

        const $container = document.querySelector('.chat-window__body');
        $container.scrollTop = $container.scrollHeight;
      },
      prepareChat(dirtyData) {

        const self = this

        this.members = this.newMembers = dirtyData.users

        console.log(this.members);

        dirtyData.chat_group_messages.forEach(item => {
          self.currentChat.push({
            fromMe: item.user_from.id === self.$store.state.currentUser.id,
            message: {
              author: item.user_from,
              files: item.files,
              text: item.content,
              time: moment(item.modifiedDateTime).format('h:mm')
              // time: self.$globalFunctions.repairDatetime(item.modifiedDateTime)
            }
          })
        });
      },
      filterChatGroups(dirtyData) {
        const self = this

        const cleanData = dirtyData.map(item => {
          let output = {}

          output.id = item.id
          output.users = item.users
          // output.isNew = item.chat_group_messages.status == "Send"
          output.lastMessage = {
            content: item.last_message.content,
            by: item.last_message.content !== '' ? item.last_message.user_from.id == self.$store.state.currentUser
              .id ? 'You: ' : item.last_message.user_from.first_name : '',
            modifiedDateTime: moment(item.last_message.modifiedDateTime).format('h:mm')
          }
          // output.member = item.user_initiator !== 'self' ? item.user_initiator : item.user_member
          // output.member.avatar = item.avatar != null ? item.avatar : self.$store.getters.getDefaultAvatar

          return output
        })

        return cleanData
      },
      closeChat() {
        this.mode = 'empty'
        this.files = []
        this.inputModel = ''
      },
      openChat() {
        const self = this

        this.files = []
        this.inputModel = ''

        const accessToken = this.$store.getters.getToken

        this.currentChat = []

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/users/current/chats/' + self.chatId + '/',
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
            if (self.currentChat.length > 0) {
              self.scrollChatToBottom()
            }
          })
          .catch(function (error) {
            console.log(error);
          });
      },
      scrollChatToBottom() {

        let interval = setInterval(myTimer, 100);

        function myTimer() {
          console.log(1)
          let container = document.querySelector('.chat-window__body.scroll-view')
          let items = document.querySelector('.chat-window__body.scroll-view .chat-window_chat-item')
          if (items !== null) {
            container.scrollTop = container.scrollHeight
            stopInterval()
          }
        }

        function stopInterval() {
          clearInterval(interval);
        }

      },
      receiveMessage(data) {
        const self = this
        
        this.currentChat.push({
          fromMe: data.user_from.id === self.$store.state.currentUser.id,
          message: {
            author: data.user_from,
            files: data.media === false ? [] : data.media,
            text: data.content,
            time: moment(data.modifiedDateTime).format('h:mm')
          }
        })
        self.scrollChatToBottom()
      },
      setGlobalEvents() {
        const self = this
        console.log("object");
        this.$globalEvents.$on('receive_message', (data) => {
          self.receiveMessage(data)
        })
      },
    },
    created() {
        this.openChat()
    },
  }

</script>

<style lang="css" scoped>
  .text-break {
    word-break: break-all;
  }
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
    height: 75px;
    border-bottom: 1px solid silver;
    display: flex;
    color: #fff;
    justify-content: space-between;
    align-items: center;
  }

  .chat-window__body {
    height: calc(100% - 150px);
    background-color: #E6DEDB;
    overflow-y: scroll;
  }

  .chat-window_msg {
    max-width: calc(100% - 150px);
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
    height: 75px;
    padding: 10px;
    border-top: 1px solid #E0E0E0;
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
    border-bottom: 1px solid #E0E0E0;
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

  .message-files {}

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
    align-items: center
  }

  .message-text {
    font-size: 15px;
    font-weight: 300;
  }

</style>
