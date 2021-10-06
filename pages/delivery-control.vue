<template>
  <v-row justify="center">
    <!-- <script ref="mapScript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyARqEL__oB6pdnUAbLBjRgPgNSpu5PPpgQ"></script> -->
    <!-- <v-card style="width: 100%" class="mx-1">
            <div id="map" style="width:100%; height:600px"></div>
        </v-card> -->
    <p>{{distanceData.originAdress}}</p>
    <p>{{distanceData.destinationAdress}}</p>
    <p>{{distanceData.distance}}</p>
    <p>{{distanceData.duration}}</p>
    <button v-on:click="setWayPoints">Расчитать растояние</button>
    <v-card style="width: 100%" class="mx-1">
      <div id="map" style="width:100%; height:600px"></div>
    </v-card>
  </v-row>
</template>

<script>
  const axios = require('axios')
  const {
    Loader
  } = require('google-maps');

  let map = '';

  export default {
    data() {
      return {
        count: 0,
        rotate: 0,
        items: [],
        distanceData: {}
      }
    },
    methods: {
      setWayPoints() {

        const loader = new Loader('');

        loader.load().then(function (google) {

          map = new google.maps.Map(document.getElementById('map'), {
            center: {
              lat: 41,
              lng: 50
            },
            zoom: 8,
          });

          const directionsService = new google.maps.DirectionsService();
          const directionsRenderer = new google.maps.DirectionsRenderer();

          directionsRenderer.setMap(map);

          var waypts = [];
          const arr = [
            'toronto, ont',
            'fargo, nd'
          ];

          arr.forEach(function (item) {
            waypts.push({
              location: item
            });
          })

          directionsService.route({
              origin: {
                query: 'Halifax, NS',
              },
              destination: {
                query: 'San Francisco, CA',
              },
              waypoints: waypts,
              travelMode: google.maps.TravelMode.DRIVING,
              optimizeWaypoints: true,
              avoidFerries: true,
            },
            (response, status) => {
              if (status === "OK") {
                directionsRenderer.setDirections(response);
                console.log(response);
              } else {
                window.alert("Directions request failed due to " + status);
              }
            }
          );

        });
      },
      getDriversInRadius() {

        var rad = function (x) {
          return x * Math.PI / 180;
        };

        var getDist = function (p1, p2) {
          var R = 6378137;
          var dLat = rad(p2.lat - p1.lat);
          var dLong = rad(p2.lng - p1.lng);
          var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          var d = R * c;
          return Math.floor(d / 1000) * 0.621371;
        };

        var qwe = getDist({
          lat: 50.087,
          lng: 14.421
        }, {
          lat: 55.93,
          lng: -3.118
        });

        console.log(qwe);

      },
      getDistance() {

        const service = new google.maps.DistanceMatrixService();

        let data = []

        service.getDistanceMatrix({
            origins: [{
              lat: 55.93,
              lng: -3.118
            }],
            destinations: [{
              lat: 50.087,
              lng: 14.421
            }],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.IMPERIAL,
            avoidFerries: false
          },
          (response, status) => {
            if (status !== "OK") {
              alert("Error was: " + status);
            } else {
              data['originAdress'] = response.originAddresses[0]
              data['destinationAdress'] = response.destinationAddresses[0]
              data['distance'] = response.rows[0].elements[0].distance.text
              data['duration'] = response.rows[0].elements[0].duration.text

              this.distanceData = data

              console.log(data);
            }
          }
        )
      },
      setDriverLocation() {
        const loader = new Loader('');

        loader.load().then(function (google) {

          map = new google.maps.Map(document.getElementById('map'), {
            center: {
              lat: 41,
              lng: 50
            },
            zoom: 8,
          });

          new google.maps.Marker({
            position: {
              lat: 41,
              lng: 50
            },
            map,
            title: "Hello World!",
            icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"
          });


        });
      }
    },
    mounted() {

      this.$store.commit('updateToolbarData', {
        title: 'Delivery control',
        backBtn: {
          callback: function () {
            window.history.back();
          }
        },
      })

      const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localToken
      const self = this

      // const loader = new Loader('AIzaSyARqEL__oB6pdnUAbLBjRgPgNSpu5PPpgQ');
      // const loader = new Loader('');

      // loader.load().then(function (google) {

      //     map = new google.maps.Map(document.getElementById('map'), {
      //         center: {lat: -34.397, lng: 150.644},
      //         zoom: 8,
      //     });


      // });



      // this.$refs.mapScript.onload = () => {
      //     map = new google.maps.Map(this.$refs.gm, {
      //         center: {lat: 6.2115201, lng: -113.7164387},
      //         zoom: 5
      //     });

      //     axios({
      //         method: 'get',
      //         url: self.$store.state.backendUrl + '/backend/api/cars/map/',
      //         headers: {'Authorization': 'JWT ' + accessToken},
      //     })
      //     .then(function (response) {
      //         console.log(response);
      //         self.count = response.data.count
      //         self.items = response.data.items

      //         const bounds = []

      //         self.items.forEach(car => {
      //             let bound = car.location.split(',')

      //             let marker = new google.maps.Marker({
      //                     position: {lat: Number(bound[0]), lng: Number(bound[1])},
      //                     map: gm
      //             });
      //             // DG.marker(bound, {
      //             //     title: `
      //             //     Car number: ${car.number},\r\n
      //             //     Status: ${car.status},\r\n
      //             //     Dispatcher: ${car.dispatcher}
      //             //     `
      //             // }).addTo(map);
      //             // bounds.push(bound)
      //         });

      //         // map.fitBounds(bounds)
      //     })
      //     .catch(function (error) { console.log(error); })
      // }


      // axios({
      //     method: 'get',
      //     url: self.$store.state.backendUrl + '/backend/api/check-permissions/',
      //     params: {
      //         page: self.$router.history.current.path
      //     },
      //     headers: {'Authorization': 'JWT ' + accessToken},
      // })
      // .then(function (response) {
      //     if (!response.data.allow) {
      //         self.$router.push('/')
      //     } else {

      //     }
      // })
      // .catch(function (error) { console.log(error); })


    },
    beforeDestroy() {
      this.$store.commit('updateToolbarData', {})
    },
  }

</script>
