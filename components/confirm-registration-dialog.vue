<template>
    <v-dialog
        v-model="dialog"
        fullscreen
        hide-overlay
        class="pa-10"
    >
        <v-card v-if="dialogData.req_status == 'None' && !requestSended">
            <v-item-group mandatory v-model="department">
                <v-container>
                    <v-row>
                        <v-col
                            v-for="(card, index) in cards"
                            :key="index"
                            cols="12"
                            md="4"
                        >
                            <v-item v-slot:default="{ active, toggle }">
                                <v-card
                                :color="active ? 'primary' : 'secondary'"
                                class="d-flex align-center"
                                dark
                                height="200"
                                @click="toggle"
                                >
                                <v-scroll-y-transition>
                                    <div
                                    class="display-3 flex-grow-1 text-center"
                                    color="#fff"
                                    >
                                    {{ card.title }}
                                    </div>
                                </v-scroll-y-transition>
                                </v-card>
                            </v-item>
                        </v-col>
                        <v-col cols='12' v-if="showOwnersSelect">
                             <v-card-text>
                                <v-autocomplete
                                    v-model="userOwner"
                                    :items="owners"
                                    :loading="ownersLoading"
                                    color="white"
                                    hide-no-data
                                    item-text="company"
                                    item-value="id"
                                    label="Select your manager"
                                    placeholder="Start typing to search"
                                    prepend-icon="mdi-search"
                                    @change="selectOwner"
                                ></v-autocomplete>
                            </v-card-text>
                        </v-col>
                    </v-row>
                </v-container>
            </v-item-group>
            <v-card-actions>
                <v-btn
                    @click="$router.push('/login/')"
                >
                    Back to login
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                    :disabled="!canSubmit"
                    color="primary"
                    @click="sendRequest"
                >
                    Send request
                </v-btn>
            </v-card-actions>
        </v-card>
        <v-card v-if="dialogData.req_status == 'Send' || requestSended">
            <v-container>
                <v-row>
                    <v-col cols="12">
                        <v-card-title>
                            Hello, {{ dialogData.first_name }}!
                        </v-card-title>
                        <v-card-text>
                            Your request is under review
                        </v-card-text>
                    </v-col>
                    <v-col cols="12">
                        <v-btn
                            @click="$router.push('/login/')"
                        >
                            Back to login
                        </v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </v-dialog>
</template>


<script>
const axios = require('axios');

export default {
    name: 'confirmRegistrationDialog',
    props: {
        dialogData : Object,
        dialog: Boolean
    },
    watch: {
        department() {
            if (this.cards[this.department].hasSelect) {
                this.showOwnersSelect = true

                if (this.userOwner == '') {
                    this.canSubmit = true
                }

                this.loadOwners()
            } else {
                this.showOwnersSelect = false
                this.canSubmit = true
            }
        }
    },
    data() {
        return {
            canSubmit: true,
            cards: [
                {
                    title: 'Carrier',
                    hasSelect: false
                },
                {
                    title: 'Shipper',
                    hasSelect: false
                },
                {
                    title: 'Dispatcher',
                    hasSelect: true
                },
            ],
            owners: [],
            department: null,
            showOwnersSelect: false,
            ownersLoading: false,
            userOwner: '',
            requestSended: false
        }
    },
    methods: {
        sendRequest() {
            const token = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token');
            const self = this

            this.ownersLoading = true

            axios({
                method: 'post',
                url: self.$store.state.backendUrl + '/backend/api/users/requests/add/',
                headers: {'Authorization': 'JWT ' + token},
                data: {
                    target_department: self.cards[this.department].title,
                    resp_user: self.userOwner
                }
            })
            .then(function (response) {
                console.log(response);
                self.requestSended = true
            }) .catch(function (error) { console.log(error); });
        },
        loadOwners() {
            const token = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token');
            const self = this

            this.ownersLoading = true

            axios({
                method: 'get',
                url: self.$store.state.backendUrl + '/backend/api/users/firms/',
                headers: {'Authorization': 'JWT ' + token},
            })
            .then(function (response) {
                console.log(response);
                self.owners = response.data
                self.ownersLoading = false
            }) .catch(function (error) { console.log(error); });
        },
        selectOwner() {
            if (this.userOwner != '') {
                this.canSubmit = true
            } else {
                this.canSubmit = false
            }
        }
    },

}
</script>
