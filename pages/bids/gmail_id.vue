<template>
    <v-card :loading="loading">
       <v-container>
           <v-row>
               <script ref="apiScript" src="https://apis.google.com/js/api.js"></script>
               <v-col cols="4">
                    <v-card-text>
                        <load-map
                            :locData="mapData"
                        ></load-map>
                    </v-card-text>
                    <v-card-text class="subtitle-2">
                        Broker price: <span class="px-1 font-weight-bold body-1"> {{ loadData.broker_price }} </span> <br>
                        Driver price: <span class="px-1 font-weight-bold body-1"> {{ loadData.driver_price }} </span> <br>
                        Pick-up at: <span class="px-1 font-weight-bold body-1"> {{ loadData.pickUpAt }} </span> <br>
                        Deliver to: <span class="px-1 font-weight-bold body-1"> {{ loadData.deliverTo }} </span> <br>
                        Weight: <span class="px-1 font-weight-bold body-1"> {{ loadData.weight }} </span> <br>
                        Length: <span class="px-1 font-weight-bold body-1"> {{ loadData.length }} </span> <br>
                        Height: <span class="px-1 font-weight-bold body-1"> {{ loadData.height }} </span> <br>
                        Width: <span class="px-1 font-weight-bold body-1"> {{ loadData.width }} </span> <br>
                        Price: <span class="px-1 font-weight-bold body-1"> {{ loadData.price == 0 ? 'Best price' : loadData.price }} </span> <br>
                        Preferred transport type: <span class="px-1 font-weight-bold body-1"> {{ loadData.car }} </span> <br>
                        Dangerous: <span class="px-1 font-weight-bold body-1"> {{ loadData.isDanger ? 'Yes' : 'No' }} </span> <br>
                        Urgent: <span class="px-1 font-weight-bold body-1"> {{ loadData.isUrgent ? 'Yes' : 'No' }} </span> <br>
                        Stackable: <span class="px-1 font-weight-bold body-1"> {{ loadData.isCanPutOnTop ? 'Yes' : 'No' }} </span> <br>
                        <template v-if="loadData.note">
                            NOTE: <span class="px-1 font-weight-bold body-1"> {{ loadData.note }} </span> <br>
                        </template>
                        <div v-html="loadData.mail_part"></div>
                    </v-card-text>
                </v-col>
                <v-col cols="8">
                    <v-row v-if="gmailAccess === false" justify="center">
                        <v-btn
                        color="green"
                        dark
                        @click="gmailSignIn"
                        >Sign in</v-btn>
                    </v-row>
                    <v-row v-if="gmailAccess === true">
                        <v-col cols="12">
                            <v-row>
                                <v-btn
                                color="red"
                                dark
                                @click="gmailSignOut"
                                >Sign out</v-btn>
                                <p class="font-weight-regular pl-3">{{gmailData.emailAdress}}</p>
                                <p class="font-weight-regular pl-3">></p>
                                <v-text-field
                                v-model="msgToModel"
                                ></v-text-field>
                            </v-row>
                        </v-col>
                    </v-row>
                    <v-row v-if="gmailAccess === true">
                        <v-col cols="12">
                             <v-card
                                outlined
                                flat
                                class="mb-3"
                            >
                                <v-list-item three-line class="px-3">
                                    <v-list-item-icon>
                                        <v-icon color="green" v-text="'mdi-arrow-right-bold-circle'"></v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content class="py-2">
                                        <v-card-title class="subtitle-1 pa-1">assa@gmail.com</v-card-title>
                                        <!-- <v-card-text class="body-2 pa-1">Snippet snippet snippet snippet</v-card-text> -->
                                        <v-card-subtitle class=" pa-1">Snippet snippet snippet snippet</v-card-subtitle>
                                        <v-card-subtitle class="caption pa-1">14.03.2020</v-card-subtitle>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-card>
                             <v-card
                                outlined
                                flat
                            >
                                <v-list-item three-line class="px-3">
                                    <v-list-item-icon>
                                        <v-icon color="blue" v-text="'mdi-arrow-left-bold-circle'"></v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content class="py-2">
                                        <v-card-title class="subtitle-1 pa-1">assa@gmail.com</v-card-title>
                                        <!-- <v-card-text class="body-2 pa-1">Snippet snippet snippet snippet</v-card-text> -->
                                        <v-card-subtitle class=" pa-1">Snippet snippet snippet snippet</v-card-subtitle>
                                        <v-card-subtitle class="caption pa-1">14.03.2020</v-card-subtitle>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-card>
                        </v-col>
                    </v-row>
                    <v-row v-if="gmailAccess === true">
                        <v-col>
                            <form v-on:submit.prevent="sendMessage">
                                <v-text-field
                                outlined
                                :append-icon="'mdi-send'"
                                v-model="msgTextModel"
                                @click:append="sendMessage"
                                label="Message"
                                >
                                </v-text-field>
                            </form>
                        </v-col>
                    </v-row>
                </v-col>
           </v-row>
       </v-container>
    </v-card>
