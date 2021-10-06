<template>
  <v-container fluid>
    <v-form ref="form" v-model="valid" @submit.prevent="saveChanges">
      <v-card>
        <v-card-title>{{ user.department }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="5">
              <picture-input
                ref="pictureInput"
                width="250"
                height="250"
                margin="15"
                :prefill="prefillUrl"
                accept="image/jpeg,image/png"
                size="10"
                :zIndex="2"
                button-class="v-btn v-btn--flat v-btn--text theme--light v-size--small orange--text"
                :custom-strings="{
                  upload: '',
                  drag: 'Select your photo',
                }"
                @change="imageUpload"
              >
              </picture-input>
            </v-col>
            <v-col cols="7">
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model.trim="firstname"
                    label="First Name"
                    :rules="requiredRules"
                    prepend-icon="mdi-account-details"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model.trim="lastname"
                    label="Last Name"
                    :rules="requiredRules"
                    prepend-icon="mdi-account-details"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-text-field
                label="Address"
                prepend-icon="mdi-home"
                v-model="address"
              />
              <v-text-field
                label="Email"
                prepend-icon="mdi-at"
                :rules="emailRules"
                v-model.trim="email"
                disabled
              />
              <v-text-field
                label="Phone number"
                prepend-icon="mdi-phone"
                v-model.trim="number"
              />
              <v-row>
                <v-col cols="12">
                  <v-subheader class="font-weight-bold subtitle-1"
                    >Private email access:</v-subheader
                  >
                  <v-divider></v-divider>
                </v-col>
                <v-col cols="12">
                  <v-btn
                    v-if="!user.in_gmail"
                    color="#D84830"
                    depressed
                    style="border-radius: 0"
                    dark
                    :loading="gmailLoginLoader"
                    @click="gmailLogin"
                    class="text-capitalize"
                  >
                    <v-icon style="margin-right: 5px">mdi-gmail</v-icon>
                    Sign in with Gmail
                  </v-btn>

                  <v-btn
                    v-else
                    color="#D84830"
                    depressed
                    style="border-radius: 0"
                    dark
                    class="text-capitalize"
                    :loading="gmailLoginLoader"
                    @click="gmailLogout"
                  >
                    <v-icon style="margin-right: 5px">mdi-gmail</v-icon>
                    Sign out
                  </v-btn>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Email password"
                    v-model.trim="private_email_password"
                  />
                </v-col>
                <v-col cols="3">
                  <v-text-field
                    label="Email domain"
                    v-model.trim="private_email_domain"
                  />
                </v-col>
                <!-- <v-col cols="3">
                      <v-text-field
                          label="Email port"
                          v-model.trim="private_email_port"
                      />
                  </v-col> -->
                <v-col cols="3">
                  <v-text-field
                    label="IMAP domain"
                    v-model.trim="private_email_imap_domain"
                  />
                </v-col>
                <!-- <v-col cols="3">
                      <v-text-field
                          label="IMAP port"
                          v-model.trim="private_email_imap_port"
                      />
                  </v-col> -->
              </v-row>
            </v-col>
          </v-row>
          <v-row>
            <v-spacer></v-spacer>
            <v-col cols="2">
              <v-btn
                :loading="loading"
                color="blue-grey"
                class="ma-2 white--text"
                type="submit"
              >
                Save changes
                <v-icon right dark>mdi-cloud-upload</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row v-if="user.department == 'Carrier'">
            <v-col>
              <v-card-text class="subtitle-1">
                Your Twilio webhook link:
                <span class="subtitle-2">{{ twilioLink }}</span>
              </v-card-text>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-form>
  </v-container>
</template>

<script>
import PictureInput from "vue-picture-input";

const axios = require("axios");
// ^backend/api/gmail/logout
// ^backend/api/gmail

