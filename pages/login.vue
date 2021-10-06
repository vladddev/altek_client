<template>
  <v-form ref="form" v-model="valid" @submit.prevent="validate">
    <!-- <script src="https://apis.google.com/js/api:client.js"></script> -->
    <v-card class="elevation-12" :loading="loading">
      <v-toolbar color="secondary" dark flat>
        <v-toolbar-title>Login</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-text-field label="Email" name="Email" prepend-icon="mdi-at" :rules="emailRules" type="text"
          v-model.trim="email" :error-messages="loginErrors" :error="loginErrors.length > 0" @input="loginErrors = []"
          required />
        <v-text-field label="Password" name="password" prepend-icon="mdi-lock" :rules="passwordRules" type="password"
          v-model="password" :error-messages="loginErrors" :error="loginErrors.length > 0" @input="loginErrors = []"
          required />
      </v-card-text>
      <v-card-actions>
        <!-- <g-signin-button :params="googleSignInParams" @success="onGoogleSignInSuccess" @error="onGoogleSignInError">
          <v-btn class="mx-2" fab dark small color="red">
            <v-icon dark>mdi-google-plus</v-icon>
          </v-btn>
        </g-signin-button> -->
        <v-spacer />
        <v-btn :disabled="!valid" color="primary" type="submit">Login</v-btn>
        <v-btn color="secondary" @click="$router.push('/registration/')">Registration</v-btn>
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
        script: [
          {
            src: 'https://apis.google.com/js/api:client.js'
          }
        ],
      }
    },
    data: () => ({
      valid: true,
      loading: false,
      user: {},
      loginErrors: [],
      email: '',
      password: '',
      passwordRules: [
        v => !!v || 'Password is required',
        v => v.search(/\s/) == -1 || 'Password mustn\'t has whitespaces',
      ],
      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
      ],
      googleSignInParams: {
        client_id: '27759691787-h9acqb5ur6eqepn0upanp6up7njne48p.apps.googleusercontent.com'
      }
    }),
    methods: {
      validate() {
        let email = this.email.trim();
        let password = this.password.trim();
        let self = this;
        this.loading = true;

        axios({
            method: 'post',
            url: self.$store.state.backendUrl + '/backend/api/rest-auth/login/',
            data: {
              email: email,
              password: password,
            }
          })
          .then(function (response) {
            localStorage.setItem('etl-user-token', response.data.token)
            
            self.$store.commit('setToken', response.data.token)
            self.$router.push('/')
          })
          .catch(function (error) {
            if (error.response.status === 400 || error.response.status === 401) {
              self.loginErrors.push('Invalid email or password')
            }
            self.loading = false;
            console.log(error);
          });
        // this.$refs.form.validate()
        // if (this.valid === true) {
        //     this.$store.dispatch('email')
        //     this.$router.push('/')
        // }
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
            self.$store.commit('setToken', response.data.token)
            self.$router.push('/')
            localStorage.setItem('etl-user-token', response.data.token)
            console.log(response);
          })
          .catch(err => {
            console.log(err)
          })
      },
      onGoogleSignInError(error) {
        console.log('OH NOES', error)
      },
    },
    created() {
      if (this.$store.getters.hasToken) {
        this.$router.push('/')
      }
    }
  }

</script>
