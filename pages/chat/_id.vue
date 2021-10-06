<template>
    <v-row justify="center" class="chat-container">
        <v-container class="mb-12">
            <v-row no-gutters>
                <v-col v-for="(message, index) in chat" :key="index" cols="12">
                    <v-row>
                        <v-spacer v-if="message.fromMe"></v-spacer>
                        <v-col cols="5">
                            <chat-message :content="message.message"></chat-message>
                        </v-col>
                        <v-spacer v-if="!message.fromMe"></v-spacer>
                    </v-row>
                </v-col>
            </v-row>
        </v-container>
        <v-card class="pa-4 chat-footer elevation-5">
            <v-form @submit.prevent="sendMessage()">
                <v-row>
                    <v-col class="py-0">
                        <v-textarea
                            v-model="message"
                            dense
                            outlined
                            label="Write your message here"
                            auto-grow
                            rows="3"
                        ></v-textarea>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="py-0">
                        <v-btn
                            class="ma-0 ml-auto submit"
                            color="secondary"
                            type="submit"
                            :disabled="loading"
                            :loading="loading"
                        >
                            Send
                        </v-btn>
                    </v-col>
                </v-row>
            </v-form>
        </v-card>
    </v-row>
</template>

<script>
import chatMessage from '@/components/chat/chat-message'
const axios = require('axios')

export default {
    data() {
        return {
            message: '',
            loading: false,
            chatSocket: '',
            member: {},
            chat: []
        }
    },
    methods: {
        prepareChat(dirtyData) {
            const self = this

            if (dirtyData.user_member !== 'self') {
                this.member = dirtyData.user_member
            } else {
                this.member = dirtyData.user_initiator
            }

            dirtyData.chat_group_messages.forEach(item => {
                self.chat.push({
                    fromMe: item.user_from.id != self.member.id,
                    message: {
                        author: item.user_from.email,
                        text: item.content,
                        time: self.$globalFunctions.repairDatetime(item.modifiedDateTime)
                    }
                })
            });
        },
        sendMessage() {
            const self = this
            let accessToken = this.$store.getters.getToken

            this.loading = true

            this.chatSocket.send(JSON.stringify({
                'content': self.message
            }));

            self.message = ''

            const $container = document.querySelector('html');
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
        connect() {
            const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')

            this.chatSocket = new WebSocket( 'wss://altekloads.com/ws/chat-groups/' + this.$route.params.id + '/?access_token=' + accessToken)

            this.chatSocket.onopen = () => {

                const $container = document.querySelector('html')
                $container.scrollTop = $container.scrollHeight

                this.chatSocket.onmessage = ({data}) => {
                    console.log(data)

                    const message = JSON.parse(data)

                    this.chat.push({
                        fromMe: message.user_from.id != this.member.id,
                        message: {
                            author: message.user_from.email,
                            text: message.content,
                            time: this.$globalFunctions.repairDatetime(message.modifiedDateTime)
                        }
                    })

                    this.loading = false
                };
                this.chatSocket.onclose = function (err){
                    console.log(err)
                }
                this.chatSocket.onerror = function(error) {
                    console.log('WebSocket Error: ' + error);
                }
            };
        },
        disconnect() {
            this.chatSocket.close()
        },
    },
    created() {
        const self = this

        const accessToken = this.$store.getters.getToken

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/users/current/chat-groups/' + self.$route.params.id +'/',
            params: {
                // page: self.$router.history.current.path
                page: 1
            },
            headers: {'Authorization': 'JWT ' + accessToken},
        })
        .then(function (response) {
            response.data.chat_group_messages.reverse()
            self.prepareChat(response.data)
            self.connect()
        })
        .catch(function (error) {
            console.log(error);
        });
    },
    beforeDestroy() {
        this.disconnect()
    },
    components: {
        chatMessage,
    },
}

</script>

<style lang="sass" scope>
    .chat-container
        position: relative
        padding-bottom: 150px
    .chat-footer
        position: fixed
        width: 100%
        max-width: 500px
        bottom: 24px
        left: calc(50% - 250px)
    .submit
        display: block
</style>
