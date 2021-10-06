<template>
  <v-navigation-drawer
    :value="drawer"
    :clipped="$vuetify.breakpoint.lgAndUp"
    permanent
    expand-on-hover
    app
    style="z-index: 5"
    class="main-menu scroll-view"
  >
    <v-list dense>
      <template v-for="item in menuItems">
        <v-row v-if="item.heading" :key="item.heading" align="center">
          <v-col cols="6">
            <v-subheader v-if="item.heading">
              {{ item.heading }}
            </v-subheader>
          </v-col>
        </v-row>

        <v-list-group
          v-else-if="item.children"
          :key="item.text"
          v-model="item.model"
          :prepend-icon="item.model ? item.icon : item['icon-alt']"
          append-icon=""
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>
                {{ item.text }}
              </v-list-item-title>
            </v-list-item-content>
          </template>
          <!-- @click.prevent=$router.push(childLink) -->
          <v-list-item
            v-for="(child, i) in item.children"
            link
            :key="i"
            :to="child.link"
          >
            <v-list-item-action>
              <v-icon></v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ child.text }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
        <!-- @click.prevent="$router.push(item.link)" -->
        <v-list-item
          v-else
          color="blue"
          link
          :class="$route.path == item.link ? 'v-list-item--active' : ''"
          :key="item.text"
          :to="item.link"
        >
          <v-list-item-action>
            <v-badge
              v-if="item.text.toLowerCase() == 'group chat'"
              :value="$store.getters.getMessages"
              color="red"
              overlap
              dot
            >
              <v-icon>{{ item.icon }}</v-icon>
            </v-badge>
            <v-icon v-else>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              {{ item.text }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
    <slot></slot>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "mainMenu",
  props: {
    drawer: Boolean,
    menuItems: Array,
  },
  data() {
    return {
      items: [],
    };
  },
  methods: {},
  created() {
    // this.$globalEvents.$on('loadMenu', () => {
    //     console.log(this.menuItems);
    // })
    // var self = this
    // setTimeout(function() {
    //     self.menuItems.push(
    //         {
    //             icon: "mdi-chat",
    //             link: "/group-chat/",
    //             text: "GROUP CHAT"
    //         },
    //         {
    //             icon: "mdi-mail",
    //             link: "/email-chat/",
    //             text: "EMAIL CHAT"
    //         }
    //     )
    // }, 1000)
  },
  mounted() {},
};
</script>

<style lang="css" scoped>
.main-menu {
  border-right: 1px solid #ececec;
}
</style>
