<template>
  <v-container fluid>
    <v-card width="100%">
      <v-form ref="form" v-model="valid" @submit.prevent="saveChanges">
        <v-card-text>
          <v-row>
            <v-col cols="4">
              <picture-input ref="pictureInput" width="250" height="250" margin="15" :prefill="prefillUrl"
                accept="image/jpeg,image/png" size="10" :zIndex="2"
                button-class="v-btn v-btn--flat v-btn--text theme--light v-size--small orange--text" :custom-strings="{
                                    upload: '',
                                    drag: 'Company logo'
                                }" @change="imageUpload">
              </picture-input>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="company" label="Company" :rules="requiredRules"></v-text-field>
              <v-text-field v-model="company_address" label="Company address" :rules="requiredRules"></v-text-field>
              <template v-if="userDepartment == 'Carrier'">
                <v-text-field label="Twilio account sid" v-model="twilio_account_sid" />
                <v-text-field label="Twilio auth token" v-model="twilio_auth_token" />
                <v-text-field label="Twilio messaging service sid" v-model="twilio_messaging_service_sid" />
              </template>
              <template v-else>
                <v-text-field label="Target email address for parsing" v-model="parsing_email" />
                <v-text-field label="Password of target email" v-model="parsing_password" type="password" />
                <v-text-field label="IMAP domain" v-model="parsing_domain" />
                <v-text-field label="IMAP port" v-model="parsing_port" type='number' />
                <div class="my-2">
                  <v-btn small color="primary" :loading="loading" @click='parse'>Parce loads
                  </v-btn>
                </div>
              </template>
              <v-text-field label="Company email" v-model="company_mail_adress" />
              <v-text-field label="Password of company email" v-model="company_mail_password" type="password" />
              <v-text-field label="Email host" placeholder="smtp.gmail.com" v-model="company_mail_host" />
              <v-text-field label="Port" v-model="company_mail_port" type='number' />
              <v-combobox v-if="userDepartment == 'Carrier'" v-model="brokers_blacklist" chips clearable
                label="Disallow brokers" multiple prepend-icon="mdi-filter-variant" class="no-arrow" solo>
                <template v-slot:selection="{ attrs, item, select, selected }">
                  <v-chip v-bind="attrs" :input-value="selected" close @click="select"
                    @click:close="removeBroker(item)">
                    <strong>{{ item }}</strong>
                  </v-chip>
                </template>
              </v-combobox>
              <v-combobox v-if="userDepartment == 'Carrier'" v-model="companies_blacklist" chips clearable
                label="Disallow companies" multiple prepend-icon="mdi-filter-variant" class="no-arrow" solo>
                <template v-slot:selection="{ attrs, item, select, selected }">
                  <v-chip v-bind="attrs" :input-value="selected" close @click="select"
                    @click:close="removeCompany(item)">
                    <strong>{{ item }}</strong>
                  </v-chip>
                </template>
              </v-combobox>
              <v-text-field label="SMS template" v-model="sms_template" />
              <v-text-field label="Billing preferenses" v-model="billing_preferences" :rules="requiredRules" />
              <v-textarea label="Letter template" outlined v-model="email_template"></v-textarea>
              <span class="subtitle-1">Example:</span>
              <div v-html="letterTemplateFormatted"></div>
            </v-col>
          </v-row>
          <v-row>
            <v-spacer></v-spacer>
            <v-col cols="2">
              <v-btn :loading="loading" color="blue-grey" class="ma-2 white--text" type="submit">
                Save changes
                <v-icon right dark>mdi-cloud-upload</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-form>
    </v-card>
  </v-container>
</template>


