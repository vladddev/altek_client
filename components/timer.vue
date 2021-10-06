<template>
      <span :class="textClass" class="abs-center time">
        {{ (time.h) ? (time.h) + ':' : '' }}{{ (time.m > 9) ? time.m : '0' + time.m }}:{{ (time.s > 9) ? time.s : '0' + time.s }}
      </span>
</template>

<script>
export default {
  name: 'timer',
  props: ['updateFunc', 'textClass'],
  data() {
    return {
      // timer: (this.time.h) ? (this.time.h) + ':' : '' + (this.time.m > 9) ? this.time.m : '0' + this.time.m + ':' + (this.time.s > 9) ? this.time.s : '0' + this.time.s,
      time: {
        h: 0,
        m: 0,
        s: 0,
      },
      status: 'stop',
      interval: null,
    }
  },
  methods: {
    reset: function () {
      clearInterval(this.interval)
      this.time = {
        h: 0,
        m: 0,
        s: 0,
      }
    },
    start: function () {
      this.status = 'play'
      this.interval = setInterval(this.ping, 1000);
    },
    stop: function () {
      this.status = 'stop'
      clearInterval()
    },
    ping: function () {
      if(this.status === 'play') {
        this.time.s++;
        if (this.time.s > 59) {
          this.time.s = 0;
          this.time.m++;
        }
        if (this.time.m > 59) {
          this.time.m = 0;
          this.time.h++;
        }
      }
    },
  },
  watch: {
    time: {
      handler: function (val) {
        this.updateFunc((val.h ? val.h + ':' : '') + (val.m > 9 ? val.m : '0' + val.m) + ':' + (val.s > 9 ? val.s : '0' + val.s))
      },
      deep: true
    }
  },
  created() {
    const self = this
    this.$globalEvents.$on('phoneTimer', function (action) {
      alert(action)
      if(action==='start') {
        self.start()
      }else if(action === 'stop') {
        self.stop()
      }else if(action === 'reset') {
        self.reset()
      }
    })
    this.start()
  },
}
</script>



