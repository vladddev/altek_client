<template>
    <v-card loading="loading">
        <v-row justify="center" class="chat-container" v-if="letterData.body">
            <v-container class="mb-12">
                <v-col v-if="letterData.body">
                    <p class="font-weight-regular">From: {{letterData.from}}</p>
                    <p class="font-weight-regular">To: {{letterData.to}}</p>
                    <p class="font-weight-regular">Date: {{letterData.date}}</p>
                    <p class="font-weight-medium">Subject: {{letterData.subject}}</p>
                </v-col>
                <v-row justify="center">
                    <div v-html="letterData.body"></div>
                </v-row>
            </v-container>
        </v-row>
        <v-banner v-else>
           <div class="text--secondary">
               Data is parsing...
           </div>
        </v-banner>
    </v-card>
</template>

<script>
import chatMessage from '@/components/chat/chat-message'
const axios = require('axios')

export default {
    data() {
        return {
            loading: false,
            letterData: {
                from: '',
                to: '',
                body: '',
                date: '',
                subject: ''
            }
        }
    },
    methods: {
    },
    created() {
        const self = this
        const accessToken = this.$store.getters.getToken

        this.loading = true

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/mail-client/get-mail/',
            params: {
                num: self.$route.params.id
            },
            headers: {'Authorization': 'JWT ' + accessToken},
        })
        .then(function (response) {

            self.letterData = {
                from: response.data.from,
                to: response.data.to,
                body: response.data.body,
                date: response.data.date,
                subject: response.data.subject
            }

            self.loading = false

        })
        .catch(function (error) {
            console.log(error);
        });
    },
    beforeDestroy() {

    },
    components: {

    },
}

</script>
