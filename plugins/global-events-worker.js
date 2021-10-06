import Vue from 'vue'

const globalEvents = {}

globalEvents.install = function (Vue) {
    Vue.prototype.$globalEvents = new Vue()
}

Vue.use(globalEvents)