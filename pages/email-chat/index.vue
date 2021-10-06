<template>
  <v-row>
    <v-card class="mx-5" width="100%" :disabled="loading" :loading="loading">
      <v-list three-line v-if="chats.length > 0">
        <template v-for="(chat, index) in chats">
          <v-list-item :key="chat.num" @click="openLetter(chat.num)">
            <v-list-item-content>
              <v-list-item-title v-text="chat.from"></v-list-item-title>
              <v-list-item-subtitle>
                <span class="text--primary">{{ chat.date }}</span> - {{ chat.subject }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon @click="openChat">
                <v-icon color="blue">mdi-message-text-outline</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-divider v-if="index + 1 < chats.length" :key="index"></v-divider>
        </template>
      </v-list>
      <v-banner v-else>
        Data is parsing...
      </v-banner>
      <v-pagination v-model="page" :length="10" :total-visible="7"></v-pagination>
    </v-card>
  </v-row>
</template>

<script>
  const axios = require('axios');

  export default {
    data: () => ({
      loading: false,
      offset: 0,
      selected: [],
      chats: [],
      page: 1,
    }),
    mounted() {
      this.$store.commit('updateToolbarData', {
        title: 'Email chat',
      })
    },
    watch: {
      page: function (newvAL, oldVal) {
        this.offset = (this.page * 20) - 20
        this.getLetters()
      }
    },
    created() {
      this.getLetters()
    },
    methods: {
      openChat(item) {
        console.log(item);
        // this.$router.push('/email-chat/' + item.id + '/')
      },
      openLetter(id) {
        this.$router.push('/email-chat/letter/' + id + '/')
      },
      getLetters() {

        const self = this
        const accessToken = this.$store.getters.getToken
        this.loading = true

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/mail-client/personal/?mail_from=' + self.offset +
              '&mail_to=' + (parseInt(self.offset) + 20),
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            self.chats = response.data

            console.log(self.chats);

            self.loading = false
          })
          .catch(function (error) {
            console.log(error);
          });

        this.loaded = true
      }
    },
    beforeDestroy() {
      this.$store.commit('updateToolbarData', {})
      this.$globalEvents.$off('refreshTokens')
    },
  }

</script>
