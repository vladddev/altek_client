<template>
  <v-app id="inspire">
    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12">
            <v-row align="center" justify="center">
              <v-col cols="12" sm="8" md="4">
                <v-form ref="form" @submit.prevent="search">
                  <v-card :loading="loading">
                    <v-card-text>
                      <v-text-field v-model="searchField" label="Load #" name="Load #" clearable
                        append-outer-icon="mdi-magnify" @click:append-outer="search" type="text" />
                    </v-card-text>
                  </v-card>
                </v-form>
              </v-col>
            </v-row>

            <nuxt />

          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>


<script>
  export default {
    data: () => ({
      searchField: '',
      valid: true,
      loading: false
    }),
    created() {
      // this.$vuetify.theme.dark = false
    },
    methods: {
      search() {
        this.$router.push('/tracking/' + this.searchField + '/')
      }
    },
  }

</script>

<style lang="css">
  body .v-application .secondary {
    background-color: #1c4450 !important;
    border-color: #1c4450 !important;
  }

</style>