</template>

<script>

import loadMap from '@/components/maps/load-map'

const axios = require('axios')

export default {
    data() {
        return {
            loading: false,
            bidData: {},
            loadData: {},
            gmailAccess: '',
            mapData: {
                startLoc: '',
                endLoc: ''
            },
            gmailData: {
                emailAdress: ""
            },
            msgToModel: '',
            msgTextModel: ''
        }
    },
    mounted() {
        this.loading = true

        this.$store.commit('changeCurrentPageTitle', 'Bid #' + this.$route.params.id)
        this.$store.commit('updatePageAdvButtons', [
            {type: 'icon-text', text: "Logs", icon:'mdi-information-outline', action: this.sendMessage, class: 'blue--text text-capitalize'},
            {type: 'icon-text', text: "Post shipment", icon:'mdi-send', action: this.sendMessage, class: 'blue--text text-capitalize'},
            {type: 'icon-text', text: "Assign Shipment", icon:'mdi-checkbox-marked-outline', action: this.sendMessage, class: 'blue--text text-capitalize'},
            {type: 'icon-text', text: "Email Notifications", icon:'mdi-email-outline', action: this.sendMessage, class: 'blue--text text-capitalize'},
            {type: 'icon', icon:'mdi-dots-horizontal', action: this.sendMessage, class: 'blue--text text-capitalize'},
        ])

        const self = this

        var CLIENT_ID = '212635591662-rgnre9i03io2qkf528uk0hs1o4e8eejh.apps.googleusercontent.com';
        var API_KEY = '4AVzoqsvALbrITkNZdm3g4Hw';

        var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];

        var SCOPES = 'https://www.googleapis.com/auth/gmail.modify';

        this.$refs.apiScript.onload = () => {
            gapi.load('client:auth2', function() {
            gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: DISCOVERY_DOCS,
                scope: SCOPES
                }).then(function () {

                // Listen for sign-in state changes.
                gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

                // Handle the initial sign-in state.
                updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
                }, function(error) {
                    console.log(error);
                });
            });
        }


        /**
         *  Called when the signed in status changes, to update the UI
         *  appropriately. After a sign-in, the API is called.
         */
        function updateSigninStatus(isSignedIn) {
            if (isSignedIn) {
            self.gmailAccess = true
            } else {
            self.gmailAccess = false
            }
        }
    },
    watch: {
        'loadData.reply_email': function(newVal, oldVal) {
            if(newVal != ''){
                if (this.gmailAccess) {

                    const self = this

                    console.log(gapi.client.gmail);

                    gapi.client.gmail.users.getProfile({
                    'userId': 'me',

                    }).then(function(response) {
                        self.gmailData = {
                            emailAdress: response.result.emailAddress
                        }
                        self.msgToModel = self.loadData.reply_email
                    });


                    // gapi.client.gmail.users.messages.list({
                    // 'userId': 'me',
                    // 'q': 'subject:Как заработать с AliExpress на 11.11?'
                    // }).then(function(response) {

                    // console.log(response.result);

                    // });
                }
            }
        }
    },
    methods: {
        gmailSignIn() {
            gapi.auth2.getAuthInstance().signIn();
        },
        gmailSignOut() {
            gapi.auth2.getAuthInstance().signOut();
        },
        sendMessage() {

            alert(this.sendMessage)

            // gapi.client.gmail.users.messages.send({
            // 'userId': 'pusik431@gmail.com',
            // raw
            // }).then(function(response) {
            //     console.log(response);
            // });

            this.msgTextModel = ''
        }
    },
    created() {
        alert('tutt')
        const self = this
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/propositions/' + self.$route.params.id,
            headers: {'Authorization': 'JWT ' + accessToken},
        })
        .then(function (response) {

            self.bidData = response.data

            axios({
                    method: 'get',
                    url: self.$store.state.backendUrl + '/backend/api/loads/' + self.bidData.load,
                    headers: {'Authorization': 'JWT ' + accessToken},
                })
                .then(function (response) {
                    self.loadData = response.data.load_data;

                    self.mapData = {
                        startLoc: response.data.location_data.load_start_coords,
                        endLoc: response.data.location_data.load_end_coords
                    }

                    self.loading = false
                })
                .catch(function (error) {
                    console.log(error);
                });
        })
        .catch(function (error) {
            console.log(error);
        });

    },
    beforeDestroy() {
        this.$store.commit('updatePageAdvButtons', [])
    },
    components: {
        loadMap
    },
}

</script>

<style lang="css" scoped>
    .chat-content {
        border: 1px solid silver;
    }
</style>
