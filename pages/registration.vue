<template>
  <v-form ref="form" v-model="valid" @submit.prevent="validate">
    <v-card class="elevation-12" :loading="loading">
      <v-toolbar color="secondary" dark flat>
        <v-toolbar-title>Registration</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-text-field label="Email" prepend-icon="mdi-at" :rules="emailRules" v-model.trim="email"
          :error-messages="errors.email" :error="errors.email.length > 0" @input="errors.email = []" />
        <v-text-field id="password" label="Password" prepend-icon="mdi-lock" :rules="passwordRules" type="password"
          v-model="password1" :error-messages="errors.password1" :error="errors.password1.length > 0"
          @input="errors.password1 = []" />
        <v-text-field label="Repeat password" prepend-icon="mdi-lock" :rules="passwordRules2" type="password"
          v-model="password2" />
        <v-text-field v-model.trim="firstName" label="First Name" prepend-icon="mdi-account-details"
          :error-messages="errors.first_name" :error="errors.first_name.length > 0" @input="errors.first_name = []">
        </v-text-field>
        <v-text-field v-model.trim="lastName" label="Last Name" prepend-icon="mdi-account-details"
          :error-messages="errors.last_name" :error="errors.last_name.length > 0" @input="errors.last_name = []">
        </v-text-field>
      </v-card-text>
      <v-card-actions>
        <!-- <g-signin-button :params="googleSignInParams" @success="onGoogleSignInSuccess" @error="onGoogleSignInError">
          <v-btn class="mx-2" fab dark small color="red">
            <v-icon dark>mdi-google-plus</v-icon>
          </v-btn>
        </g-signin-button> -->
        <v-spacer />
        <v-btn :disabled="!valid" color="primary" type="submit">Registration
        </v-btn>
        <v-btn color="secondary" @click="$router.push('/login/')">Login
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
  const axios = require('axios');

  export default {
    layout: 'login',
    head() {
      return {
        script: [{
          src: 'https://apis.google.com/js/api:client.js'
        }],
      }
    },
    data() {
      return {
        valid: true,
        loading: false,
        password1: '',
        password2: '',
        email: '',
        errors: {
          email: [],
          password1: [],
          first_name: [],
          last_name: []
        },
        firstName: '',
        lastName: '',
        emailRules: [
          v => !!v || 'E-mail is required',
          v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
        ],
        passwordRules: [
          v => !!v || 'Password is required',
          v => (v && v.length >= 5) || 'Password too short',
        ],
        passwordRules2: [
          v => v === this.password1 || 'Passwords don\'t match',
          v => !!v || 'This field is required',
        ],
        googleSignInParams: {
          client_id: '27759691787-h9acqb5ur6eqepn0upanp6up7njne48p.apps.googleusercontent.com'
        }
      }
    },
    methods: {
      comparePasswords(password1) {
        return password1 === this.password2
      },
      validate() {
        let self = this;

        this.$refs.form.validate()
        if (this.valid === true) {
          let login = this.login;
          let email = this.email;
          let password1 = this.password1;
          let password2 = this.password2;
          let firstName = this.firstName;
          let lastName = this.lastName;

          this.loading = true;

          axios({
              method: 'post',
              // url: self.$store.state.backendUrl + '/backend/api/registration/',
              url: self.$store.state.backendUrl + '/backend/api/rest-auth/registration/',
              data: {
                email: email,
                password1: password1,
                password2: password2,
                first_name: firstName,
                last_name: lastName,
              }
            })
            .then(function (response) {
              self.loading = false;
              self.$router.push('/login/')
            })
            .catch(function (error) {
              if (error.response.status === 400) {
                let errors = error.response.data
                // errorMessage = errorMessage[0].toUpperCase() + errorMessage.slice(1)
                // self.emailErrors.push(errorMessage)
                if (errors.email !== undefined) {
                  self.errors.email = errors.email
                }
                if (errors.first_name !== undefined) {
                  self.errors.first_name = errors.first_name
                }
                if (errors.last_name !== undefined) {
                  self.errors.last_name = errors.last_name
                }
                if (errors.password1 !== undefined) {
                  self.errors.password1 = errors.password1
                }
              }

              self.loading = false;
              console.log(error);
            });

        }
      },
      onGoogleSignInSuccess(googleUser) {
        let self = this;
        console.log(googleUser);
        const token = googleUser.Bc.access_token
        axios({
            method: 'post',
            url: self.$store.state.backendUrl + '/backend/api/social/google/',
            data: {
              access_token: token,
            }
          })
          .then(response => {
            localStorage.setItem('etl-user-token', response.data.token)

            self.$store.commit('setToken', response.data.token)
            self.$router.push('/')

          })
          .catch(err => {
            console.log(err)
          })
      },
      onGoogleSignInError(error) {
        console.log('OH NOES', error)
      },
    }
  }

</script>
