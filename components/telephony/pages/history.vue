<template>
  <div class="cellphone-page-body">
    <div class="cellphone-container">


      <div class="cellphone-form">
        <div class="cellphone-switcher">
          <div class="cellphone-switcher__item active">
            <span>All</span>
          </div>
          <div class="cellphone-switcher__item">
            <span>Missed</span>
          </div>
        </div>
        <div class="c-form-group mb-3 mt-5">
          <div class="c-form-control">
            <div class="d-flex align-center">
              <div class="cellphone-input_adv">
                <img class="cellphone-input__button_left" src="/icons/phone-search.svg"/>
                <input style="padding-left: 35px" type="text" class="c-form-control" placeholder="Search"/>
              </div>
              <div style="margin-left: 15px; cursor: pointer;" class="d-flex" @click="changeMode">
                <img src="/icons/phone-edit.svg" alt="">
              </div>
            </div>
          </div>
        </div>
        <div class="cellphone-history-all-actions call-history-edit-menu-enter-done" :class="{'active':editMode}">
          <div class="cellphone-history-all-actions__item"
               :class="selectedHistory.length > 0 ? 'active' : ''"
               @click="selectAll">
            <span>Select all</span>
            <img v-if="selectedHistory.length > 0" src="/icons/phone-check-active.svg" alt="">
            <img v-else src="/icons/phone-check.svg" alt="">
          </div>
          <div class="cellphone-history-all-actions__item" :class="selectedHistory.length > 0 ? 'active' : ''">
            <span>Download</span>
            <img v-if="selectedHistory.length > 0" src="/icons/phone-download-active.svg" alt="">
            <img v-else src="/icons/phone-download.svg" alt="">
          </div>
          <div
            class="cellphone-history-all-actions__item"
            :class="selectedHistory.length > 0 ? 'active' : ''"
            @click="deleteSelectedHistories"
          >
            <span>Delete</span>
            <img v-if="selectedHistory.length > 0" src="/icons/phone-trash-red.svg" alt="">
            <img v-else src="/icons/phone-trash.svg" alt="">
          </div>
        </div>
        <div style="height: 450px; padding-top: 10px" class="cellphone-list celphone-scroll-view">
          <div class="centered h-100" v-if="loading">
            <v-progress-circular
              indeterminate
              :size="50"
              color="blue"
            ></v-progress-circular>
          </div>
          <template v-else>
            <div
              v-if="histories.length === 0"
              class="h-100 centered"
            >
              <span class="grey--text body-1">Not found</span>
            </div>
            <div
              v-else
              class="cellphone-list__item"
              v-for="(item, index) in histories"
              :key="index">
              <div class="call-history-checkbox-enter-done" :class="{'active':editMode}">
                <div class="c-checkmark-container">
                  <input type="checkbox" v-bind:value="item" v-model="selectedHistory">
                  <span class="c-checkmark"></span>
                </div>
              </div>
              <div class="cellphone-list__item_avatar">
                <img :src="item.author.avatar !== null ? item.author.avatar : $store.getters.getDefaultAvatar" alt=""/>
              </div>
              <div class="cellphone-list__item_body">
                <div class="cellphone-list__item_name">
                  <div class="title red">
                    <span>{{ item.author.first_name }} {{ item.author.last_name }}</span>
                  </div>
                  <div class="subtitle">
                    <span>{{ item.direction }} ({{ item.duration }})</span>
                  </div>
                </div>
                
                <div class="cellphone-list__item_right">
                  <div
                    v-if="!item.menu"
                    class="cellphone-list__item_meta">
                    <span>{{ item.created_date | formatDate }}</span>
                  </div>
                  <div
                    v-if="!item.menu"
                    class="cellphone-list__item_more"
                    @click="item.menu=true"
                  >
                    <img src='/icons/more.svg' alt=""/>
                  </div>
                  <div
                    class="cellphone-action-menu"
                    :class="{'open': item.menu}"
                  >
                    <div class="cellphone-list__item_actions">
                      <div
                        class="cellphone-list__item_actions_item"
                        v-if="item.record_link !== undefined"
                        @click="playAudio('h_audio_' + index)"
                      >
                        <img src='/icons/phone-play.svg' alt=""/>
                        <audio :ref="'h_audio_' + index" hidden='' controls>
                          <source :src="item.record_link" type="audio/mpeg"/>
                        </audio>
                      </div>
                      <div class="cellphone-list__item_actions_item">
                        <img class="cellphone-list__item_actions_item" src='/icons/phone-download.svg'
                             alt=""/>
                      </div>
                      <div
                        class="cellphone-list__item_actions_item"
                        @click="deleteHistory(item.id)"
                      >
                        <img src='/icons/phone-trash.svg' alt=""/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>


<script>

const axios = require('axios')
const moment = require('moment')

export default {
  name: 'telephony-fax',
  data() {
    return {
      selectedHistory: [],
      loading: false,
      histories: [],
      editMode: false
    }
  },
  watch: {},
  methods: {
    deleteSelectedHistories() {
      let self = this
      if (this.selectedHistory.length === 0) return false
      this.loading = true
      this.selectedHistory.map(function (val, index) {
        self.deleteHistory(val.id, false)
      })

      this.updateHistories()
    },
    deleteHistory(id, with_update = true) {
      let self = this
      let accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')
      axios({
        method: 'DELETE',
        url: self.$store.state.backendUrl + '/backend/api/calls/' + id + '/',
        headers: {'Authorization': 'JWT ' + accessToken},
      })
        .then(function (response) {
          if (with_update) {
            self.updateHistories()
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    playAudio(el) {
      this.$refs[el][0].play()
    },
    selectAll() {
      if (this.selectedHistory.length > 0) {
        this.selectedHistory = []
      } else {
        this.selectedHistory = this.histories
      }
    },
    changeMode() {
      this.editMode = !this.editMode
      this.selectedHistory = []
    },
    updateHistories() {
      this.loading = true

      let self = this
      let accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')

      axios({
        method: 'get',
        url: self.$store.state.backendUrl + '/backend/api/calls/',
        headers: {'Authorization': 'JWT ' + accessToken},
      })
        .then(function (response) {
          let data = response.data
          data.map(function (val, index) {
            data[index].menu = false
          })
          self.histories = data

          self.loading = false
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  },
  created() {
    this.updateHistories()
  },
  beforeDestroy() {

  },
  mounted() {
  },
  filters: {
    formatDate(date) {
      var date = moment(date);
      return date.format('DD.MM');
    }
  },
  computed: {},
  components: {}
}
</script>

<style lang="css" scoped src="@/components/telephony/style.css"></style>
