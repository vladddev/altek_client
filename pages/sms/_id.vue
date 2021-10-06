<template>
    <v-row justify="center" class="chat-container">
      <p>test 123</p>
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
            interval: null,
            member: {},
            chat: []
        }
    },
    methods: {
        prepareChat(dirtyData) {
            const self = this
            this.member.id = dirtyData.id
            this.member.email = dirtyData.email
            this.member.phone_number = dirtyData.phone_number

            let chat = [];

            dirtyData.messages.forEach(item => {
                chat.push({
                    fromMe: item.user_from != self.member.id,
                    message: {
                        author: dirtyData.email,
                        text: item.content,
                        time: self.$globalFunctions.repairDatetime(item.modifiedDateTime)
                    }
                })
            });

            self.chat = chat;
        },
        sendMessage() {
            const self = this
            let accessToken = this.$store.getters.getToken

            this.loading = true

            const $container = document.querySelector('html');
            $container.scrollTop = $container.scrollHeight;

            axios({
                method: 'post',
                url: self.$store.state.backendUrl + '/backend/api/sms/new/',
                data: {
                    content: self.message,
                    toNumber: self.member.phone_number,
                    user_to: self.member.id,
                    user_from: self.$store.getters.getCurrentUser.id
                },
                headers: {'Authorization': 'JWT ' + accessToken},
            })
            .then(function (response) {
                console.log(response);

                self.chat.push({
                    fromMe: true,
                    message: {
                        author: self.$store.getters.getCurrentUser.email,
                        text: self.message,
                        time: self.$globalFunctions.repairDatetime(new Date().toISOString())
                    }
                })

                const $container = document.querySelector('html');
                $container.scrollTop = $container.scrollHeight;

                self.loading = false
                self.message = ''
            })
            .catch(function (error) {
                console.log(error);
            });

        },
    },
    created() {
        const self = this

        const accessToken = this.$store.getters.getToken

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/driver-chat/' + self.$route.params.id +'/',
            params: {
                page: self.$router.history.current.path
            },
            headers: {'Authorization': 'JWT ' + accessToken},
        })
        .then(function (response) {
            self.prepareChat(response.data)

            const $container = document.querySelector('html');
            $container.scrollTop = $container.scrollHeight;

            self.interval = setInterval(() => {
                axios({
                    method: 'get',
                    url: self.$store.state.backendUrl + '/backend/api/driver-chat/' + self.$route.params.id +'/',
                    params: {
                        page: self.$router.history.current.path
                    },
                    headers: {'Authorization': 'JWT ' + accessToken},
                })
                .then(function (response) {
                    self.prepareChat(response.data)
                })
                .catch(function (error) {
                    console.log(error);
                });
            }, 15000);

        })
        .catch(function (error) {
            console.log(error);
        });
    },
    beforeDestroy() {
        clearInterval(this.interval)
        this.interval = null
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