export default {
  data() {
    return {
      valid: true,
      loading: false,
      avatar: "",
      gmailLoginLoader: false,
      prefillUrl: "",
      user: {},
      firstname: "",
      lastname: "",
      email: "",
      address: "",
      number: "",
      private_email_password: "",
      private_email_domain: "",
      // private_email_port: '',
      private_email_imap_domain: "",
      // private_email_imap_port: '',
      twilioLink: "",
      emailRules: [
        (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
        (v) => !!v || "This field is required",
      ],
      requiredRules: [(v) => !!v || "This field is required"],
    };
  },
  methods: {
    async gmailLogout() {
      const self = this;

      self.gmailLoginLoader = true;

      let accessToken = self.$store.getters.getToken
        ? self.$store.getters.getToken
        : localStorage.getItem("etl-user-token");

      try {
        await axios({
          method: "get",
          url: "https://altekloads.com/backend/api/gmail/logout",
          headers: { Authorization: "JWT " + accessToken },
        });

        self.user.in_gmail = false;
        self.gmailLoginLoader = false;
      } catch (error) {
        self.gmailLoginLoader = false;
        console.log(error);
      }
    },
    gmailLogin() {
      const self = this;

      self.gmailLoginLoader = true;

      let accessToken = self.$store.getters.getToken
        ? self.$store.getters.getToken
        : localStorage.getItem("etl-user-token");

      let inGmail = self.user.in_gmail;

      if (!inGmail) {
        axios({
          method: "get",
          url: "https://altekloads.com/backend/api/gmail",
          headers: { Authorization: "JWT " + accessToken },
        })
          .then(function (response) {
            if (response.status == 200) {
              if (!inGmail && response.data.redirect) {
                self.newWindowHandler(response.data.redirect);
              }
            }
          })
          .catch(function (error) {
            self.loading = false;
            console.log(error);
          });
      }
    },
    newWindowHandler(redirect) {
      const self = this;
      const params = "toolbar=no,menubar=no,width=600,height=600";
      const newWindow = window.open(redirect, "_blank", params);
      newWindow.focus();

      const interval = setInterval(() => {
        try {
          if (newWindow.closed) {
            self.gmailLoginLoader = false;
            clearInterval(interval);
          } else if (newWindow.location.host === window.location.host) {
            self.user.in_gmail = true;
            newWindow.close();
          }
        } catch (e) {}
      }, 100);
    },
    imageUpload(avatar) {
      console.log(avatar);
      if (avatar) {
        this.avatar = this.$refs.pictureInput.file;
      } else {
        console.log("FileReader API not supported: use the <form>");
      }
    },
    saveChanges() {
      let self = this;

      this.$refs.form.validate();

      if (this.valid === true) {
        let accessToken = this.$store.getters.getToken;
        let userId = this.user.id;

        const formData = new FormData();

        formData.append("first_name", this.firstname);
        formData.append("last_name", this.lastname);
        formData.append("address", this.address);
        formData.append("phone_number", this.number);
        formData.append("private_email_password", this.private_email_password);
        formData.append("private_email_domain", this.private_email_domain);
        // formData.append('private_email_port', this.private_email_port)
        formData.append(
          "private_email_imap_domain",
          this.private_email_imap_domain
        );
        // formData.append('private_email_imap_port', this.private_email_imap_port)

        if (this.avatar) {
          formData.append("avatar", this.avatar);
        }

        this.loading = true;

        axios({
          method: "put",
          url:
            self.$store.state.backendUrl + "/backend/api/users/current/update/",
          data: formData,
          headers: { Authorization: "JWT " + accessToken },
        })
          .then(function (response) {
            console.log(response);
            self.$store.commit("renewCurrentUser", response.data);
            self.$globalEvents.$emit("renewCurrentUser");
            self.loading = false;
          })
          .catch(function (error) {
            self.loading = false;
            console.log(error);
          });
      }
    },
  },
  created() {
    console.log(this.$refs);
    this.$globalEvents.$on("renewCurrentUser", () => {
      this.user = this.$store.getters.getCurrentUser;

      if (this.user.email) {
        this.firstname = this.user.first_name ? this.user.first_name : "";
        this.lastname = this.user.last_name ? this.user.last_name : "";
        this.email = this.user.email ? this.user.email : "";
        this.address = this.user.address ? this.user.address : "";
        this.number = this.user.phone_number ? this.user.phone_number : "";
        this.prefillUrl = this.user.avatar
          ? this.$store.state.backendUrl + this.user.avatar
          : "";
        this.private_email_password = this.user.private_email_password
          ? this.user.private_email_password
          : "";
        this.private_email_domain = this.user.private_email_domain
          ? this.user.private_email_domain
          : "";
        // this.private_email_port = this.user.private_email_port ? this.user.private_email_port : ''
        this.private_email_imap_domain = this.user.private_email_imap_domain
          ? this.user.private_email_imap_domain
          : "";
        // this.private_email_imap_port = this.user.private_email_imap_port ? this.user.private_email_imap_port : ''

        this.twilioLink =
          window.location.origin +
          "/backend/api/sms/new?user_id=" +
          this.user.id;
      }
    });
    this.$globalEvents.$emit("renewCurrentUser");
  },
  mounted() {
    this.$store.commit("updateToolbarData", {
      title: "Profile",
    });
  },
  beforeDestroy() {
    this.$store.commit("updateToolbarData", {});
    this.$globalEvents.$off("renewCurrentUser");
  },
  components: {
    PictureInput,
  },
};
</script>
