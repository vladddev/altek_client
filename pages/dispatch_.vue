<template>
    <v-row justify="center">
        <v-data-table
            :headers="headers"
            :items.sync="loads"
            :options.sync="options"
            :server-items-length.sync="totalLoads"
            :loading="loading"
            class="elevation-1"
        >
            <template v-slot:item.pickUpAt="{ item }">
                <v-icon v-if="item.pickUpAt.toLowerCase() === 'asap'" color="#ff4700">mdi-fire</v-icon>
                <span v-else>{{ item.pickUpAt }}</span>
            </template>

            <template v-slot:top="{ pagination, options, updateOptions }">
                <v-container>
                    <v-row>
                        <v-col cols="6">
                            <v-row>
                                <v-col cols="4">
                                    <v-select
                                        :items="['Pick-up at', 'Deliver to', 'Vehicle', 'Match', 'Shipper']"
                                        label="Filter column"
                                        v-model="filterColumn"
                                        dense
                                        solo
                                    ></v-select>
                                </v-col>
                                <v-col cols="4">
                                    <v-select
                                        :items="['Equals', 'Does not equal', 'Contains', 'Does not contain', 'Starts with', 'Ends with', 'More than', 'Less than']"
                                        label="Filter type"
                                        v-model="filterType"
                                        dense
                                        solo
                                    ></v-select>
                                </v-col>
                                <v-col cols="3">
                                    <v-text-field dense v-model="filterValue"></v-text-field>
                                </v-col>
                                <v-col cols="1">
                                    <v-btn
                                        class="ma-2"
                                        :loading="loading"
                                        :disabled="loading"
                                        color="secondary"
                                        small
                                        @click="filter()"
                                    >
                                        Refresh
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col cols="5">
                            <v-data-footer
                                :pagination="pagination"
                                :options="options"
                                @update:options="updateOptions"
                                items-per-page-text="$vuetify.dataTable.itemsPerPageText"
                                style="border: 0"/>
                        </v-col>
                    </v-row>
                </v-container>

                <v-dialog v-model="dialog" max-width="800px">
                    <v-card>
                        <v-form @submit.prevent="sendProp(selectedLoad.id)" v-model="valid" ref="sendProp">
                            <v-card-title>
                                <span class="headline">Load details</span>
                            </v-card-title>

                            <v-card-text>
                                <v-container>
                                    <v-row>

                                        <v-col cols="12" sm="6">
                                            <v-text-field :value="selectedLoad.shipper" disabled label="Broker"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                            <v-text-field v-model="newPrice" :disabled="!userCanMakeProposition" required label="Price" type="number"></v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-text-field :value="selectedLoad.pickUpAt" disabled label="From"></v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-text-field :value="selectedLoad.deliverTo" disabled label="To"></v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-text-field :value="selectedLoad.car" disabled label="Preferred transport type"></v-text-field>
                                        </v-col>

                                        <v-col cols="4">
                                            <v-checkbox :input-value="selectedLoad.isDanger" disabled label="Dangerous"></v-checkbox>
                                        </v-col>
                                        <v-col cols="4">
                                            <v-checkbox :input-value="selectedLoad.isUrgent" disabled label="Urgent"></v-checkbox>
                                        </v-col>
                                        <v-col cols="4">
                                            <v-checkbox :input-value="selectedLoad.isCanPutOnTop" disabled label="Stackable"></v-checkbox>
                                        </v-col>

                                    </v-row>
                                </v-container>
                            </v-card-text>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn  color="blue darken-1"
                                    text
                                    :loading="sendLoading"
                                    :disabled="sendLoading"
                                    type="submit"
                                    v-if="userCanMakeProposition"
                                >
                                    Send proposition
                                </v-btn>
                                <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                            </v-card-actions>
                        </v-form>
                    </v-card>
                </v-dialog>

            </template>

            <template v-slot:item.actions="{ item }">
                <v-btn
                    small
                    class="mr-2"
                    @click="open(item)"
                >
                    Info
                </v-btn>
            </template>
        </v-data-table>
    </v-row>
</template>

