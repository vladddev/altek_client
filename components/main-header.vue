<template>
  <v-app-bar
    :clipped-left="$vuetify.breakpoint.lgAndUp"
    :clipped-right="$vuetify.breakpoint.lgAndUp"
    elevation="1"
    app
    dark
    color="blue"
  >
    <!-- rgb(88,167,239) -->
    <v-app-bar-nav-icon @click.stop="$emit('change')"/>
    <v-toolbar-title class="ml-0 pl-4">
      <v-avatar v-if="logo" size="32px" item>
        <v-img :src="logo" :alt="company"/>
      </v-avatar>
      <span class="hidden-sm-and-down">{{ company }}</span>
    </v-toolbar-title>
    <v-spacer/>
    <v-badge
      bottom
      left
      overlap
      :content="notificationsCount"
      :value="notificationsCount"
      color="error"
      class="notice-indicator"
    > 
      <!--  @click="$router.push('/notifications/')" -->
      <v-btn icon :to="'/notifications/'">
        <v-icon>mdi-bell</v-icon>
      </v-btn>
    </v-badge>
    <!-- @click="$router.push('/profile/')" -->
    <v-btn icon large :to="'/profile/'">
      <v-avatar size="32px" item>
        <v-img class="appbar-profile-avatar" :src="avatar" alt="User"/>
      </v-avatar>
    </v-btn>
    <v-btn icon @click="logout">
      <v-icon>mdi-login</v-icon>
    </v-btn>
  </v-app-bar>
</template>


<script>

export default {
  name: 'mainHeader',
  props: [
    'notificationsCount',
    'telephony'
  ],
  data() {
    return {
      avatar: '',
      logo: '',
      company: ''
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('logout')
    }
  },
  created() {

    this.$globalEvents.$on('renewCurrentUser', () => {
      const defaultAvatar = this.$store.getters.getDefaultAvatar
      const profile = this.$store.getters.getCurrentUser

      if (profile.avatar) {
        this.avatar = this.$store.state.backendUrl + '' + profile.avatar
      } else {
        this.avatar = defaultAvatar
      }
    })

    this.$globalEvents.$on('renewSettings', () => {
      const logo = this.$store.getters.getSettings.company_logo
      const company = this.$store.getters.getSettings.company

      if (logo) {
        this.logo = logo
      }

      if (company) {
        this.company = company
      }
    })

  },
  beforeDestroy() {
    this.$globalEvents.$off('renewCurrentUser')
    this.$globalEvents.$off('renewSettings')
  },
  mounted() {
  },
  computed: {},
  components: {
  }
}
</script>

<style lang="sass">
.notice-indicator
  .v-badge__badge
    bottom: auto !important
    left: auto !important
    right: auto !important
    top: auto !important
</style>
