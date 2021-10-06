<template>
    <v-card
        outlined
        flat
    >
        <v-list-item three-line class="px-3">
            <v-list-item-content class="py-2">
                <v-card-title class="subtitle-1 pa-1">{{ content.author }}</v-card-title>
                <v-card-text class="body-2 pa-1">{{ content.text }}</v-card-text>
                <v-card-subtitle class="caption pa-1">{{ content.time }}</v-card-subtitle>
            </v-list-item-content>
        </v-list-item>
    </v-card>
</template>

<script>
export default {
    name: 'chatMessage',
    props: [
        'content'
    ]
}
</script>