<script>
    const axios = require('axios');

    export default {
        data () {
            return {
                totalLoads: 0,
                filterType: 'Equals',
                filterValue: '',
                filterColumn: '',
                loads: [],
                valid: true,
                loading: true,
                sendLoading: false,
                dialog: false,
                newPrice: 0,
                userCanMakeProposition: false,
                options: {
                    page: 20
                },
                selectedLoad: {
                    car: '',
                    deliverTo: "",
                    height: 0,
                    id: 0,
                    isCanPutOnTop: false,
                    isDanger: true,
                    isUrgent: false,
                    length: 0,
                    modifiedDateTime: "0000-00-00T00:00:00.00",
                    pickUpAt: "",
                    price: 0,
                    shipper: "",
                    weight: 0,
                    width: 0,
                },
                defaultLoad: {
                    car: '',
                    deliverTo: "",
                    height: 0,
                    id: 0,
                    isCanPutOnTop: false,
                    isDanger: true,
                    isUrgent: false,
                    length: 0,
                    modifiedDateTime: "0000-00-00T00:00:00.00",
                    pickUpAt: "",
                    price: 0,
                    shipper: "",
                    weight: 0,
                    width: 0,
                },
                headers: [
                    { text: 'Received', value: 'modifiedDateTime', align: 'center'},
                    { text: 'Pick-up at', value: 'pickUpAt', align: 'center' },
                    { text: 'Deliver to', value: 'deliverTo', align: 'center' },
                    { text: 'Vehicle', value: 'car', align: 'center' },
                    { text: 'Miles', value: 'miles', align: 'center' },
                    // { text: 'Match', value: 'match', align: 'center' },
                    { text: 'Shipper', value: 'shipper', align: 'center' },
                    { text: 'Bid', value: 'actions', sortable: false, align: 'center' },
                ],
                chatSocket: '',
            }
        },
        watch: {
            options: {
                handler () {
                    if (this.loads.length < 1 ) {
                        return
                    }

                    this.loading = true

                    this.getLoads()
                    .then(data => {
                        const items = this.sortingAll(data)

                        this.loads = items.items
                        this.totalLoads = items.total

                        this.loading = false
                    })
                },
            },
        },
        created () {
            this.$globalEvents.$on('heartbeat', () => {
                this.getLoads()
                .then(data => {
                    const items = this.sortingAll(data)

                    this.loads = items.items
                    this.totalLoads = items.total
                    this.loading = false


                })
            })

            // if (this.loads.length < 1) {
            //     this.$globalEvents.$emit('renewLoads')
            // }

            if (this.$store.getters.getCurrentUser) {
                const user = this.$store.getters.getCurrentUser
                this.userCanMakeProposition = (user.department == 'Shipper' || (user.department == 'Dispatcher' && user.parent_department == 'Shipper') ) ? false : true
            } else {
                this.$globalEvents.$on('renewCurrentUser', () => {
                    const user = this.$store.getters.getCurrentUser
                    this.userCanMakeProposition = (user.department == 'Shipper' || (user.department == 'Dispatcher' && user.parent_department == 'Shipper') ) ? false : true
                })
            }

        },
        mounted() {
            this.connect()
        },
        beforeDestroy() {
            this.$globalEvents.$off('heartbeat')
            this.$globalEvents.$off('renewCurrentUser')
            this.disconnect()
        },
        methods: {
            translateFilterToOption(str) {
                switch (str) {
                    case 'Received':
                        return 'modifiedDateTime'
                        break;
                    case 'Pick-up at':
                        return 'pickUpAt'
                        break;
                    case 'Deliver to':
                        return 'deliverTo'
                        break;
                    case 'Vehicle':
                        return 'car'
                        break;
                    case 'Match':
                        return 'match'
                        break;
                    case 'Shipper':
                        return 'shipper'
                        break;
                    default:
                        return str;
                        break;
                }
            },
            filter() {
                this.loading = true

                this.getLoads()
                .then(data => {
                    const items = this.sortingAll(data)

                    this.loads = items.items
                    this.totalLoads = items.total

                    this.loading = false
                })
            },
            sortingAll (loads) {
                const { sortBy, sortDesc, page, itemsPerPage } = this.options

                let items = loads
                const total = items.length

                // items.forEach(item => {
                //     item.match = item.load_propositions.length
                // });

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

                if (this.filterValue !== '' && this.filterColumn !== '') {
                    const $col = this.translateFilterToOption(this.filterColumn)
                    const $val = this.filterValue

                    switch (this.filterType) {
                        case 'Equals':
                            items = items.filter(item => {
                                return item[$col].toString() == $val
                            })
                            break;
                        case 'Does not equal':
                            items = items.filter(item => {
                                return item[$col].toString() != $val
                            })
                            break;
                        case 'Contains':
                            items = items.filter(item => {
                                return item[$col].toString().includes($val)
                            })
                            break;
                        case 'Does not contain':
                            items = items.filter(item => {
                                return !item[$col].toString().includes($val)
                            })
                            break;
                        case 'Starts with':
                            items = items.filter(item => {
                                return item[$col].toString().startsWith($val)
                            })
                            break;
                        case 'Ends with':
                            items = items.filter(item => {
                                return item[$col].toString().endsWith($val)
                            })
                            break;
                        case 'More then':
                            items = items.filter(item => {
                                return +item[$col] > $val
                            })
                            break;
                        case 'Less then':
                            items = items.filter(item => {
                                return +item[$col] < $val
                            })
                            break;
                        default:
                            break;
                    }
                }


                items.forEach(item => {
                    item.modifiedDateTime = this.$globalFunctions.repairDatetime(item.modifiedDateTime)
                });

                if (itemsPerPage > 0) {
                    items = items.slice((page - 1) * itemsPerPage, page * itemsPerPage)
                }

                return {
                    items,
                    total,
                }

            },
            getLoads () {
                let self = this
                let accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')

                return new Promise((resolve, reject) => {
                    let loads = null;

                    axios({
                        method: 'get',
                        url: self.$store.state.backendUrl + '/backend/api/loads/all/',
                        headers: {'Authorization': 'JWT ' + accessToken},
                    })
                    .then(function (response) {
                        console.log(response);
                        loads = response.data
                        resolve(loads)
                        // self.loading = false;
                    })
                    .catch(function (error) {
                        // self.loading = false;
                        console.log(error);
                    });
                })
            },
            open(item) {
                this.selectedLoad = Object.assign({}, item)
                this.newPrice = this.selectedLoad.price
                this.dialog = true
            },
            close () {
                this.dialog = false
                this.$nextTick(() => {
                    this.selectedLoad = Object.assign({}, this.defaultLoad)
                })
            },
            sendProp(id) {
                if (!this.userCanMakeProposition) {
                    console.log('no permissions');
                    return;
                }

                this.sendLoading = true
                const self = this;
                const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')
                let price = this.newPrice

                this.$refs.sendProp.validate()

                if (this.valid === true) {
                    this.close()
                    axios({
                        method: 'post',
                        url: self.$store.state.backendUrl + '/backend/api/propositions/add/',
                        data: {
                            load: id,
                            price: price
                        },
                        headers: {'Authorization': 'JWT ' + accessToken},
                    })
                    .then(function (response) {
                        console.log(response);
                        // self.userCanMakeProposition = false
                        self.sendLoading = false
                    })
                    .catch(function (error) {
                        self.sendLoading = false
                        console.log(error);
                    });
                }

            },
            connect() {
                const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')
                const self = this

                if (this.chatSocket != '') {
                    return
                }

                this.chatSocket = new WebSocket( 'ws://' + window.location.host + '/ws/all-loads/?access_token=' + accessToken)

                this.chatSocket.onopen = () => {
                    this.chatSocket.onmessage = ({data}) => {
                        console.log(data)

                        this.loading = true

                        const load = JSON.parse(data)


                        this.loads.splice(0, 0,
                            {
                                "id": load.id,
                                "shipper": load.shipper,
                                "load_propositions": load.load_propositions,
                                "modifiedDateTime": self.$globalFunctions.repairDatetime(self.load.modifiedDateTime),
                                "removedDateTime": null,
                                "pickUpAt": load.pickUpAt,
                                "deliverTo": load.deliverTo,
                                "width": load.width,
                                "height": load.height,
                                "length": load.length,
                                "weight": load.weight,
                                "price": load.price,
                                "car": load.car,
                                "isDanger": load.isDanger,
                                "isUrgent": load.isUrgent,
                                "isCanPutOnTop": load.isCanPutOnTop,
                                "status": "In search",
                                "carrier": load.carrier
                            }
                        )
                        const items = this.sortingAll(this.loads)

                        this.loads = items.items
                        this.totalLoads++
                        this.loading = false

                    };
                    this.chatSocket.onclose = function (err){
                        console.log(err)
                    }
                    this.chatSocket.onerror = function(error) {
                        console.log('WebSocket Error: ' + error);
                    }
                };
            },
            disconnect() {
                this.chatSocket.close()
            },
        },
    }
</script>
