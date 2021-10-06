<template>
    <v-card>
      <v-col cols="12" class="email-chat-wrapper">
        <div id="emalChatScrollView" class="email-chat-content">
          <v-row v-if="this.loading" justify="center">
            <v-progress-circular
              :size="70"
              :width="7"
              color="blue"
              indeterminate
            ></v-progress-circular>
          </v-row>
          <v-col v-if="chatData.data.length < 1" cols="12" style="height: 100%">
            <v-row justify="center" class="empty-chat-content">
              <div class="display-1 grey--text">Chat is empty</div>
            </v-row>
          </v-col>
          <v-col v-else v-for="(val, index) in this.chatData.data" :key="index" class="chat-item">
            <div :class="val.from == 'self' ? 'chat-item-right' : 'chat-item-left'" class="chat-item-content">
              <div class="chat-item-header grey--text">
                <v-icon v-if="val.from != 'self'" color="green" v-text="'mdi-arrow-right-circle'"></v-icon>
                <v-icon v-if="val.from == 'self'" color="blue" v-text="'mdi-arrow-left-circle'"></v-icon>
                {{val.from == 'self' ? 'you' : val.from}}
              </div>
              <div class="chat-item-body">
                <div
                  v-html="val.body"
                ></div>
              </div>
              <div class="chat-item-footer grey--text">
                {{val.date | formatDate}}
              </div>
            </div>
          </v-col>
          <v-row class="email-chat-input">
            <v-col>
              <v-row class="px-6">
                <v-row class="">
                  <div class="chat-item-header">
                    Recipient:
                  </div>
                  <div class="chat-item-header grey--text ml-2">
                    <v-text-field
                      v-model="to"
                      solo
                      disabled
                      clearable></v-text-field>
                  </div>
                </v-row>
                <v-row class="mb-3">
                  <div class="chat-item-header">
                    Subject:
                  </div>
                  <div class="chat-item-header grey--text ml-2">
                    <v-text-field
                      v-model="subject"
                      solo
                      disabled
                      clearable></v-text-field>
                  </div>
                </v-row>
              </v-row>
              <v-row class="px-3">
                <div class="chat-item-header">
                  Adv recipients:
                </div>
                <div class="chat-item-header grey--text ml-2">
                  <v-combobox
                    v-model="advRecipientsModel"
                    :items="advRecipients"
                    solo
                    item-text="adress"
                    item-value="value"
                    label="Recipients"
                    multiple
                    chips
                  ></v-combobox>
                </div>
              </v-row>
              <form v-on:submit.prevent="sendMessage">
                <input
                  ref=chatImageUpload
                  style="display: none"
                  type="file"
                  @change="onFileChange">
                <v-text-field
                  hide-details="auto"
                  solo
                  :append-outer-icon="'mdi-send'"
                  :append-icon="'mdi-attachment'"
                  @click:append-outer="sendMessage"
                  @click:append="attachFile"
                  v-model="msgFormModel.text"
                  label="Message"
                >
                </v-text-field>
              </form>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-card>
</template>

<script>

import loadMap from '@/components/maps/load-map'

const axios = require('axios')
const moment = require('moment');

