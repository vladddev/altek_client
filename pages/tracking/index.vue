<template>
    <div class=""></div>
</template>

<script>
    const axios = require('axios');

    export default {
        layout: 'tracking',
        data: () => ({
            searchField: '',
            valid: true,
            loading: false
        }),
        methods: {
            search() {
                this.$router.push('/tracking/' + this.searchField + '/')
            }
        },
        created() {
            
        },
        middleware: 'tracking'
    }

</script>
