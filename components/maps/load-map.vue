<template>
  <div ref="loadMap" style="width:100%; height:300px"></div>
</template>

<script>

const {Loader} = require('google-maps');
import gmapStyle from '~/assets/gmap-style'

let map = ''
let gm = ''
let markers = []

export default {
  name: 'load-map',
  props: {
    locData: {
      type: Object,
      required: true
    },
  },
  watch: {
    locData: {
      handler: function (newVal, oldVal) {


        if (!this.$props.locData.startLoc || !this.$props.locData.endLoc) {
          // alert("Incorrect load location")
          return
        }

        var startLoc = newVal.startLoc.split(',');
        var endLoc = newVal.endLoc.split(',');

        this.setWaypoints(startLoc, endLoc);

      },
      deep: true
    },
  },
  data() {
    return {
      directionsService: {},
      directionsRenderer: {}
    }
  },
  created() {

    var startLoc = this.$props.locData.startLoc.split(',');
    var endLoc = this.$props.locData.endLoc.split(',');

    const self = this

    const loader = new Loader(this.$store.getters.getGmapApiKey);

    loader.load().then(function (google) {

      gm = google;

      map = new google.maps.Map(self.$refs.loadMap, {styles: gmapStyle});

      self.directionsService = new google.maps.DirectionsService();
      self.directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true});

      if (startLoc.length === 2 && endLoc.length === 2) {
        self.setWaypoints(startLoc, endLoc);
      }
    });
  },
  methods: {
    setWaypoints: function (startLoc, endLoc, waypts = []) {

      var startLoc = {lat: parseFloat(startLoc[0]), lng: parseFloat(startLoc[1])}
      var endLoc = {lat: parseFloat(endLoc[0]), lng: parseFloat(endLoc[1])}

      this.removeMarkers()

      this.createMarker(startLoc, '1')
      this.createMarker(endLoc, '2')

      this.directionsRenderer.setMap(map);

      this.directionsService.route(
        {
          origin: startLoc,
          destination: endLoc,
          waypoints: waypts,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === "OK") {
            this.directionsRenderer.setDirections(response);
          } else {
            window.alert("Directions request failed due to " + status);
          }
        }
      );
    },
    removeMarkers() {
      if (markers.length > 0){
        markers.forEach(function (val, index) {
          val.setMap(null)
        })
      }
    },
    createMarker(loc, label) {

      markers.push(
        new google.maps.Marker({
          position: loc,
          label: {
            text: label,
            className: 'marker-label'
          },
          map: map,
        })
      )
    }
  },
  beforeDestroy() {
    this.$globalFunctions.removeGmapsScripts()
    map = ''
    gm = ''
  }
}
</script>

<style lang="css">

.marker-label {
  color: #fff!important;
  font-size: 15px!important;
  font-weight: 500;
}

</style>


