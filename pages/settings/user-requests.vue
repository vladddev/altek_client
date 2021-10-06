<template>
  <v-container fluid>
    <v-data-table :headers="headers" :items="users" :options.sync="options" :server-items-length="totalUsers"
      :loading="loading" class="elevation-1">
      <template v-slot:item.actions="{item}">
        <template v-if="item.status='Send'">
          <v-btn icon color="green" @click="sendResult(item.new_user.id, 'Accept')">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-btn icon color="red" @click="sendResult(item.new_user.id, 'Decline')">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
        </template>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
  const axios = require('axios');
  export default {
    data() {
      return {
        loading: true,
        totalUsers: 0,
        options: {},
        users: [],
        headers: [{
            text: 'Date',
            value: 'date',
            align: 'center'
          },
          {
            text: 'Name',
            value: 'fullname',
            align: 'center'
          },
          {
            text: 'Email',
            value: 'email',
            align: 'center'
          },
          {
            text: 'Status',
            value: 'status',
            align: 'center'
          },
          {
            text: 'Actions',
            value: 'actions',
            sortable: false,
            align: 'center'
          },
        ],
        targetUser: 0,
      }
    },
    methods: {
      sortingAll(users) {
        const {
          sortBy,
          sortDesc,
          page,
          itemsPerPage
        } = this.options

        let items = users
        const total = items.length

        if (sortBy.length === 1 && sortDesc.length === 1) {
          items = items.sort((a, b) => {
            const sortA = a[sortBy[0]]
            const sortB = b[sortBy[0]]

            if (sortDesc[0]) {
              if (sortA < sortB) return 1
              if (sortA > sortB) return -1
              return 0
            } else {
              if (sortA < sortB) return -1
              if (sortA > sortB) return 1
              return 0
            }
          })
        }

        items.forEach(item => {
          item.date = this.$globalFunctions.repairDatetime(item.modifiedDateTime)
          item.fullname = item.new_user.first_name + ' ' + item.new_user.last_name
          item.email = item.new_user.email
        });

        if (itemsPerPage > 0) {
          items = items.slice((page - 1) * itemsPerPage, page * itemsPerPage)
        }

        return {
          items,
          total,
        }

      },
      getUsers() {
        const self = this;
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        return new Promise((resolve, reject) => {
          let users = null;

          axios({
              method: 'get',
              url: self.$store.state.backendUrl + '/backend/api/users/my/',
              headers: {
                'Authorization': 'JWT ' + accessToken
              },
            })
            .then(function (response) {
              console.log(response);
              users = response.data
              resolve(users)
              // self.loading = false;
            })
            .catch(function (error) {
              // self.loading = false;
              console.log(error);
            });
        })
      },
      sendResult(id, status) {
        const self = this
        const accessToken = this.$store.getters.getToken
        this.loading = true

        axios({
            method: 'post',
            url: self.$store.state.backendUrl + '/backend/api/users/requests/result/',
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
            data: {
              id: id,
              status: status
            }
          })
          .then(function (response) {
            console.log(response);

            let usersData = self.sortingAll(response.data)
            self.users = usersData.items
            self.totalUsers = usersData.total
            self.loading = false
          })
          .catch(function (error) {
            self.loading = false
            console.log(error);
          });
      }
    },
    watch: {
      options: {
        handler() {
          if (this.users.length < 1) {
            return
          }

          this.loading = true
          this.getUsers()
            .then(data => {
              let usersData = this.sortingAll(data)
              this.users = usersData.items
              this.totalUsers = usersData.total

              this.loading = false
            })

        },
      },
    },
    created() {
      const self = this
      const accessToken = this.$store.getters.getToken

      axios({
          method: 'get',
          url: self.$store.state.backendUrl + '/backend/api/check-permissions/',
          params: {
            page: self.$router.history.current.path
          },
          headers: {
            'Authorization': 'JWT ' + accessToken
          },
        })
        .then(function (response) {
          console.log(response);

          if (response.data.allow) {
            axios({
                method: 'get',
                url: self.$store.state.backendUrl + '/backend/api/users/requests/all/',
                headers: {
                  'Authorization': 'JWT ' + accessToken
                },
              })
              .then(function (response) {
                console.log(response);

                let usersData = self.sortingAll(response.data)
                self.users = usersData.items
                self.totalUsers = usersData.total
                self.loading = false
              })
              .catch(function (error) {
                console.log(error);
              });

          } else {
            self.$router.push('/')
          }
        })
        .catch(function (error) {
          console.log(error);
        });


    },
    mounted() {
      this.$store.commit('updateToolbarData', {
        title: 'Users requests',
        backBtn: {
          callback: function () {
            window.history.back();
          }
        },
      })
    },
    beforeDestroy() {
      this.$store.commit('updateToolbarData', {})
    },
  }

</script>