export default {
    props: ['from', 'to', 'subject', 'advRecipients'],
    data() {
        return {
            loading: false,
            isChatEmpty: false,
            msgFormModel: {
                text: ''
            },
            advRecipientsModel: [],
            offset: 0,
            page: 1,
            chatData: {
                data: [
                    // {from: 'postedloads@sylectus.com', subject: "- VAN from Chicago, IL to Salt Lake City, UT - 'Expedited Load - Typical Premium Freight Hot Shot Load' : 1550 miles, 500 lbs. - Posted by RP EXPEDITING LLC (grr@rpexpediting.com) - Alliance Posted Load", date: '12:04:34'},
                    // {from: 'postedloads@sylectus.com', subject: "- VAN from Chicago, IL to Salt Lake City, UT - 'Expedited Load - Typical Premium Freight Hot Shot Load' : 1550 miles, 500 lbs. - Posted by RP EXPEDITING LLC (grr@rpexpediting.com) - Alliance Posted Load", date: '12:04:34'},
                    // {from: 'self', subject: "- VAN from Chicago, IL to Salt Lake City, UT - 'Expedited Load - Typical Premium Freight Hot Shot Load' : 1550 miles, 500 lbs. - Posted by RP EXPEDITING LLC (grr@rpexpediting.com) - Alliance Posted Load", date: '12:04:34'},
                    // {from: 'postedloads@sylectus.com',  subject: "- VAN from Chicago, IL to Salt Lake City, UT - 'Expedited Load - Typical Premium Freight Hot Shot Load' : 1550 miles, 500 lbs. - Posted by RP EXPEDITING LLC (grr@rpexpediting.com) - Alliance Posted Load", date: '12:04:34'},
                    // {from: 'postedloads@sylectus.com',  subject: "- VAN from Chicago, IL to Salt Lake City, UT - 'Expedited Load - Typical Premium Freight Hot Shot Load' : 1550 miles, 500 lbs. - Posted by RP EXPEDITING LLC (grr@rpexpediting.com) - Alliance Posted Load", date: '12:04:34'},
                    // {from: 'postedloads@sylectus.com',  subject: "- VAN from Chicago, IL to Salt Lake City, UT - 'Expedited Load - Typical Premium Freight Hot Shot Load' : 1550 miles, 500 lbs. - Posted by RP EXPEDITING LLC (grr@rpexpediting.com) - Alliance Posted Load", date: '12:04:34'},
                    // {from: 'self', subject: "- VAN from Chicago, IL to Salt Lake City, UT - 'Expedited Load - Typical Premium Freight Hot Shot Load' : 1550 miles, 500 lbs. - Posted by RP EXPEDITING LLC (grr@rpexpediting.com) - Alliance Posted Load", date: '12:04:34'},
                ]
            },
        }
    },
    filters: {
        formatDate(date) {
            var date = moment(date);
            return date.format('D.M.Y H:mm');
        }
    },
    watch: {
      'subject': function(val) {
          this.loading = true

            const self = this
            const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')

            axios({
                method: 'get',
                url: self.$store.state.backendUrl + '/backend/api/mail-client/personal/?mail_from='+self.offset+'&mail_to=' + (parseInt(self.offset) + 20) + '&search_subj=' + val + '&type=full',
                headers: {'Authorization': 'JWT ' + accessToken},
            })
            .then(function (response) {

                if (response.data.length > 0) {
                    self.chatData.data = response.data
                }else {
                    self.isChatEmpty = true
                }

                self.loading = false
            })
            .then(function() {
                self.scrollToEnd()
            })
            .catch(function (error) {
                console.log(error);
        });
      }
    },
    created() {

    },
    methods: {
        onFileChange(target) {

            let file = target.target.files[0]

            console.log(file);
        },
        attachFile() {
            let uploadBtn = this.$refs.chatImageUpload

            uploadBtn.click()
        },
        scrollToEnd() {
            const $container = document.querySelector('#emalChatScrollView')
            $container.scrollTop = $container.scrollHeight
        },
        sendMessage() {

            if (this.msgFormModel.text == '') {
                alert("Please enter your message")
                return
            }

            const self = this
            const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')

            let adresses = [self.to]

            if(this.advRecipientsModel.length > 0) {
                this.advRecipientsModel.forEach(function(value, index) {
                    adresses.push(value.adress)
                })
            }

            axios({
                method: 'post',
                url: self.$store.state.backendUrl + '/backend/api/mail-client/personal',
                data: {
                    adress: adresses,
                    mail_subj: self.subject,
                    content: self.msgFormModel.text
                },
                headers: {'Authorization': 'JWT ' + accessToken},
            })
            .then(function (response) {
                if (response.data.status == "ok") {

                    var d = new Date();
                    var n = d.toString();

                    self.chatData.data.push(
                        {from: 'self', subject: self.subject, date: moment(), body: self.msgFormModel.text}
                    )

                    self.msgFormModel = {
                        text: ''
                    }

                    self.scrollToEnd()
                    }
            })
            .then(function() {
                self.scrollToEnd()
            })
            .catch(function (error) {
                console.log(error);
            });
        }
    }
}

</script>

<style lang="css" scoped>
    .email-chat-wrapper {
        position: relative;
        background-color: #F7F7F7;
    }
    .email-chat-content {
        overflow-y: scroll;
        height: 460px;
        margin-bottom: 240px;
    }
    .email-chat-input {
        position: absolute;
        bottom: 0;
        width: 100%;
        background-color: #fff;
        border-top: 1px solid #e8e8e8;
    }
    .chat-item {
        display: inline-block;
        padding: 0!important;
        margin-bottom: 10px;
    }
    .chat-item-content {
        background-color: #fff;
        padding: 10px;
        border: 1px solid #e8e8e8;
        border-radius: 5px;
    }
    .chat-item-left {
        float: left;
        margin-right: 50px;
    }
    .chat-item-right {
        float: right;
        margin-left: 50px;
    }
    .chat-item-right .chat-item-body{
        text-align: left;
    }
    .chat-item-right .chat-item-footer{
        text-align: right;
    }
    .empty-chat-content {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-self: center;
        align-items: center;
    }
</style>
