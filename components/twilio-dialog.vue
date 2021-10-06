<template>
    <div style="display: none">
        <script ref="twilioScript" src="https://sdk.twilio.com/js/client/v1.10/twilio.js"></script>
        <div class="twilio_call_widget">
            <h1 class="twilio_widget_logo">Altek</h1>
            <div class='input_block_'>
                <span>Phone Number</span>
                <input class="form-control twilio_call_widget_input" type="text">
                <button class="btn btn-success call_button_widget_call_twilio">Call</button>
            </div>
            <div class="twilio_status_block">
                <span>Status : </span>
            <span class="twilio_status"></span><br>
            </div>
            <button  class="answer btn btn-success">Answer</button>
            <button  class="hangup btn btn-danger">Hang Up</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'twilio-dialog',
    data() {
        return {

        }
    },
    methods: {

    },
    mounted() {
        const self = this

        this.$refs.twilioScript.onload = () => {
            self.$globalEvents.$on('callTo', ($event, number) => {
                const params = {"phoneNumber": $event};
                Twilio.Device.connect(params);
            })

            fetch(`https://sms.green-node.ru/token/${this.$store.getters.getCurrentUser.id}`)
                .then((res)=>res.json())
                .then((data) => {Twilio.Device.setup(data.token)})

            // Когда звоннок принят- отсальные отключаются
            Twilio.Device.cancel((connect) => {
                connect.disconnect()
            })
            // Отлключение во время разговора
            Twilio.Device.disconnect((connect) => {
                console.log('Disconnect')
            })

            // Приложение загружено
            Twilio.Device.ready((connect) => {
                console.log('Ready')
            })
            // Ошибка в прилжении
            Twilio.Device.error(() => {
                // Если ошибка - перезапустим страницу
                window.location.reload()
            })
        }


    },
    beforeDestroy() {
        this.$globalEvents.$off('callTo')
    }
}
</script>
