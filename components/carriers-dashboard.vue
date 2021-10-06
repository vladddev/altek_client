<template>
    <v-row>
        <v-col cols="9">
            <v-row>
                <v-col cols="9">
                    <v-data-table
                        :headers="headers"
                        :items="cards.my_users_stats.my_workers"
                        class="elevation-1"
                        item-key="name">

                        <template v-slot:item.bids_count="{ item }">
                            <span>{{ item.user_propositions.length }}</span>
                        </template>

                        <template v-slot:item.gross="{ item }">
                            <span>{{ summ(item.user_propositions, 'price') }}</span>
                        </template>

                        <template v-slot:item.profit="{}">
                            <span>0</span>
                        </template>

                        <template v-slot:item.percents="{}">
                            <span>0</span>
                        </template>

                    </v-data-table>
                </v-col>
                <v-col cols="3">
                    <v-card>
                        <v-card-title>Issues for orders</v-card-title>
                        <v-card-subtitle>
                            <div class="pt-3">
                                <span class="body-2">Success:</span>
                                <span class="body-1 font-weight-bold">{{ cards.my_loads_stats.success }}</span>
                            </div>
                            <div class="pt-3">
                                <span class="body-2">Damaged:</span>
                                <span class="body-1 font-weight-bold">{{ cards.my_loads_stats.damaged }}</span>
                            </div>
                            <div class="pt-3">
                                <span class="body-2">Late:</span>
                                <span class="body-1 font-weight-bold">{{ cards.my_loads_stats.late }}</span>
                            </div>
                            <div class="pt-3">
                                <span class="body-2">Cancelled:</span>
                                <span class="body-1 font-weight-bold">{{ cards.my_loads_stats.cancelled }}</span>
                            </div>
                        </v-card-subtitle>
                    </v-card>
                </v-col>
                <v-col cols="12">
                    <v-card>
                        <v-card-title>Active dispatchers: {{ cards.my_users_stats.users_online.length == 0 ? "none" : "" }}</v-card-title>
                        <v-row>
                            <v-col cols="6" v-for="(user, index) in cards.my_users_stats.users_online"  :key="index">
                                <v-list two-line>
                                    <v-list-item
                                        ripple
                                        @click="openChat(user.id)"
                                    >
                                        <v-list-item-avatar>
                                            <v-img :src="user.avatar ? user.avatar : $store.getters.getDefaultAvatar"></v-img>
                                        </v-list-item-avatar>
                                        <v-list-item-content>
                                            <v-list-item-title>{{ (index + 1) + '. ' +user.full_name }}</v-list-item-title>
                                            <v-list-item-subtitle>Bids: {{ user.user_propositions.length }}</v-list-item-subtitle>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list>
                            </v-col>
                        </v-row>
                    </v-card>
                </v-col>
            </v-row>
        </v-col>
        <v-col cols="3">
            <v-row>
                <!-- <v-col cols="12">
                    <v-card>
                        <v-card-title>Bids by user:</v-card-title>
                        <v-card-subtitle></v-card-subtitle>
                    </v-card>
                </v-col> -->
                <v-col cols="6">
                    <v-card>
                        <v-card-title class="subtitle-2">In progress:</v-card-title>
                        <v-card-subtitle>
                            <template v-for="(punkt, index) in inProgressLoads">
                                <div :key="index">
                                    <span class="body-2">{{ punkt.title }}:</span>
                                    <span class="body-1 font-weight-bold">{{ punkt.count }}</span>
                                </div>
                            </template>
                        </v-card-subtitle>
                    </v-card>
                </v-col>
                <v-col cols="6">
                    <v-card>
                        <v-card-title class="subtitle-2">Total:</v-card-title>
                        <v-card-subtitle class="display-1">
                            {{ cards.my_loads_stats.all }}
                        </v-card-subtitle>
                    </v-card>
                </v-col>
                <v-col cols="6">
                    <v-card>
                        <v-card-text class="overline">
                           In progress
                        </v-card-text>
                        <v-card-subtitle>
                            <template v-for="(punkt, index) in cards.my_vehicles_stats.in_progress">
                                <div :key="index">
                                    <span class="body-2">{{ punkt.title }}:</span>
                                    <span class="body-1 font-weight-bold">{{ (punkt.count === 0 || cards.my_vehicles_stats.total === 0) ? 0 : Math.round(punkt.count / cards.my_vehicles_stats.total * 100) }}%</span>
                                </div>
                            </template>
                        </v-card-subtitle>
                    </v-card>
                </v-col>
                <v-col cols="6">
                    <v-card>
                        <v-card-text class="overline">
                           Out-of-service
                        </v-card-text>
                        <v-card-subtitle>
                            <template v-for="(punkt, index) in cards.my_vehicles_stats.out_of_service">
                                <div :key="index">
                                    <span class="body-2">{{ punkt.title }}:</span>
                                    <span class="body-1 font-weight-bold">{{ (punkt.count === 0 || cards.my_vehicles_stats.total === 0) ? 0 : Math.round(punkt.count / cards.my_vehicles_stats.total * 100) }}%</span>
                                </div>
                            </template>
                        </v-card-subtitle>
                    </v-card>
                </v-col>
                <v-col cols="6">
                    <v-card>
                        <v-card-text class="overline">
                            Available
                        </v-card-text>
                        <v-card-title class="headline">{{ Math.round(cards.my_vehicles_stats.available / cards.my_vehicles_stats.total * 100) }}%</v-card-title>
                    </v-card>
                </v-col>
                <v-col cols="6">
                    <v-card>
                        <v-card-text class="overline">
                            Total
                        </v-card-text>
                        <v-card-title class="headline">{{ cards.my_vehicles_stats.total }}</v-card-title>
                    </v-card>
                </v-col>
            </v-row>
        </v-col>
        <v-dialog v-model="dialog" max-width="600px" @click:outside="clear()">
            <v-card>
                <v-card-title>
                    <span class="headline">Write your message</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12">
                                <v-form @submit.prevent="sendMessage()">
                                    <v-row>
                                        <v-col class="py-0">
                                            <v-textarea
                                                v-model="message"
                                                dense
                                                outlined
                                                label="Write your message here"
                                                auto-grow
                                                rows="5"
                                            ></v-textarea>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col class="py-0" cols="12">
                                            <v-btn
                                                @click="dialog = false"
                                            >
                                                Cancel
                                            </v-btn>
                                            <v-btn
                                                class="ma-0 ml-auto submit"
                                                color="secondary"
                                                type="submit"
                                                :disabled="loading"
                                                :loading="loading"
                                            >
                                                Send
                                            </v-btn>
                                        </v-col>
                                    </v-row>
                                </v-form>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script>
