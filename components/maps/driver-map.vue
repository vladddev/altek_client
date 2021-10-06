<template>
  <div>
    <div ref="loadMap" style="width:100%; height:450px"></div>
    <v-btn width="100%" @click="showMarkers()" v-if="showMore">More info</v-btn>
  </div>  
</template>

<script>

import gmapStyle from '~/assets/gmap-style'

const {Loader} = require('google-maps');

let map = {};
let gm = {};
let markers = []

export default {
  name: 'driver-map',
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

    if (!this.$props.locData.startLoc || !this.$props.locData.endLoc) {
      // alert("Incorrect load location")
      return
    }

    var startLoc = this.$props.locData.startLoc.split(',');
    var endLoc = this.$props.locData.endLoc.split(',');
    var carLoc = ''
    const roadLocs = this.$props.locData.roadLocs
    if (roadLocs.length > 0) {
      this.showMore = true
    }

    if (this.$props.locData.carLoc !== null) {
      carLoc = this.$props.locData.carLoc.split(',');
    }

    const self = this

    const loader = new Loader(this.$store.getters.getGmapApiKey);

    loader.load().then(function (google) {

      gm = google;

      map = new google.maps.Map(self.$refs.loadMap, {styles: gmapStyle});

      var mapData = [
        {
          location: {
            lat: parseFloat(startLoc[0]),
            lng: parseFloat(startLoc[1]),
          },
          label: '1',
          icon: ''
        },
        {
          location: {
            lat: parseFloat(endLoc[0]),
            lng: parseFloat(endLoc[1]),
          },
          label: '2',
          icon: ''
        },
      ]

      if(carLoc !== '') {
        mapData.push(
          {
            location: {
              lat: parseFloat(carLoc[0]),
              lng: parseFloat(carLoc[1]),
            },
            label: 'car',
            icon: ''
          },
        )
      }
      self.data = mapData

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
    showMarkers(){
      const roadLocs = this.$props.locData.roadLocs
      const mapData = this.data

      const timeSettings = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timezone: 'UTC',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }

      if (roadLocs.length > 0) {
        roadLocs.forEach((loc, index) => {
          const roadLoc = loc.point.split(',')

          mapData.push(
            {
              location: {
                lat: parseFloat(roadLoc[0]),
                lng: parseFloat(roadLoc[1]),
              },
              label: '#'+index,
              icon: '',
              info: '<p>Place: ' + loc.location_name + '</p><p>Time: ' + new Date(loc.timestamp * 1000).toLocaleString('en-US', timeSettings) + '</p>'
            }
          )

        })
      }

      this.data = mapData

      this.updateMarkers(mapData, true);
      this.showMore = false


    }
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
