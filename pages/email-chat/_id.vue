<template>
    <v-card loading="loading">
        <email-chat
        :data='chatData.data'
        :from='chatData.from'
        :to='chatData.to'
        ></email-chat>
    </v-card>
</template>

<script>
import chatMessage from '@/components/chat/chat-message'
const axios = require('axios')

export default {
    data() {
        return {
            loading: false,
            chatData: {}
        }
    },
    methods: {
    },
    created() {
        const self = this
        const accessToken = this.$store.getters.getToken

        this.loading = true


    },
    beforeDestroy() {
        
    },
    components: {
        
    },
}

</script>