<template>
  <v-container fluid>
    <v-form ref="form" v-model="valid" @submit.prevent="saveChanges">
      <v-card>
        <v-card-text>
          <v-row>
            <v-col cols="4">
              <v-text-field
                v-model="user.first_name"
                label="First Name"
              ></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="user.last_name"
                label="Last Name"
              ></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Address"
                v-model="user.address"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Email"
                v-model="user.email"
                disabled
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Phone number"
                v-model="user.phone_number"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Zip"
                v-model="user.zip_code"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Emergency name"
                v-model="user.emergency_name"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Emergency Phone"
                v-model="user.emergency_phone"
              />
            </v-col>
          </v-row>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="red"
              outlined
              @click="deleteConfirmDialog=true"
            >
              Delete
            </v-btn>
            <v-btn
              :loading="loading"
              dark
              color="blue"
              type="submit"
            >
              Save changes
              <v-icon right dark>mdi-cloud-upload</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-form>
    <v-dialog
      v-model="deleteConfirmDialog"
      persistent
      max-width="290"
    >
      <v-card>
        <v-card-title class="headline">
          Delete a driver
        </v-card-title>
        <v-card-text>Are you sure you want to delete a driver with id #{{ user.id }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="deleteConfirmDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="red darken-1"
            text
            @click="deleteDriver(user.id)"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import PictureInput from 'vue-picture-input'

const axios = require('axios');

export default {
  data() {
    return {
      valid: true,
      deleteConfirmDialog: false,
      loading: false,
      user: {},
      requiredRules: [
        v => !!v || 'This field is required',
      ],
    }
  },
  methods: {
    deleteDriver(id) {

      const self = this
      let accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')

      axios({
        method: 'DELETE',
        url: self.$store.state.backendUrl + '/backend/api/users/' + id + '/',
        headers: {'Authorization': 'JWT ' + accessToken},
      })
        .then(function (response) {
          self.$router.push('/vehicles/drivers/')
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    saveChanges() {
      const self = this;
      const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')
      const id = this.$route.params.id
      this.$refs.form.validate()

      if (this.valid === true) {
        this.loading = true;

        axios({
          method: 'put',
          url: self.$store.state.backendUrl + '/backend/api/users/' + id + '/',
          data: self.user,
          headers: {'Authorization': 'JWT ' + accessToken},
        })
          .then(function (response) {
            console.log(response);
            self.user = response.data
            self.loading = false;
            self.$globalEvents.$emit('notify', 'Saved')
          })
          .catch(function (error) {
            self.loading = false;
            alert('error')
            console.log(error);
          });

      }
    }
  },
  created() {
    const self = this
    const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')
    const id = this.$route.params.id

    axios({
      method: 'get',
      url: self.$store.state.backendUrl + '/backend/api/users/' + id,
      headers: {'Authorization': 'JWT ' + accessToken},
    })
      .then(function (response) {
        console.log(response);
        self.user = response.data
        // self.loading = false;
      })
      .catch(function (error) {
        // self.loading = false;
        alert('error')
        console.log(error);
      });
  },
  beforeDestroy() {
    this.$globalEvents.$off('renewCurrentUser')
  },
  components: {
    PictureInput
  },
}

</script>