<script>
  import PictureInput from 'vue-picture-input'

  const axios = require('axios');


  export default {
    data() {
      return {
        valid: true,
        loading: false,
        company_logo: '',
        prefillUrl: '',
        company: '',
        company_address: '',
        twilio_auth_token: '',
        twilio_account_sid: '',
        twilio_messaging_service_sid: '',
        billing_preferences: '',
        sms_template: '',
        parsing_email: null,
        parsing_password: null,
        parsing_domain: null,
        parsing_port: null,
        company_mail_adress: null,
        company_mail_password: null,
        company_mail_host: null,
        company_mail_port: null,
        userDepartment: '',
        email_template: '',
        brokers_blacklist: '',
        companies_blacklist: '',
        requiredRules: [
          v => !!v || 'This field is required',
        ],
      }
    },
    methods: {
      imageUpload(company_logo) {
        if (company_logo) {
          this.company_logo = this.$refs.pictureInput.file
        } else {
          console.log('FileReader API not supported: use the <form>')
        }
      },
      saveChanges() {
        let self = this

        this.$refs.form.validate()
        if (this.valid === true) {
          let company = this.company
          let company_address = this.company_address
          let twilio_account_sid = this.twilio_account_sid
          let twilio_auth_token = this.twilio_auth_token
          let twilio_messaging_service_sid = this.twilio_messaging_service_sid
          let billing_preferences = this.billing_preferences
          let company_logo = this.company_logo

          let brokers_blacklist = this.brokers_blacklist.join('|')
          let companies_blacklist = this.companies_blacklist.join('|')

          let parsing_email = this.parsing_email
          let parsing_password = this.parsing_password
          let parsing_domain = this.parsing_domain
          let parsing_port = this.parsing_port

          let company_mail_adress = this.company_mail_adress
          let company_mail_password = this.company_mail_password
          let company_mail_host = this.company_mail_host
          let company_mail_port = this.company_mail_port
          let email_template = this.email_template
          let sms_template = this.sms_template

          let accessToken = this.$store.getters.getToken

          const formData = new FormData();

          formData.append("company", company);
          formData.append("company_address", company_address);
          formData.append("twilio_auth_token", twilio_auth_token);
          formData.append("twilio_account_sid", twilio_account_sid);
          formData.append("twilio_messaging_service_sid", twilio_messaging_service_sid);
          formData.append("billing_preferences", billing_preferences);
          formData.append("email_template", email_template);
          formData.append("sms_template", sms_template);

          formData.append("brokers_blacklist", brokers_blacklist);
          formData.append("companies_blacklist", companies_blacklist);

          formData.append("parsing_email", parsing_email);
          formData.append("parsing_password", parsing_password);
          formData.append("parsing_domain", parsing_domain);
          formData.append("parsing_port", parsing_port);

          formData.append("company_mail_adress", company_mail_adress);
          formData.append("company_mail_password", company_mail_password);
          formData.append("company_mail_host", company_mail_host);
          formData.append("company_mail_port", company_mail_port);

          if (company_logo) {
            formData.append("company_logo", company_logo);
          }

          this.loading = true;

          axios({
              method: 'put',
              url: self.$store.state.backendUrl + '/backend/api/settings/',
              data: formData,
              headers: {
                'Authorization': 'JWT ' + accessToken
              },
            })
            .then(function (response) {
              console.log(response);
              self.$store.commit('renewSettings', response.data)
              self.$globalEvents.$emit('renewSettings')
              self.loading = false;
            })
            .catch(function (error) {
              self.loading = false;
              console.log(error);
            });

        }
      },
      parse() {
        this.loading = true;
        let accessToken = this.$store.getters.getToken
        const self = this

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/loads/parse',
            params: {
              user_id: self.$store.getters.getCurrentUser.id
            },
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            alert(response.data.result)
            self.$globalEvents.$emit('loadsParsed')
            self.loading = false;
          })
          .catch(function (error) {
            alert('Error was happend...')
            self.loading = false;
            console.log(error);
          });
      },
      removeBroker(item) {
        this.brokers_blacklist.splice(this.brokers_blacklist.indexOf(item), 1)
        this.brokers_blacklist = [...this.brokers_blacklist]
      },
      removeCompany(item) {
        this.companies_blacklist.splice(this.companies_blacklist.indexOf(item), 1)
        this.companies_blacklist = [...this.companies_blacklist]
      },
    },
    created() {
      const self = this

      this.$globalEvents.$on('refreshTokens', () => {
        const accessToken = this.$store.getters.getToken

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/check-permissions/',
            params: {
              page: self.$router.history.current.path
            },
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            console.log(response);
            if (!response.data.allow) {
              self.$router.push('/')
            }
          })
          .catch(function (error) {
            console.log(error);
          });

      })
      this.$globalEvents.$on('renewCurrentUser', () => {
        this.userDepartment = this.$store.getters.getCurrentUser.department
      })
      this.$globalEvents.$on('renewSettings', () => {
        const settings = this.$store.getters.getSettings

        if (settings.company) {
          this.company = settings.company ? settings.company : ''
          this.company_address = settings.company_address ? settings.company_address : ''
          this.twilio_account_sid = settings.twilio_account_sid ? settings.twilio_account_sid : ''
          this.twilio_auth_token = settings.twilio_auth_token ? settings.twilio_auth_token : ''
          this.twilio_messaging_service_sid = settings.twilio_messaging_service_sid ? settings
            .twilio_messaging_service_sid : ''
          this.billing_preferences = settings.billing_preferences ? settings.billing_preferences : ''
          this.prefillUrl = settings.company_logo ? settings.company_logo : ''

          this.email_template = settings.email_template ? settings.email_template : ''

          this.brokers_blacklist = settings.brokers_blacklist ? settings.brokers_blacklist.split('|') : []
          this.companies_blacklist = settings.companies_blacklist ? settings.companies_blacklist.split('|') : []

          this.parsing_email = settings.parsing_email ? settings.parsing_email : ''
          this.parsing_password = settings.parsing_password ? settings.parsing_password : ''
          this.parsing_domain = settings.parsing_domain ? settings.parsing_domain : ''
          this.parsing_port = settings.parsing_port ? settings.parsing_port : ''
          this.sms_template = settings.sms_template ? settings.sms_template : ''

          this.company_mail_adress = settings.company_mail_adress ? settings.company_mail_adress : ''
          this.company_mail_password = settings.company_mail_password ? settings.company_mail_password : ''
          this.company_mail_host = settings.company_mail_host ? settings.company_mail_host : ''
          this.company_mail_port = settings.company_mail_port ? settings.company_mail_port : ''
        }
      })

      if (this.$store.getters.getSettings) {
        this.$globalEvents.$emit('renewSettings')
      }

      if (this.$store.getters.getCurrentUser) {
        this.$globalEvents.$emit('renewCurrentUser')
      }
    },
    mounted() {
      this.$store.commit('updateToolbarData', {
        title: 'Company settings',
        backBtn: {
          callback: function () {
            window.history.back();
          }
        },
      })
    },
    computed: {
      letterTemplateFormatted() {

        let template = this.email_template

        template = template
          .replace(/\<script\>.+\<\/script\>/, '')
          .replace(/\[bold\]/gi, '<b>')
          .replace(/\[\/bold\]/gi, '</b>')
          .replace(/\{brokerPrice\}/gi, '123')
          .replace(/\{sign\}/gi, this.$store.state.currentUser.first_name + ' ' + this.$store.state.currentUser
            .last_name)
          .replace(/\{MCNumber\}/gi, '123456')
          .replace(/\{vehicle\}/gi, 'Truck')
          .replace(/\{eta\}/gi, '22mins')
          .replace(/\{miles\}/gi, '12')
          .replace(/\{dims\}/gi, '170x50x70 in')

        return template

      }
    },
    beforeDestroy() {
      this.$store.commit('updateToolbarData', {})
      this.$globalEvents.$off('renewSettings')
      this.$globalEvents.$off('refreshTokens')
      this.$globalEvents.$off('renewCurrentUser')
    },
    components: {
      PictureInput
    },
  }

</script>

<style lang="sass">
  .no-arrow .v-input__icon--append 
    display: none !important

</style>
