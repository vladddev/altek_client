<template>
  <v-dialog v-model="open" class="ma-8" persistent width="600" @close="onClose(false)" @click:outside="onClose(false)">
    <v-card :loading="loading" :disabled="loading">
      <v-form ref="form" class="mx-2" v-model="valid">
        <v-card-title>Email notifications</v-card-title>
        <v-card-text>
          <v-switch
            v-model="form.flag"
            :label="form.flag ? 'Enabled' : 'Disabled'"
          ></v-switch>

          <v-combobox
            v-model="form.location_updates"
            label="Email Location Updates"
            :disabled="!form.flag"
            multiple
            hint="Add email address and press Enter"
            persistent-hint
            clearable
            append-icon=""
            chips
          ></v-combobox>
          <br>
          <v-combobox
            v-model="form.status_updates"
            label="Email Status Updates"
            multiple
            :disabled="!form.flag"
            clearable
            hint="Add email address and press Enter"
            persistent-hint
            append-icon=""
            chips
          ></v-combobox>
          <br>
          <div
            class="font-weight-bold subtitle-1 theme--light"
            :class="{'v-input--is-disabled': !form.flag}"
          >Interval
          </div>
          <v-radio-group
            class="mt-2"
            row
            :disabled="!form.flag"
            v-model="form.interval"
            items>
            <v-radio
              v-for="(item, index) in intervals"
              :key="index"
              color="blue"
              :label="item.name"
              :value="item.value"
            ></v-radio>
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="onClose"
          >
            Cancel
          </v-btn>
          <v-btn
            color="blue"
            dark
            @click="submit"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>

const axios = require('axios')

export default {
  name: 'email-notification-dialog',
  props: ['closeEvent', 'open', 'loadData'],
  // '15 min', '30 min', '1 h', '2 h', '4 h'
  data() {
    return {
      intervals: [
        {name: '15 min', value: '15min'},
        {name: '30 min', value: '30min'},
        {name: '1 h', value: '1h'},
        {name: '2 h', value: '2h'},
        {name: '3 h', value: '3h'},
        {name: '4 h', value: '4h'}
      ],
      loading: false,
      valid: false,
      emailRules: [
        v => v.length !== 0 || 'This field is required',
      ],
      intervalRules: [
        v => !!v || 'This field is required',
      ],
      form: {
        flag: true,
        location_updates: [],
        status_updates: [],
        interval: ''

      }
    }
  },
  watch: {},
  methods: {
    onClose() {
      this.closeEvent();
    },
    submit() {
      if (!this.$refs.form.validate()) return false

      this.loading = true

      let self = this
      const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')

      let formData = new FormData()

      formData.append('email_notifications_flag', self.form.flag)
      formData.append('location_update_emails', self.form.location_updates.join('|'))
      formData.append('status_update_emails', self.form.status_updates.join('|'))
      formData.append('email_notifications_interval', self.form.interval)

      axios({
        method: 'PUT',
        url: self.$store.state.backendUrl + '/backend/api/loads/' + self.loadData.id + '/',
        data: formData,
        headers: {'Authorization': 'JWT ' + accessToken},
      })
        .then(function (response) {
          if(response.status === 200) {
            self.loading = false
            self.onClose()
          }
        })
        .catch(function (error) {
          self.loading = false;
        });

    }
  },
  mounted() {

  },
  created() {
    if (this.loadData.location_update_emails.length > 0) {
      this.form.location_updates = this.loadData.location_update_emails.split('|')
    }
    if (this.loadData.status_update_emails.length > 0) {
      this.form.status_updates = this.loadData.status_update_emails.split('|')
    }
    this.form.interval = this.loadData.email_notifications_interval
    this.form.flag = this.loadData.email_notifications_flag
  },
  beforeDestroy() {

  }
}

</script>
