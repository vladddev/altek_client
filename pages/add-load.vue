<template>
  <v-container fluid>
    <v-card>
      <v-card-text>
        <v-form v-model="valid" ref="form" @submit.prevent="saveChanges">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="newLoad.pickUpAt"
                label="Pick-up at"
                :rules="requiredRules"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="newLoad.deliverTo"
                label="Deliver to"
                :rules="requiredRules"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model="newLoad.weight"
                label="Weight"
                :rules="requiredRules"
                type="number"
                hint="Write your load weight"
                suffix="kg"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model="newLoad.length"
                label="Length"
                :rules="requiredRules"
                type="number"
                hint="Lenght of your load"
                suffix="cm"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model="newLoad.width"
                label="Width"
                :rules="requiredRules"
                type="number"
                hint="Width of your load"
                suffix="cm"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model="newLoad.height"
                label="Height"
                :rules="requiredRules"
                type="number"
                hint="Height of your load"
                suffix="cm"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model="newLoad.price"
                label="Price"
                type="number"
                :rules="requiredRules"
                messages="If you want to take propositions fill empty"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="7">
              <v-text-field
                v-model="newLoad.car"
                :rules="requiredRules"
                label="Auto"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="3">
              <v-checkbox
                v-model="newLoad.isDanger"
                label="Dangerous"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" md="3">
              <v-checkbox
                v-model="newLoad.isUrgent"
                label="Urgent"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" md="3">
              <v-checkbox
                v-model="newLoad.isCanPutOnTop"
                label="Stackable"
              ></v-checkbox>
            </v-col>
          </v-row>
          <v-row>
            <v-spacer></v-spacer>
            <v-col cols="2">
              <v-btn
                :loading="loading"
                :disabled="loading"
                color="blue-grey"
                class="ma-2 white--text"
                type="submit"
              >
                Save
                <v-icon right dark>mdi-cloud-upload</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
const axios = require("axios");

export default {
  data() {
    return {
      valid: true,
      loading: false,
      newLoad: {
        pickUpAt: "",
        deliverTo: "",
        weight: "",
        length: "",
        height: "",
        width: "",
        price: "",
        car: "",
        carVariants: "",
        isDanger: false,
        isUrgent: false,
        isCanPutOnTop: false,
      },
      requiredRules: [(v) => !!v || "This field is required"],
    };
  },
  methods: {
    saveChanges() {
      let self = this;

      this.$refs.form.validate();
      if (this.valid === true) {
        const accessToken = this.$store.getters.getToken;
        const newLoadData = this.newLoad;

        axios({
          method: "post",
          url: self.$store.state.backendUrl + "/backend/api/loads/create/",
          data: newLoadData,
          headers: { Authorization: "JWT " + accessToken },
        })
          .then(function (response) {
            const newLoadId = response.data.id;
            self.$globalEvents.$emit("companySentEvent", {
              action: "new_load_add",
              data: {
                load: newLoadId,
              },
            });
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    },
  },
  created() {
    const self = this;

    this.$globalEvents.$on("refreshTokens", () => {
      const accessToken = this.$store.getters.getToken;
      // console.log(self.$router);

      axios({
        method: "get",
        url: self.$store.state.backendUrl + "/backend/api/check-permissions/",
        params: {
          page: self.$router.history.current.path,
        },
        headers: { Authorization: "JWT " + accessToken },
      })
        .then(function (response) {
          console.log(response);
          if (!response.data.allow) {
            // self.$router.push('/')
          }
          self.loading = false;
        })
        .catch(function (error) {
          self.loading = false;
          console.log(error);
        });
    });
  },
  mounted() {
    this.$store.commit("updateToolbarData", {
      title: "Add load",
    });
  },
  beforeDestroy() {
    this.$store.commit("updateToolbarData", {});
    this.$globalEvents.$off("refreshTokens");
  },
};
</script>
