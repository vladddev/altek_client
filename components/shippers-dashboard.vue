<template>
    <v-row>
        <v-col cols="4" v-for="card in cards" :key="card.title">
            <v-card>
                <v-card-title>{{ card.title }}</v-card-title>
                <v-card-subtitle>
                    <template v-for="(punkt, index) in card.values">
                        <div :key="index" class="pt-3">
                            <span class="body-2">{{ punkt.title }}:</span>
                            <span class="body-1 font-weight-bold">{{ punkt.count }}</span>
                        </div>
                    </template>
                </v-card-subtitle>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
export default {
    name: 'shippers-dashboard',
    props: ['cards'],
    data() {
        return {
        
        }
    },
}
</script>