const axios = require('axios')

export default {
    name: 'carriers-dashboard',
    props: ['cards'],
    data() {
        return {
            dialog: false,
            loading: false,
            targetUser: 0,
            message: '',
            inProgressLoads: [
                {
                    'title': '0 - 24 hours',
                    'count': 0
                },
                {
                    'title': '24 - 48 hours',
                    'count': 0
                },
                {
                    'title': '48 - 72 hours',
                    'count': 0
                },
                {
                    'title': '72+ hours',
                    'count': 0
                },
            ],
            headers: [
                {
                    text: 'Name',
                    align: 'center',
                    value: 'full_name',
                },
                {
                    text: 'Bids',
                    align: 'center',
                    value: 'bids_count',
                },
                {
                    text: 'Gross',
                    align: 'center',
                    value: 'gross',
                },
                {
                    text: 'Profit',
                    align: 'center',
                    value: 'profit',
                },
                {
                    text: '%',
                    align: 'center',
                    value: 'percents',
                },
            ],
        }
    },
    computed: {
    },
    methods: {
        summ(parent, el) {
            let output = 0
            parent.forEach(item => {
                output += item[el]
            })

            return output
        },
        openChat(id) {
            this.targetUser = id
            this.dialog = true
        },
        clear() {
            this.targetUser = 0
            this.loading = false
            this.message = ''
        },
        sendMessage() {
            const self = this
            let accessToken = this.$store.getters.getToken

            this.loading = true

            axios({
                method: 'post',
                url: self.$store.state.backendUrl + '/backend/api/chat-message/',
                data: {
                    content: self.message,
                    user_to: self.targetUser
                },
                headers: {'Authorization': 'JWT ' + accessToken},
            })
            .then(function (response) {
                console.log(response);
                self.dialog = false
                self.targetUser = 0
                self.loading = false
                self.message = ''
            })
            .catch(function (error) {
                console.log(error);
            });
        },
        sortLoads() {
            this.cards.my_loads_stats.loads_in_progress.forEach(load => {
                const loadDurationInHours = Math.floor(load.process_duration / 3600)
                
                if (loadDurationInHours < 24) {
                    this.inProgressLoads[0].count++
                } else if(loadDurationInHours < 48) {
                    this.inProgressLoads[1].count++
                } else if(loadDurationInHours < 72) {
                    this.inProgressLoads[2].count++
                } else {
                    this.inProgressLoads[3].count++
                }
            });
        }
    },
    created() {
        this.sortLoads()
    },
}
</script>



