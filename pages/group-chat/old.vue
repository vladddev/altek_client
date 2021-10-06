<template>
    <v-row>
        <v-card
            class="mx-5"
            width="100%"
        >
            <v-list three-line v-if="chats.length > 0">
                <template v-for="(chat, index) in chats">
                    <v-list-item
                        :key="chat.id"
                        @click="openChat(chat.id)"
                    >
                        <!-- <v-list-item-avatar>
                            <v-img :src="chat.member.avatar"></v-img>
                        </v-list-item-avatar> -->

                        <v-list-item-content>
                            <!-- <v-list-item-title v-text="chat.member.email"></v-list-item-title> -->
                            <v-list-item-subtitle>
                                <span class="text--primary">{{ chat.lastMessage.modifiedDateTime }}</span> - {{ chat.lastMessage.content }}
                            </v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>

                    <v-divider
                        v-if="index + 1 < chats.length"
                        :key="index"
                    ></v-divider>
                </template>
            </v-list>
            <v-banner v-else>
                No active chats
            </v-banner>
        </v-card>
    </v-row>
</template>

<script>
const axios = require('axios');

export default {
    data: () => ({
        loaded: false,
        selected: [],
        chats: []
    }),
    methods: {
        filterChatGroups(dirtyData) {
            const self = this

            const cleanData = dirtyData.map(item => {
                let output = {}

                output.id = item.id
                output.isNew = item.last_message.status == "Send"
                output.lastMessage = {
                    content: item.last_message.content,
                    modifiedDateTime: self.$globalFunctions.repairDatetime(item.modifiedDateTime)
                }
                output.member = item.user_from !== 'self' ? item.user_from : 'self'
                // output.member.avatar = item.avatar != null ? item.avatar : self.$store.getters.getDefaultAvatar

                return output
            })

            return cleanData
        },
        openChat(id) {
            this.$router.push('/group-chat/' + id + '/')
        }
    },
    created() {
        const self = this

        this.$globalEvents.$on('refreshTokens', () => {
            const accessToken = this.$store.getters.getToken

            if (!accessToken) {
                return
            }

            axios({
                method: 'get',
                url: self.$store.state.backendUrl + '/backend/api/users/current/chats/',
                headers: {'Authorization': 'JWT ' + accessToken},
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
            title: 'Group chat',
        })
        if(!this.loaded) {
            this.$globalEvents.$emit('refreshTokens')
        }
    },
    beforeDestroy() {
        this.$store.commit('updateToolbarData', {})
        this.$globalEvents.$off('refreshTokens')
    },
}
</script>
