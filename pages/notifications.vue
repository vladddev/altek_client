<template>
    <v-row justify="center">
        <v-card
            class="ma-5"
            width="100%"
        >
            <v-list two-line>
                <v-list-item-group
                    v-model="selected"
                    color="primary"
                    multiple
                >
                    <template v-for="(item, index) in items">
                        <v-list-item :key="item.title"  @click="readNotice(item)">
                            <v-list-item-content>
                                <!-- <v-list-item-title v-if="selected.indexOf(index) == -1" v-text="'Notification'"></v-list-item-title>
                                <v-list-item-title v-else v-text="'New notification'"></v-list-item-title> -->
                                <v-list-item-subtitle v-html="item.content"></v-list-item-subtitle>
                            </v-list-item-content>

                            <v-list-item-action>
                                <v-list-item-action-text v-text="$globalFunctions.repairDatetime(item.modifiedDateTime)"></v-list-item-action-text>
                                <v-icon
                                    v-if="selected.indexOf(index) != -1"
                                    color="grey lighten-1"
                                >
                                mdi-check
                                </v-icon>

                                <v-icon
                                    v-else
                                    color="green"
                                >
                                mdi-check
                                </v-icon>
                            </v-list-item-action>
                        </v-list-item>

                        <v-divider
                            v-if="index + 1 < items.length"
                            :key="index"
                        ></v-divider>
                    </template>
                </v-list-item-group>
            </v-list>
        </v-card>
    </v-row>
</template>

<script>
const axios = require('axios');

export default {
    data: () => ({
        selected: [],
        items: []
    }),
    methods: {
        findSelected() {
            this.items.forEach((item, index) => {
                if (item.status == "Send") {
                    this.selected.push(index)
                }
            })
        },
        readNotice(item) {
            const self = this
            const accessToken = this.$store.getters.getToken

            if (item.status == 'Read') {
                this.$router.push('/my-loads/active/' + item.entity_id + '/')
            } else {
                axios({
                    method: 'put',
                    url: self.$store.state.backendUrl + '/backend/api/notifications/' + item.id + '/',
                    data: {
                        status: "Read"
                    },
                    headers: {'Authorization': 'JWT ' + accessToken},
                })
                .then(function (response) {
                    self.$globalEvents.$emit('extraHeartbeat')
                    const entity_id = item.entity_id
                    self.$router.push('/my-loads/active/' + entity_id + '/')
                    console.log(entity_id);
                })
                .catch(function (error) {
                    console.log(error);
                })
            }
        },
        readAll() {
            const self = this
            const accessToken = this.$store.getters.getToken

            axios({
                method: 'post',
                url: self.$store.state.backendUrl + '/backend/api/notifications/update-all',
                data: {},
                headers: {'Authorization': 'JWT ' + accessToken},
            })
            .then(function (response) {
                self.selected = []
                self.$globalEvents.$emit('permissionChecked')
                self.$globalEvents.$emit('extraHeartbeat')
            })
            .catch(function (error) {
                console.log(error);
            });
        }
    },
    created() {
        const self = this

        this.$globalEvents.$on('refreshTokens', () => {
            const accessToken = this.$store.getters.getToken

            axios({
                method: 'get',
                url: self.$store.state.backendUrl + '/backend/api/check-permissions/',
                params: {
                    page: self.$router.history.current.path
                },
                headers: {'Authorization': 'JWT ' + accessToken},
            })
            .then(function (response) {
                console.log(response);
                if (response.data.allow) {
                    self.loaded = true
                    self.$globalEvents.$emit('permissionChecked')
                } else {
                    self.$router.push('/')
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        })

        this.$globalEvents.$on('permissionChecked', () => {
            const accessToken = this.$store.getters.getToken

            if (!accessToken) {
                return
            }

            axios({
                method: 'get',
                url: self.$store.state.backendUrl + '/backend/api/notifications/all/',
                headers: {'Authorization': 'JWT ' + accessToken},
            })
            .then(function (response) {
                self.items = response.data
                self.findSelected()
            })
            .catch(function (error) {
                console.log(error);
            });
        })

    },
    mounted() {
        this.$store.commit('updateToolbarData', {
            title: 'Notifications',
        })
        if(this.$store.getNotifications) {
            this.items = this.$store.getNotifications
        } else {
            this.$globalEvents.$emit('permissionChecked')
        }
        this.$store.commit('updateToolbarData', {
            title: 'Notifications',
            actions: [
                {
                    type: 'icon-text',
                    text: "Read All",
                    icon: 'mdi-pencil-box-outline',
                    action: () => this.readAll(),
                    color: "blue",
                    class: 'blue--text text-capitalize'
                }
            ]
        })
    },
    beforeDestroy() {
        this.$store.commit('updateToolbarData', {})
        this.$globalEvents.$off('refreshTokens')
        this.$globalEvents.$off('permissionChecked')
    },
}
</script>
