<template>
  <v-dialog v-model="open" max-width="700px" @close="closeDialog(false)" @click:outside="closeDialog(false)">
    <v-card class="elevation-12 pa-4" :loading="loading">
      <v-card-title>Create new car</v-card-title>
      <v-form ref="form" v-model="valid">
        <v-card-text>
          <v-row>
            <v-col cols="4">
              <v-text-field
                label="First name"
                v-model="newOwner.user.first_name"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Last name"
                v-model="newOwner.user.last_name"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Applicant name"
                v-model="newOwner.applicant_name"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Email"
                v-model="newOwner.user.email"
                :error-messages="errors.email"
                :rules="requiredRules"
                :disabled="Boolean(newOwner.user.id)"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="SSN"
                v-model="newOwner.ssn"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Address"
                v-model="newOwner.user.address"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="City"
                v-model="newOwner.city"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="State"
                v-model="newOwner.state"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Phone"
                v-model="newOwner.user.phone_number"
              />
            </v-col>
            <v-col cols="4">
              asd
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Tax classification"
                v-model="newOwner.tax_classification"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Sub tax classification"
                v-model="newOwner.sub_tax_classification"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="ZIP"
                v-model="newOwner.user.zip_code"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Routing number"
                v-model="newOwner.routing_number"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Accounting number"
                v-model="newOwner.accounting_number"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Bank name"
                v-model="newOwner.bank_name"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Company name"
                v-model="newOwner.company_name"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Company address"
                v-model="newOwner.company_street_address"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Company city"
                v-model="newOwner.company_city_state"
              />
            </v-col>
            <v-col cols="8">
              <v-text-field
                label="Description"
                v-model="newOwner.other_description"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn
            @click="closeDialog(false)"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="submit"
          >Submit
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>

const axios = require('axios')
const moment = require('moment')

export default {
  name: 'new-owner-dialog',
  props: ['open', 'closeEvent'],
  data() {
    return {
      loading: false,
      is_open: false,
      newOwner: {
        user: {}
      },
      errors: {},
      valid: false,
      car_owners: [],
      expiryDateMenu: false,
      insuranceDateMenu: false,
      dispatchers: [],
      drivers: [],
      owners: [],
      carVariants: ['Cargo van', 'Small straight', 'Large straight'],
      multiSelectRules: [
        (v) => {
          if (v) {
            if (v.length === 0) {
              return false
            } else {
              return true
            }
          }
        },
      ],
      requiredRules: [
        v => !!v || 'This field is required',
      ],
      sortingOptions: {
        orderBy: '',
        order: ''
      },
      page: 1
    }
  },
  watch: {},
  methods: {
    closeDialog(with_update) {
      this.$refs.form.reset()
      this.closeEvent(with_update)
    },
    submit() {

      if (!this.$refs.form.validate()) return false

      let self = this
      const accessToken = this.$store.getters.getToken

      axios({
        method: 'POST',
        url: self.$store.state.backendUrl + '/backend/api/owners/my/',
        data: self.newOwner,
        headers: {'Authorization': 'JWT ' + accessToken},
      })
        .then(function (response) {
          if (response.status == 200) {
            self.closeDialog(true)
          }
        })
        .catch(function (error) {
          if( error.response ){
            self.errors = error.response.data
          }
        });
    },

  },
  computed: {},
  created() {

  },
  beforeDestroy() {

  },
  components: {}
}

</script>

<style lang="sass" scoped>

.load_meta, .load_meta b, .load_meta span
  font-size: 13px !important

.load_meta
  font-weight: 400

.load_meta b
  font-weight: 900

.load_meta_2 *
  line-height: 1.3

.load_meta_3
  line-height: 1.3

.v-application p
  margin-bottom: 0 !important
</style>
