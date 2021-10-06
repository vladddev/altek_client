<template>
    <v-row justify="center">
        <v-col cols="12">
            <v-form ref="form" v-model="valid" @submit.prevent="saveChanges">
                <v-row>
                    <v-col cols="3">
                        <v-card class="pt-4 mb-4">
                            <v-img
                                :src="prefillUrl"
                                width="250"
                                height="250"
                            ></v-img>
                        </v-card>
                        <v-card>
                            <v-card-title>User online history</v-card-title>
                            <v-container fluid>
                                <canvas ref="chart" width="300" height="200"></canvas>
                            </v-container>
                        </v-card>
                    </v-col>
                    <v-col cols="5">
                        <v-card class="mb-4">
                            <v-card-text>
                                ID: #{{ user.id }} <br>
                                Email: {{ user.email }} <br>
                                Firstname: {{ user.first_name ? user.first_name : '...' }} <br>
                                Lastname: {{ user.last_name ?  user.last_name : '...' }} <br>
                                Phone number: {{ user.phone_number ? user.phone_number : '...' }} <br>
                                Address: {{ user.address ? user.address : '...' }} <br>
                                Last online: {{ user.last_online ? user.last_online : '...' }}
                            </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="4">
                        <v-card class="mb-4">
                            <v-card-title>
                                Added by {{ user.added_by ? user.added_by.email : 'self' }} on {{ $globalFunctions.repairDatetime(user.date_joined) }}
                            </v-card-title>
                        </v-card>
                    </v-col>
                </v-row>
            </v-form>
        </v-col>
    </v-row>
</template>

<script>
import PictureInput from 'vue-picture-input'
import Chart from 'chart.js'


const axios = require('axios');

export default {
    data() {
        return {
            valid: true,
            loading: false,
            avatar: '',
            prefillUrl: '',
            onlineLog: [],
            user: {},
            emailRules: [
                v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
                v => !!v || 'This field is required',
            ],
            requiredRules: [
                v => !!v || 'This field is required',
            ],
        }
    },
    methods: {
        imageUpload(avatar) {
            if (avatar) {
                this.avatar = this.$refs.pictureInput.file
            } else {
                console.log('FileReader API not supported: use the <form>')
            }
        },
        saveChanges() {
            const self = this;
            const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')
            const id = this.$route.params.id
            this.$refs.form.validate()

            if (this.valid === true) {
                this.loading = true;

                axios({
                    method: 'put',
                    url: self.$store.state.backendUrl + '/backend/api/users/' + id + '/',
                    data: self.user,
                    headers: {'Authorization': 'JWT ' + accessToken},
                })
                .then(function (response) {
                    console.log(response);
                    self.user = response.data
                    self.loading = false;
                })
                .catch(function (error) {
                    self.loading = false;
                    console.log(error);
                });

            }
        },
        spliceDataToChart(now) {
            let dataArray = []
            let colorsArray = []
            let statusesArray = []

            if (this.onlineLog.length == 1) {
                dataArray.push(1)
                statusesArray.push('Offline for las 24 hours')
                colorsArray.push('#F44336')
            } else {
                this.onlineLog.forEach((item, index) => {
                    if (index != 0) {
                        let timeInStatus = item.timestamp - this.onlineLog[index - 1].timestamp
                        let timeFromTo = this.formatTime(new Date(this.onlineLog[index - 1].realStamp * 1000)) +
                                        ' - ' +
                                        this.formatTime(new Date(item.realStamp * 1000))

                        dataArray.push(timeInStatus)
                        statusesArray.push((item.isOnline ? 'Online: ' : 'Offline: ') + timeFromTo)
                        colorsArray.push(item.isOnline ? '#4caf50' : '#F44336')
                    }
                })
            }

            return {
                dataArray,
                statusesArray,
                colorsArray,
            }
        },
        formatTime(date) {
            return date.getHours() + ':' + date.getMinutes()
        }
    },
    created() {
        const self = this
        const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')
        const id = this.$route.params.id
        // const id = 3
        const onlineLog = this.onlineLog

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/users/' + id,
            headers: {'Authorization': 'JWT ' + accessToken},
        })
        .then(function (response) {
            console.log(response);
            self.user = response.data
            if (!self.user.avatar) {
                self.user.avatar = self.$store.getters.getDefaultAvatar
            }
            // self.loading = false;
        })
        .catch(function (error) { console.log(error); });

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/users/' + id + '/online/',
            headers: {'Authorization': 'JWT ' + accessToken},
        })
        .then(function (response) {

            console.log(response);
            const log = response.data
            const logLength = log.length
            const now = Math.round(Date.now() / 1000)
            const dayAgo = now - 3600 * 24
            const sigma = 70

            if (log[logLength - 1] < dayAgo) {
                onlineLog.push({
                    timestamp: 1,
                    isOnline: false
                })
            } else {
                for (let i = 0; i < logLength; i++) {
                    if (i == 0) {
                        let onlineStatus = false

                        if ( (log[0] - dayAgo) < sigma ) { // чтобы следующий имел верный статус
                            onlineStatus = true
                        } else {
                            onlineStatus = false
                        }

                        onlineLog.push({
                            timestamp: 0,
                            realStamp: log[0],
                            isOnline: onlineStatus
                        })
                    } else {
                        let lastStatus = onlineLog[onlineLog.length - 1].isOnline

                        if ( (log[i] - log[i - 1]) > sigma ) {
                            onlineLog.push({
                                timestamp: log[i] - dayAgo,
                                realStamp: log[i],
                                isOnline: !lastStatus
                            })
                        }

                    }
                }
                onlineLog.push({
                    timestamp: now - dayAgo,
                    realStamp: log[logLength - 1],
                    isOnline: (now - log[logLength - 1]) < (sigma * 2)
                })

                console.log(onlineLog);
            }


            // console.log(onlineLog);


            let {dataArray, statusesArray, colorsArray} = self.spliceDataToChart.call(self, now)

            const chart = new Chart(self.$refs.chart, {
                type: 'pie',
                data: {
                    datasets: [{
                        data: dataArray,
                        backgroundColor: colorsArray,
                        borderWidth: 0,
                    }],
                    labels: statusesArray
                },
                options: {
                    legend: {
                        display: false,
                    }
                }
            })

        })
        .catch(function (error) {
            // self.loading = false;
            console.log(error);
        });
    },
    beforeDestroy() {
    },
    components: {
        PictureInput
    },
}

</script>
