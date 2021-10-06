<template>
  <v-app id="inspire">
    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12">

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

    }),
    created() {
        
    },
    methods: {

    },
  }

</script>

<style lang="css">
  body .v-application .secondary {
    background-color: #1c4450 !important;
    border-color: #1c4450 !important;
  }

</style>
