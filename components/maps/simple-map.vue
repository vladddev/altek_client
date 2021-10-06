<template>
    <div ref="loadMap" style="width:100%; height:600px"></div>
</template>

<script>

import gmapStyle from '~/assets/gmap-style'

const {Loader} = require('google-maps');

let map = {};
let gm = {};
let markers = []

export default {
  name: 'simple-map',
  props: {
    locData: {
      type: Object,
      required: true
    }
  },
  watch: {
    // locData: {
    //     handler: function(newVal, oldVal) {
    //         var startLoc = newVal.startLoc.split(',');
    //         var endLoc = newVal.endLoc.split(',');

    //         this.setWaypoints(startLoc, endLoc);

    //     },
    //     deep: true
    // },
  },
  data() {
    return {
      data: null,
      showMore: false,
      directionsService: {},
      directionsRenderer: {},
      roadMarkers: []
    }
  },
  created() {
    const self = this
    const loader = new Loader(this.$store.getters.getGmapApiKey);

    loader.load().then(function (google) {

      gm = google;

      map = new google.maps.Map(self.$refs.loadMap, {styles: gmapStyle});
      const mapData = []

      self.$props.locData.locs.forEach(car => {
          mapData.push({
            location: {
              lat: parseFloat(car.location[0]),
              lng: parseFloat(car.location[1]),
            },
            label: car.number,
            icon: ''
          },
        )
      })

      
      self.data = mapData
      console.log(mapData);

      self.updateMarkers(mapData, true);

      // self.directionsService = new google.maps.DirectionsService();
      // self.directionsRenderer = new google.maps.DirectionsRenderer();


    });
  },
  methods: {
    updateMarkers(data, centered = false) {

      var bounds = centered ? new google.maps.LatLngBounds() : '';

      markers.forEach(function (marker) {
        marker.setMap(null);
      })

      Object.keys(data).map(function (objectKey, index) {
        var value = data[objectKey];

        const marker = new google.maps.Marker({
          position: value.location,
          label: {
            text: value.label,
            className: 'marker-label'
          },
          map: map,
        })

        markers.push(marker)

        if (value.info != '') {
          const infowindow = new google.maps.InfoWindow({
            content: value.info,
          });

          google.maps.event.addListener(marker, "click", () => {
            infowindow.open(map, marker);
          });
        }

        if (centered) {
          bounds.extend(value.location);
        }
      });

      if (centered) {
        map.fitBounds(bounds);
      }

    },
  },
  beforeDestroy() {
    this.$globalFunctions.removeGmapsScripts()
  }
}
</script>

<style lang="css">
.marker-label {
  color: #fff !important;
}
</style>
