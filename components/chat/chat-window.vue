<template>
  <div v-if="is_open"
       ref="chatWindow"
       class="chat-window"
       :class="isFixed ? 'chat-window-fixed' : ''"
  >
    <div
      v-show="false"
      class="v-menu__content--active"
    />
    <v-card style="height: 100%">
      <div class="chat-window__header">
        <span>{{ chatData.chatTitle }}</span>
        <v-btn
          icon
          color="#fff"
          @click="is_open = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <div class="chat-window__body">
        <div class="chat-window-scroll-view">
          <div
            class="chat-window_chat-item"
            v-for="(message, index) in chatData.messages"
            :key="index">
            <div
              v-bind:class="{ 'chat-window_msg_right': message.user_from.id == $store.state.currentUser.id, 'chat-window_msg_left': message.user_from.id != $store.state.currentUser.id }"
            >
              <div class="chat-window__msg-header">
                {{ message.user_from == 'self' ? myself.first_name : getParticipantsName(message.user_from.id) }}
              </div>
              <div class="chat-window_msg-body">
                <template v-if="message.files">
                  <div
                    v-if="message.files.length > 0"
                    class="message-files">
                    <template v-for="(file, index) in message.files">
                      <div
                        :key="index"
                        class="message-files__item"
                        v-if="checkExtensionStructure(file.name.split('.').pop().toLowerCase()).type == 'image'"
                      >
                        <img :src="$store.state.backendUrl + '' + file.path" alt="">
                      </div>
                    </template>
                  </div>
                </template>
                <span> {{ message.content }}</span>
              </div>
              <div class="chat-window_msg-footer">
                <!-- <span class="chat-window_msg-footer-read">
                    read
                </span> -->
                <span class="chat-window_msg-footer-time">

                                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="chat-window__footer">
        <v-form class="window-chat-input" @submit.prevent="sendMessage">
          <input
            v-model="input"
            class="chat-window__input"
            placeholder="Message..."
            type="text">
          <input style="display: none" type="file" ref="file" @change="fileAttachHandler">
          <v-btn
            icon
            @click="$refs.file.click()"
          >
            <v-icon>mdi-attachment</v-icon>
          </v-btn>
          <v-btn
            icon
            @click="sendMessage"
          >
            <v-icon>mdi-send</v-icon>
          </v-btn>
        </v-form>
      </div>
    </v-card>
  </div>
</template>

<script>

const axios = require('axios');
const moment = require('moment');

export default {
  name: 'chat-window',
  props: ['isFixed'],
  data() {
    return {
      is_open: false,
      chatData: {
        id: 0,
        title: '',
        participants: [],
        messages: []
      },
      allowedFileExtensions: ['jpg', 'jpeg', 'png', 'xlsx', 'docx', 'txt'],
      extensionsStructure: [
        {
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
      chatSocket: '',
      myself: {},
      input: '',
    }
  },
  watch: {},
  created() {
    this.setGlobalEvents()
    const self = this
    this.$globalEvents.$on('renewCurrentUser', () => {
      self.myself = self.$store.getters.getCurrentUser
    })
  },
  beforeDestroy() {
    this.$globalEvents.$off('renewCurrentUser')
    this.disconnect()
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
      if (this.allowedFileExtensions.includes(event.target.files[0].name.split('.').pop().toLowerCase()) === false) return false

      let selectedFile = event.target.files[0]
      let files = this.files

      let formData = new FormData()

      formData.append('path', selectedFile)
      formData.append('name', selectedFile.name)

      const self = this;
      const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')

      axios({
        method: 'put',
        url: self.$store.state.backendUrl + '/backend/api/upload/',
        data: formData,
        headers: {'Authorization': 'JWT ' + accessToken, 'Content-Type': 'multipart/form-data'},
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
    formattedMessages(messages) {
      return messages
    },
    connect() {
      const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')

      if (this.chatSocket != '') {
        this.disconnect()
      }

      this.chatSocket = new WebSocket('wss://altekloads.com/ws/chat/' + this.chatData.id + '/?access_token=' + accessToken)

      this.chatSocket.onopen = () => {

        const $container = document.querySelector('.chat-window__body')
        $container.scrollTop = $container.scrollHeight

        this.chatSocket.onmessage = ({data}) => {
          console.log(this.chatData.messages);
          const message = JSON.parse(data)
          let messages = this.chatData.messages

          this.chatData.messages.push({
            author: message.user_from,
            files: message.media,
            content: message.content,
            time: moment(message.modifiedDateTime).format('h:mm'),
            user_from: message.user_from,
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
    sendMessage: function () {
      const self = this
      const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')

      this.loading = true

      let files = []

      if (this.files.length > 0) {
        this.files.forEach(function (val, index) {
          files.push(val.id)
        })
      }

      this.chatSocket.send(JSON.stringify({
        'content': self.input,
        'media': files
      }));

      self.input = ''
      self.inputModel = ''
      self.files = []

      const $container = document.querySelector('.chat-window__body');
      $container.scrollTop = $container.scrollHeight;
    },
    getParticipantsName: function (id) {
      var result = ''
      this.chatData.participants.forEach(function (val) {
        if (val.id == id) {
          result = val.name
        }
      })
      return result
    },
    setGlobalEvents() {
      this.$globalEvents.$on('setWindowChatData', (is_open, chatData) => {
        console.log(chatData)
        this.is_open = is_open
        this.chatData = chatData
        this.connect()
      })
    },
    disconnect() {
      this.chatSocket.close()
      this.chatSocket = ''
    }
  }
}
</script>

<style lang="css" scoped>
.chat-window-fixed {
  width: 310px;
  height: 330px;
  position: fixed;
  bottom: 10px;
  right: 12px;
}

.chat-window {
  height: 430px;
  border-radius: 10px;
  z-index: 999;
}

.chat-window__header {
  height: 10%;
  padding: 10px;
  border-bottom: 1px solid silver;
  display: flex;
  color: #fff;
  justify-content: space-between;
  background-color: #58A7EF;
  align-items: center;
}

.chat-window__body {
  height: 75%;
  background-color: #F7F7F7;
  overflow-y: scroll;
}

.chat-window_msg_right {
  float: right;
  padding: 10px;
  background-color: #58A7EF;
  color: #fff;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
}

.chat-window_msg_left {
  float: left;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
}

.chat-window__footer {
  height: 15%;
  padding: 10px;
  border-top: 1px solid silver;
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

.chat-window_msg-body img {
  width: 100%;
}

.chat-window_msg-footer {
  font-size: 10px;
  text-align: right;
  display: flex;
  justify-content: space-between;
}

.chat-window-scroll-view {
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.window-chat-input {
  width: 100%;
  display: flex;
}
</style>
