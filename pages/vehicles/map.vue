<template>
  <v-container fluid>
    <v-row>
      <v-col cols="5">
        <div class="mr-9">
          <v-row class="align-center">
            <v-col cols="3">
              <span>Pick-up Point:</span>
            </v-col>
            <v-col cols="9">
              <v-row>
                <!-- <v-select
                :items="countryItems"
                v-model="models.country"
                label="Choose country"
                item-text="name"
                item-value="code"
                @change="changeCountry"
                ></v-select>
                <v-spacer></v-spacer> -->
                <v-text-field id="autocomplete" v-model="autocompleteModel" placeholder="" label="Location">
                </v-text-field>
              </v-row>
            </v-col>
          </v-row>
          <v-row class="align-center">
            <v-col cols="3">
              <span>Max Miles Out:</span>
            </v-col>
            <v-col cols="9">
              <v-row>
                <v-text-field label="Miles" v-model="models.mile" type="number"></v-text-field>
              </v-row>
            </v-col>
          </v-row>
          <v-row class="align-center">
            <v-col cols="3">
              <span>Minimum Dimensions:</span>
            </v-col>
            <v-col cols="9">
              <v-row class="d-flex flex-nowrap">
                <v-text-field label="Length" v-model="models.minDimensions.len" type="number" class="pr-5">
                </v-text-field>
                <v-text-field label="Width" v-model="models.minDimensions.width" type="number" class="pr-5">
                </v-text-field>
                <v-text-field label="Height (in)" v-model="models.minDimensions.height" type="number" class="pr-5">
                </v-text-field>
                <v-text-field label="Weight (lb)" v-model="models.minDimensions.weight" type="number"></v-text-field>
              </v-row>
            </v-col>
          </v-row>
          <v-row class="align-center pl-3">
            <v-col cols="12">
              <v-row>
                <v-btn color="blue" dark :loading="loading" @click="filter">
                  <v-icon>mdi-magnifier</v-icon>
                  Search
                </v-btn>
              </v-row>
            </v-col>
          </v-row>
        </div>
      </v-col>
      <v-col cols="7">
        <div ref="driversMap" style="width:100%; height:500px"></div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table 
          v-if="firstSearch" 
          :headers="table.headers" 
          :items="filteredCars" 
          hide-default-footer
          disable-pagination 
          :options.sync="table.options" 
          :loading="loading" 
          class="elevation-1 mt-3 row-pointer"
          @click:row="onRowHover" 
          style="width: 100%">
          <template v-slot:item.driver="{ item }">
            <p style="white-space: nowrap">{{
              item.active_driver.user.first_name + ' ' + item.active_driver.user.last_name              
            }}</p>
          </template>
          <template v-slot:item.available="{ item }">
            <p>{{ item.availableCity }}</p>
            <p class="grey--text">{{ item.availableDates | dateFormat }}</p>
          </template>
          <template v-slot:item.note="{ item }">
            <p v-if="item.note != ''">{{ item.note }}</p>
            <p v-else class="grey--text">Empty</p>
          </template>
          <template v-slot:item.unitTemplate="{ item }">
            <p>{{ item.number }}</p>
            <p class="grey--text" style="white-space: nowrap">⛟ {{ item.miles_out }} mi</p>
          </template>
          <template v-slot:item.vehicleTemplate="{ item }">
            <p>{{ item.type }}</p>
            <p class="grey--text" style="white-space: nowrap">{{ item.weight }}</p>
          </template>
          <template v-slot:item.dimensions="{ item }">
            <p>{{ item.length }}x{{ item.width }}x{{ item.height }}in.</p>
            <p class="red--text">{{ item.note != '' ? item.note : '' }}</p>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn icon class="mr-2" title="Call to driver" color="green"
              @click="callTo((item.active_driver == null ? item.drivers[0].user.phone_number : item.active_driver.user.phone_number))">
              <v-icon>mdi-phone</v-icon>
            </v-btn>
            <v-btn icon color="green" title="Call to owner" @click="callToOwner(item.car_owner)">
              <v-icon>mdi-phone-in-talk</v-icon>
            </v-btn>
            <v-btn icon class="mt-1" color="blue" title="Open chat"
              @click="openChat(item.active_driver == null ? item.drivers[0].user.id : item.active_driver.user.id)">
              <v-icon>mdi-message-text-outline</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import Map from '@/components/Map'
  import countries from '~/assets/counrties'
  import gmapStyle from '~/assets/gmap-style'

  const moment = require('moment')

  const {
    Loader
  } = require('google-maps');
  const axios = require('axios')

  let map
  let markers = []
  let autocomplete
  let places
  let locationMarker = ''

  const countryRestrict = {
    country: "us"
  };

  export default {
    name: 'driversMap',
    props: {},
    data() {
      return {
        loading: false,
        drivers: {},
        filteredCars: [],
        firstSearch: false,
        filterUrl: this.$store.state.backendUrl + '/backend/api/cars/my/?filter_type=multipart&free_only=true&page_size=1000',
        countryItems: [],
        models: {
          country: 'US',
          mile: 150,
          minDimensions: {
            len: '',
            width: '',
            height: '',
            weight: ''
          },
        },
        autocompleteModel: '',
        table: {
          headers: [
            { text: 'Unit', value: 'unitTemplate', align: 'center' },
            // { text: 'ETA', value: 'eta', align: 'center'},
            { text: 'Driver', value: 'driver', align: 'center' },
            { text: 'Vehicle', value: 'vehicleTemplate', align: 'center' },
            { text: 'Available', value: 'available', align: 'center' },
            { text: 'Dimensions', value: 'dimensions', align: 'center' },
            { text: 'Call', value: 'actions', sortable: false, align: 'center', width: '200px' },
          ],
          options: {},
          count: 0,
        }
      }
    },
    created() {

      this.countryItems = countries;

      this.loading = true

      let self = this
      let refs = this.$refs

      const loader = new Loader(this.$store.getters.getGmapApiKey, {
        libraries: ['places'],
      });

      loader.load().then(function (google) {

        map = new google.maps.Map(refs.driversMap, {
          center: {
            lat: 41.850033,
            lng: -87.6500523
          },
          zoom: 10,
          styles: gmapStyle
        });

        self.getDriversLocations()
          .then(data => {
            self.updateMarkers(data.driversLocation, true);
          })

        autocomplete = new google.maps.places.Autocomplete(
          document.getElementById("autocomplete"), {
            types: ["(regions)"],
            componentRestrictions: countryRestrict,
          }
        );
        places = new google.maps.places.PlacesService(map);
        autocomplete.addListener("place_changed", self.onPlaceChanged);

        // setInterval(() => {
        //   self.getDriversLocations()
        //     .then(data => {
        //       self.updateMarkers(data.driversLocation);
        //     })
        // }, 15000);

        self.loading = false
      });

    },
    mounted() {
      this.$store.commit('updateToolbarData', {
        title: 'Capacity Search',
      })
    },
    beforeDestroy() {
      this.$store.commit('updateToolbarData', {})
      this.$store.commit('updatePageBackButton', '')
    },
    methods: {
      onPlaceChanged() {
        const place = autocomplete.getPlace();

        if (locationMarker != '') {
          locationMarker.setMap(null)
          locationMarker = ''
        }

        if (place.geometry) {
          map.panTo(place.geometry.location);
          map.setZoom(4);

          locationMarker = new google.maps.Marker({
            position: place.geometry.location,
            map,
            icon: '/icons/marker.svg',
          });
        } else {
          document.getElementById("autocomplete").placeholder = "Enter a city";
        }
      },
      changeCountry(item) {
        const country = item.toLowerCase();

        if (country == "all") {
          autocomplete.setComponentRestrictions({
            country: []
          });
          map.setCenter({
            lat: 15,
            lng: 0
          });
          map.setZoom(1);
        } else {
          autocomplete.setComponentRestrictions({
            country: country
          });
          map.setCenter({
            lat: 35,
            lng: -100
          });
          map.setZoom(4);
        }

        this.autocompleteModel = ''
      },
      filter() {
        this.firstSearch = true
        this.loading = true

        let self = this
        let accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        let url = this.filterUrl

        if (document.getElementById("autocomplete").value !== '') {
          url += '&geo=' + document.getElementById("autocomplete").value
        }
        if (this.models.mile !== '' && this.models.mile !== 0) {
          url += '&miles_range=' + this.models.mile
        } else {
          this.models.mile = 150
          url += '&miles_range=' + this.models.mile
        }
        if (this.models.minDimensions.len !== '' && this.models.minDimensions.len !== 0) {
          url += '&length__gte=' + this.models.minDimensions.len
        }
        if (this.models.minDimensions.height !== '' && this.models.minDimensions.height !== 0) {
          url += '&height__gte=' + this.models.minDimensions.height
        }
        if (this.models.minDimensions.weight !== '' && this.models.minDimensions.weight !== 0) {
          url += '&weight__gte=' + this.models.minDimensions.weight
        }
        if (this.models.minDimensions.width !== '' && this.models.minDimensions.width !== 0) {
          url += '&width__gte=' + this.models.minDimensions.width
        }


        this.getDriversLocations(url)
          .then(data => {
            self.updateMarkers(data.driversLocation, true);

            self.table.count = data.data.count
            self.filteredCars = data.data.results
            self.loading = false
          })

      },
      getDriversLocations(url = false) {
        let self = this
        return new Promise((resolve, reject) => {

          let accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
            'etl-user-token')

          axios({
              method: 'get',
              url: url ? url : self.filterUrl,
              headers: {
                'Authorization': 'JWT ' + accessToken
              },
            })
            .then(function (response) {

              let driversLocation = self.formatDataForLocation(response.data.results)
              self.drivers = driversLocation;
              resolve({
                'data': response.data,
                'driversLocation': driversLocation
              })

            })
            .catch(function (error) {
              alert('err')
              self.loading = false;
              console.log(error);
            });
        })
      },
      formatDataForLocation(data) {
        let driversLocation = []
        Object.keys(data).map(function (objectKey, index) {
          var value = data[objectKey];
          if (value.location) {
            driversLocation.push({
              id: value.id,
              number: value.number,
              location: Map.parseСoordinates(value.location)
            })
          }
        });
        return driversLocation
      },
      updateMarkers(data, centered = false) {

        var bounds = centered ? new google.maps.LatLngBounds() : '';

        markers.forEach(function (marker) {
          marker.setMap(null);
        })

        markers = []

        Object.keys(data).map(function (objectKey, index) {
          var value = data[objectKey];

          // console.log(value)

          markers.push(new google.maps.Marker({
            position: value.location,
            map: map,
            label: {
              text: value.number.toString(),
              className: 'marker-label'
            },
            icon: '/icons/car-marker-2.png',
          }))

          if (centered) {
            bounds.extend(value.location);
          }
        });

        if (centered && markers.length > 0) {
          map.fitBounds(bounds);
        }
      },
      callToOwner(owner_id) {
        let self = this
        let accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        axios({
            method: 'get',
            url: self.$store.state.backendUrl + '/backend/api/owners/' + owner_id + '/',
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {
            self.callTo(response.data.owner_info.user.phone_number)
          })
          .catch(function (error) {
            console.log(error);
          });
      },
      callTo(number) {
        this.$globalEvents.$emit('telephonyCallToNumber', number)
      },
      closeChat() {
        this.windowChatData.isOpen = false
      },
      openChat(id) {

        let self = this
        let accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem(
          'etl-user-token')

        axios({
            method: 'post',
            url: self.$store.state.backendUrl + '/backend/api/users/current/chats',
            data: {
              driver_id: id
            },
            headers: {
              'Authorization': 'JWT ' + accessToken
            },
          })
          .then(function (response) {

            console.log(response)

            if (response.data.message == "Driver doesn`t exist") {
              alert("Driver doesn`t exist. Error opening chat")
              return
            }

            response.data.chat_group_messages.reverse()

            let data = response.data

            let chat_title = ''

            data.users.forEach(function (val, index) {
              if (index == 0) {
                chat_title += val.first_name
              } else {
                chat_title += ', ' + val.first_name
              }
            })

            self.$globalEvents.$emit('setWindowChatData', true, {
              id: data.id,
              title: chat_title,
              messages: data.chat_group_messages,
              participants: data.users
            })

            // self.loading = false;
          })
          .catch(function (error) {
            self.loading = false;
            alert('err')
            console.log(error);
          });

      },
      onRowHover(item) {
        this.updateMarkers(this.formatDataForLocation([item]))
      }
    },
    filters: {
      dateFormat(date) {
        return moment(date).format('hh:mm A') == 'Invalid date' ? '' : moment(date).format('hh:mm A')
      },
      metaBlockDateFormat(date) {
        return moment(date).format('D/M/Y H:mm') == 'Invalid date' ? '' : moment(date).format('D/M/Y H:mm')
      }
    },
  }

</script>

<style lang="css">
  .miles-input {
    width: 100px;
  }

  .vehicle-type-filter .v-input--selection-controls {
    margin-top: 0 !important;
  }

  .v-application p {
    margin-bottom: 0 !important;
  }

  .v-data-table tbody tr:hover {
    cursor: pointer;
  }

  .marker-label {
    color: #fff !important;
    font-size: 13px !important;
    font-weight: 500;
    margin-bottom: 10px;
  }

</style>
