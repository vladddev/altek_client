<template>
  <v-container fluid>
    <v-row justify="start">
      <v-col cols="3">
        <v-select :items="brokerages" v-model="brokeragesModel" label="Select brokerages" multiple :loading="loading"
          :disabled="loading" item-text="name" item-value="email" outlined dense solo
          hint="Multiple boards can be selected" persistent-hint></v-select>
      </v-col>
    </v-row>
    <v-card width="100%" :loading="loading" :disabled="loading">
      <v-container style="display: none">
        <v-row>
          <v-col cols="7">
            <v-row>
              <v-col cols="3">
                <v-select :items="[
                    'Pick-up at',
                    'Deliver to',
                    'Vehicle',
                    'Miles',
                    'Shipper',
                  ]" label="Filter column" v-model="filterOptions.filterColumn" dense solo></v-select>
              </v-col>
              <v-col cols="3">
                <v-select :items="[
                    'Equal',
                    'Does not equal',
                    'Contains',
                    'More than',
                    'Less than',
                  ]" label="Filter type" v-model="filterOptions.filterType" dense solo></v-select>
              </v-col>
              <v-col cols="3">
                <v-text-field dense v-model="filterOptions.filterValue"></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-btn class="ma-2" :loading="loading" :disabled="loading" color="secondary" small @click="filter()">
                  Refresh
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="7">
            <v-btn @click="clearFilters()"> Clear filters </v-btn>
          </v-col>
        </v-row>
      </v-container>

      <!-- TABLE LOAD-BOARD -->
      <table width="100%">
        <thead>
          <tr>
            <th v-for="(item, index) in headers" :key="index" class="" :class="{ 'header-name': item.sortable }"
              :width="item.width">
              <div class="table-col-title" @click="sort(index)">
                {{ item.text }}
                <v-icon v-if="item.sortable">
                  {{
                    item.sorting == ""
                      ? "mdi-unfold-more-horizontal"
                      : item.sorting == "ASC"
                      ? "mdi-chevron-up"
                      : "mdi-chevron-down"
                  }}
                </v-icon>
              </div>
            </th>
          </tr>
          <tr>
            <th v-for="(header, index) in headers" :key="index" class="" :class="{ 'header-name': header.sortable, 'py-0': true }"
              :width="header.width">
              <div>
                <template v-if="filters.values[header.value]">
                  <template v-if="filters.values[header.value].type === 'range'">
                    <div style="display: flex">
                      <v-text-field dense placeholder=">" type="number" v-debounce:700ms="() => filter(true)"
                        debounce-events="input" v-model="filters.values[header.value].value_gte" class="mr-1">
                      </v-text-field>
                      <v-text-field dense placeholder="<" v-debounce:700ms="() => filter(true)" debounce-events="input"
                        v-model="filters.values[header.value].value_lte"></v-text-field>
                    </div>
                  </template>
                  <template v-else-if="header.value === 'pickUpAt' || header.value === 'deliverTo'">
                    <v-autocomplete v-model="filters.values[header.value].value" :items="states" flat class="mr-2"
                      @change="() => filter(true)" multiple clearable
                      hide-details hide-no-data hide-selected single-line dense item-text="full" item-value="abbr"></v-autocomplete>
                  </template>
                  <template v-else-if="header.value === 'car'">
                    <v-autocomplete v-model="filters.values[header.value].value" :items="cars" flat class="mr-2"
                      @change="() => filter(true)" multiple clearable
                      hide-details hide-no-data hide-selected single-line dense></v-autocomplete>
                  </template>
                  <template v-else>
                    <v-text-field dense :type="filters.values[header.value].type" :placeholder="header.text"
                      v-debounce:700ms="() => filter(true)" debounce-events="input"
                      hide-details
                      v-model="filters.values[header.value].value" class="subtitle-1 px-4"></v-text-field>
                  </template>
                </template>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <template v-for="load in loads">
            <!--match 0/0  temporarily do not display -->
            <tr v-if="
                (load.actual_cars_count > 0 && load.holded_cars_count > 0) ||
                isAdmin
              " class="load-item" v-bind:key="load.id" @click="(load.already_saw = true), open(load)" :class="[
                load.bids_count > 0 ? 'red lighten-4' : '',
                load.already_saw == false ? 'not-viewed' : '',
              ]">
              <td v-for="(headProps, i) in headers" :key="i" class="text-center pa-2 body-2">
                <div v-if="headProps.value == 'receivedDate'">
                  <div style="white-space: nowrap">
                    <span v-if="load.created_date > 0" class="font-weight-black red--text">$</span>
                    <span>{{ load.created_date | dateFormat }}</span>
                  </div>
                </div>
                <div v-else-if="headProps.value == 'actions'" class="flex">
                  <div class="input-wrap mr-1">
                    <v-text-field v-model.number="load.price" type="number" placeholder="Your price" full-width dense
                      :loading="sendLoading"></v-text-field>
                  </div>
                  <v-btn small class="mr-2" @click="sendProp(load)" :loading="sendLoading">
                    BID
                  </v-btn>
                </div>
                <!--match 0/0  temporarily do not display -->
                <div v-else-if="headProps.value == 'match'">
                  <div style="white-space: nowrap">
                    <span v-if="load.bids_count > 0" class="font-weight-black red--text">$</span>
                    <span>{{ load.actual_cars_count }}/{{
                        load.holded_cars_count
                      }}
                      {{
                        load.miles_out ? " (⛟ " + load.miles_out + " mi)" : ""
                      }}</span>
                  </div>
                </div>
                <div v-else>
                  {{ load[headProps.value] }}
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <!-- TABLE LOAD-BOARD -->

      <v-col cols="12" class="pt-6">
        <v-pagination v-model="page" :length="Math.ceil(totalLoads / 50)" :total-visible="7" @input="filter">
        </v-pagination>
      </v-col>

      <v-container style="display: none">
        <v-row>
          <v-col cols="7">
            <v-row>
              <v-col cols="3">
                <v-select :items="[
                    'Pick-up at',
                    'Deliver to',
                    'Vehicle',
                    'Miles',
                    'Shipper',
                  ]" label="Filter column" v-model="filterOptions.filterColumn" dense solo></v-select>
              </v-col>
              <v-col cols="3">
                <v-select :items="[
                    'Equal',
                    'Does not equal',
                    'Contains',
                    'More than',
                    'Less than',
                  ]" label="Filter type" v-model="filterOptions.filterType" dense solo></v-select>
              </v-col>
              <v-col cols="3">
                <v-text-field dense v-model="filterOptions.filterValue"></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-btn class="ma-2" :loading="loading" :disabled="loading" color="secondary" small @click="filter()">
                  Refresh
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="5" class="pt-6">
            <v-pagination v-model="page" :length="Math.ceil(totalLoads / 50)" :total-visible="7" @input="filter">
            </v-pagination>
          </v-col>
        </v-row>
      </v-container>
    </v-card>

    <v-dialog fullscreen v-model="dialog">
      <v-card>
        <v-toolbar dark color="blue">
          <v-toolbar-title>Load #{{ selectedLoad.id }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click.native="(selectedCar = {}), (dialog = false)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-container class="load-dialog-content" fluid>
          <v-row>
            <v-col cols="3">
              <v-card>
                <v-card-text class="subtitle-2 load_meta">
                  <div class="load_meta_1">
                    <h2>Order # {{ selectedLoad.id }}</h2>
                    <span class="grey--text">Received
                      {{ selectedLoad.modifiedDateTime | dateFormat }}</span>
                    <br /><br />
                  </div>
                  <div class="load_meta_2">
                    <div>
                      <b><span>Pick-up at:</span>
                        <span class="px-1">
                          {{ selectedLoad.pickUpAt }}
                        </span></b>
                    </div>
                    <div>
                      <b><span>Pick-up date:</span>
                        <span class="px-1">
                          {{ selectedLoad.pick_up_date | metaBlockDateFormat }}
                        </span></b>
                    </div>
                    <br />
                    <div>
                      <b><span>Deliver to:</span>
                        <span class="px-1">
                          {{ selectedLoad.deliverTo }}
                        </span></b>
                    </div>
                    <div>
                      <b><span>Delivery date:</span>
                        <span class="px-1">
                          {{ selectedLoad.delivery_date | metaBlockDateFormat }}
                        </span></b>
                    </div>
                    <br />
                    <div>
                      <span>Miles:</span>
                      <span class="px-1"> {{ selectedLoad.miles }} </span>
                    </div>
                    <div>
                      <span>Pieces:</span>
                      <span class="px-1"> {{ selectedLoad.pieces }} </span>
                    </div>
                    <div>
                      <span>Weight:</span>
                      <span class="px-1"> {{ selectedLoad.weight }} </span>
                    </div>
                    <div>
                      <span>Dims:</span>
                      <span class="px-1">
                        {{
                          selectedLoad.length != "" &&
                          selectedLoad.width != "" &&
                          selectedLoad.height != ""
                            ? selectedLoad.length +
                              "L x " +
                              selectedLoad.width +
                              "W x " +
                              selectedLoad.height +
                              "H in"
                            : "Not suplied"
                        }}
                      </span>
                    </div>
                    <div>
                      <span>Stackable:</span>
                      <span class="px-1">
                        {{ selectedLoad.isCanPutOnTop ? "Yes" : "No" }}
                      </span>
                    </div>
                    <!--                                      Liftqate?: <span class="px-1 font-weight-bold body-1"> {{ selectedLoad.liftgate ? 'Yes' : 'No' }} </span> <br>-->
                    <!--                                      Wait and return?: <span class="px-1 font-weight-bold body-1"> {{ selectedLoad.wait_and_return ? 'Yes' : 'No' }} </span> <br>-->
                    <!--                                      Team?: <span class="px-1 font-weight-bold body-1"> {{ selectedLoad.team ? 'Yes' : 'No' }} </span> <br>-->
                    DockLevel?:
                    <span class="px-1">
                      {{ selectedLoad.dock_level ? "Yes" : "No" }}
                    </span>
                    <!--                                      Sys Ref: <span class="px-1 font-weight-bold body-1"> {{ selectedLoad.sys_ref }} </span> <br>-->
                    <!--                                      Pro # / Shipment ID: <span class="px-1 font-weight-bold body-1"> {{ selectedLoad.id }} </span> <br>-->
                    <!--                                      No.of items: <span class="px-1 font-weight-bold body-1"> {{ selectedLoad.items_count }} </span> <br>-->
                    <!--                                      Price: <span class="px-1 font-weight-bold body-1"> {{ selectedLoad.price == 0 ? 'Best price' : selectedLoad.price }} </span> <br>-->
                    <div>
                      <b><span>Suggested Truck Size:</span>
                        <span class="px-1"> {{ selectedLoad.car }} </span></b>
                    </div>
                    <br />
                    <template v-if="selectedLoad.note.length > 0">
                      <div>
                        <b><span>NOTE:</span>
                          <span class="px-1w">
                            {{ selectedLoad.note }}
                          </span></b>
                      </div>
                    </template>
                    <br />
                    <!--                                      Dangerous: <span class="px-1 font-weight-bold body-1"> {{ selectedLoad.isDanger ? 'Yes' : 'No' }} </span> <br>-->
                    <!--                                      Urgent: <span class="px-1 font-weight-bold body-1"> {{ selectedLoad.isUrgent ? 'Yes' : 'No' }} </span> <br>-->
                  </div>
                  <div class="load_meta_3" v-html="wrapPhonesInHtml(selectedLoad.mail_part)"></div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="9">
              <v-row>
                <v-col cols="12">
                  <v-row>
                    <v-card-title>Units found:
                      {{ dialogData.driversTable.count }}</v-card-title>
                  </v-row>
                </v-col>
                <v-col cols="12">
                  <v-data-table :headers="dialogData.driversTable.headers" :items="dialogData.driversTable.items"
                    :options.sync="options" :hide-default-footer="true" :items-per-page="-1"
                    :server-items-length="dialogData.driversTable.totalLoads" :loading="dialogData.driversTable.loading"
                    class="elevation-2 drivers-table">
                    <template v-slot:item.check="{ item }">
                      <v-radio-group v-model="selectedLoad.driver">
                        <v-radio class="justify-center" :value="item"></v-radio>
                      </v-radio-group>
                    </template>
                    <!-- <template v-slot:item.miles="{ item }">
                        <span>{{ getDistance(item.location, selectedLoad.pickUpAt, item) ? item.distance : 0 }}</span>
                    </template> -->
                    <template v-slot:item.driver="{ item }">
                      <p style="white-space: nowrap">
                        {{
                          item.active_driver == null
                            ? item.drivers[0].user.first_name
                            : item.active_driver.user.first_name
                        }}
                      </p>
                      <p class="grey--text">
                        {{
                          item.active_driver == null
                            ? item.drivers[0].user.email
                            : item.active_driver.user.email
                        }}
                      </p>
                    </template>
                    <template v-slot:item.available="{ item }">
                      <p>
                        <a target="_blank" :href="`https://www.google.com/maps/dir/${
                            item.active_driver == null
                              ? item.drivers[0].location
                              : item.active_driver.location
                          }/${dialogData.mapData.startLoc}`">{{ item.availableCity }}</a>
                      </p>
                      <p class="grey--text">
                        {{ item.availableDates | dateFormat }}
                      </p>
                    </template>
                    <template v-slot:item.note="{ item }">
                      <p v-if="item.note != ''">{{ item.note }}</p>
                      <p v-else class="grey--text">Empty</p>
                    </template>
                    <template v-slot:item.unitTemplate="{ item }">
                      <p>{{ item.number }}</p>
                      <p v-if="!item.miles_formatted" class="grey--text" style="white-space: nowrap">
                        ≈ ⛟ {{ item.miles_out }} mi
                      </p>
                      <p v-else class="grey--text" style="white-space: nowrap">
                        ⛟ {{ item.miles_formatted }} mi
                      </p>
                    </template>
                    <template v-slot:item.vehicleTemplate="{ item }">
                      <p>{{ item.type }}</p>
                      <p class="grey--text" style="white-space: nowrap">
                        {{ item.weight }}
                      </p>
                    </template>
                    <template v-slot:item.dimensions="{ item }">
                      <p>
                        {{ item.length }}x{{ item.width }}x{{ item.height }}in.
                      </p>
                      <p class="red--text">
                        {{ item.note != "" ? item.note : "" }}
                      </p>
                    </template>
                    <template v-slot:item.bid="{ item }">
                      <p class="red--text">
                        {{ item.bid > 0 ? item.bid : "" }}
                      </p>
                    </template>
                    <template v-slot:item.actions="{ item }">
                      <v-btn icon class="mr-2" title="Call to driver" color="green" @click="
                          callTo(
                            item.active_driver == null
                              ? item.drivers[0].user.phone_number
                              : item.active_driver.user.phone_number
                          )
                        ">
                        <v-icon>mdi-phone</v-icon>
                      </v-btn>
                      <v-btn icon color="green" title="Call to owner" @click="callToOwner(item.car_owner)">
                        <v-icon>mdi-phone-in-talk</v-icon>
                      </v-btn>
                      <v-btn icon class="mt-1" color="blue" title="Open chat" @click="
                          openChat(
                            item.active_driver == null
                              ? item.drivers[0].user.id
                              : item.active_driver.user.id
                          )
                        ">
                        <v-icon>mdi-message-text-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-data-table>
                </v-col>

                <v-col cols="12">
                  <span class="heading-4">Broker email: {{ dialogData.email }}</span>
                </v-col>

                <v-col cols="12">
                  <v-row>
                    <v-col cols="3">
                      <v-row>
                        <v-card-title>Bid placement: ({{
                            selectedLoad.miles
                          }}ml)</v-card-title>
                      </v-row>
                      <v-row>
                        <v-col cols="4">
                          <!-- test -->
                          <!-- v-model="selectedLoad.broker_price" -->
                          <v-text-field label="Price for broker" @input="inputHandler('broker_price', $event)"
                            :value="selectedLoad.broker_price" />
                        </v-col>
                        <!-- v-model="selectedLoad.driver_price" -->
                        <v-col cols="4">
                          <v-text-field label="Price for driver" @input="inputHandler('driver_price', $event)"
                            :value="selectedLoad.driver_price" />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="4">
                          <v-text-field label="Price per mile" @input="brokerCostUpdate($event)"
                            :value="brokerCostPerMile" />
                        </v-col>
                        <v-col cols="4">
                          <v-text-field label="Price per mile" @input="driverCostUpdate($event)"
                            :value="driverCostPerMile" />
                        </v-col>
                        <v-col cols="12">
                          <div class="mt-3">
                            <v-btn color="green" :loading="sendLoading" @click="sendProp(selectedLoad)" dark>Place bid
                            </v-btn>
                          </div>
                        </v-col>
                      </v-row>
                    </v-col>
                    <v-col cols="6">
                      <v-switch v-model="htmlMode" inset label="Edit as html"></v-switch>
                      <v-card>
                        <div v-if="selectedLoad.driver">
                          <v-container>
                            <template v-if="!htmlMode">
                              <div v-html="repairMail(dialogData.message)"></div>
                            </template>
                            <template v-else>
                              <v-textarea v-model="dialogData.message" class="caption" outlined rows="6"></v-textarea>
                            </template>
                          </v-container>
                        </div>
                      </v-card>
                    </v-col>
                    <v-col cols="3">
                      <v-card>
                        <load-map v-if="$store.state.GMAP_API_KEY !== ''" :locData="dialogData.mapData"></load-map>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import loadMap from "@/components/maps/load-map";
  import Map from "@/components/Map";
  import chatWindow from "@/components/chat/chat-window";
  import Vue from "vue";
  import vueDebounce from "vue-debounce";

  Vue.use(vueDebounce);

  const axios = require("axios");
  const {
    Loader
  } = require("google-maps");
  const moment = require("moment");

  window.emitPhoneCall = function (number) {
    document.dispatchEvent(
      new CustomEvent("telephonyCallToNumber", {
        detail: {
          number: number
        },
      })
    );
  };

  export default {
    // props: ['headers', 'items'],
    data() {
      return {
        isAdmin: false,
        windowChatData: {},
        totalLoads: 0,
        brokerages: [{
            name: "myvirtualfleet",
            email: "loads@myvirtualfleet.com",
          },
          {
            name: "sylectus",
            email: "postedloads@sylectus.com",
          },
        ],
        brokeragesModel: [],
        companies_blacklist: [],
        filterOptions: {
          type: "single",
          filterType: "",
          filterValue: "",
          filterColumn: "",
        },
        sortingOptions: {
          orderBy: "",
          order: "",
        },
        profile: "",
        loads: [],
        options: {},
        dialogData: {
          driversTable: {
            count: 0,
            loading: false,
            headers: [{
                text: "",
                value: "check",
                sortable: false,
                align: "center"
              },
              {
                text: "Unit",
                value: "unitTemplate",
                align: "center"
              },
              // { text: 'Miles', value: 'miles_before_load', align: 'center' },
              {
                text: "Driver",
                value: "driver",
                align: "center"
              },
              // { text: 'Vehicle type', value: 'type'},
              {
                text: "Vehicle",
                value: "vehicleTemplate",
                align: "center"
              },
              // { text: 'Max weigh', value: 'weight'},
              {
                text: "Available",
                value: "available",
                align: "center"
              },
              {
                text: "Dimensions",
                value: "dimensions",
                align: "center"
              },
              // { text: 'Note', value: 'note' },
              // { text: 'Status', value: 'status'},
              {
                text: "Bid",
                value: "bid",
                sortable: false
              },
              {
                text: "Call",
                value: "actions",
                sortable: false,
                align: "center",
                width: "200px",
              },
            ],
            items: [],
          },
          email: "",
          // message: `Hey!
          //                 Hope you are having a wonderful day!
          //                 <div style="padding: 15px;width: 230px;border: 1px dashed Silver; border-radius: 15px;margin: 10px;filter: drop-shadow(0 0 4px #7BBB74);background-color: #fff;">[bold]All in: <span style="color: #009C00">{brokerPrice}</span>[/bold] </br>
          //                 [bold]Miles out:[/bold]  {miles} </br>
          //                 [bold]ETA: [/bold]{eta} </br>
          //                 [bold]Dimensions:[/bold] {dims}" </br>
          //                 [bold]Type:[/bold] {vehicle} </br>
          //                 [bold]MC:[/bold] {MCNumber} </br>
          //                 </div>
          //                 <span style="color: #B40000">ALL BIDS ARE VALID 15 MINS</span>
          //                 Take a look at our <a href="#">MAP</a> with all available vehicles we have.
          //                 <p>--</p>
          //                 <p>{sign}</p>
          //             `,
          message: "",
          mapData: {
            startLoc: "",
            endLoc: "",
          },
        },
        htmlMode: false,
        page: 1,
        valid: true,
        loading: true,
        sendLoading: false,
        dialog: false,
        filters: {
          type: "multipart",
          values: {
            pickUpAt: {
              type: "text",
              value: "",
              multiValues: true,
            },
            deliverTo: {
              type: "text",
              value: "",
              multiValues: true,
            },
            car: {
              type: "text",
              value: "",
              multiValues: true,
            },
            miles: {
              type: "range",
              value_gte: "",
              value_lte: "",
            },
            company: {
              type: "text",
              value: "",
            },
          },
        },
        selectedCar: {},
        selectedLoad: {
          car: "",
          deliverTo: "",
          height: 0,
          id: 0,
          isCanPutOnTop: false,
          isDanger: true,
          isUrgent: false,
          length: 0,
          modifiedDateTime: "0000-00-00T00:00:00.00",
          driver: null,
          pickUpAt: "",
          price: 0,
          driver_price: 0,
          broker_price: 0,
          shipper: "",
          note: "",
          weight: 0,
          width: 0,
        },
        headers: [{
            text: "Received",
            value: "receivedDate",
            sorting: "",
            width: "15%",
            sortable: true,
            align: "center",
          },
          {
            text: "Pick-up at",
            value: "pickUpAt",
            sorting: "",
            width: "15%",
            sortable: true,
            align: "center",
          },
          {
            text: "Deliver to",
            value: "deliverTo",
            sorting: "",
            width: "15%",
            sortable: true,
            align: "center",
          },
          {
            text: "Vehicle",
            value: "car",
            sorting: "",
            width: "14%",
            sortable: true,
            align: "center",
          },
          {
            text: "Miles out",
            value: "miles_out",
            sorting: "",
            width: "9%",
            sortable: true,
            align: "center",
          },
          // { text: 'Description', value: 'descr', sorting: '', width: '15%', sortable: false },
          {
            text: "Match",
            value: "match",
            sorting: "",
            width: "",
            sortable: false,
            align: "center",
          },
          {
            text: "Brokerage",
            value: "company",
            sorting: "",
            width: "",
            sortable: true,
            align: "center",
          },
          // { text: 'Bid', value: 'actions', sorting: '', width: '15%', sortable: false },
        ],
        states: [{
            'full': 'Alaska',
            'abbr': 'AK',
          },
          {
            'full': 'Alabama',
            'abbr': 'AL',
          },
          {
            'full': 'Arkansas',
            'abbr': 'AR',
          },
          {
            'full': 'Arizona',
            'abbr': 'AZ',
          },
          {
            'full': 'California',
            'abbr': 'CA',
          },
          {
            'full': 'Colorado',
            'abbr': 'CO',
          },
          {
            'full': 'Connecticut',
            'abbr': 'CT',
          },
          {
            'full': 'Delaware',
            'abbr': 'DE',
          },
          {
            'full': 'Florida',
            'abbr': 'FL',
          },
          {
            'full': 'Georgia',
            'abbr': 'GA',
          },
          {
            'full': 'Hawaii',
            'abbr': 'HI',
          },
          {
            'full': 'Iowa',
            'abbr': 'IA',
          },
          {
            'full': 'Idaho',
            'abbr': 'ID',
          },
          {
            'full': 'Illinois',
            'abbr': 'IL',
          },
          {
            'full': 'Indiana',
            'abbr': 'IN',
          },
          {
            'full': 'Kansas',
            'abbr': 'KS',
          },
          {
            'full': 'Kentucky',
            'abbr': 'KY',
          },
          {
            'full': 'Louisiana',
            'abbr': 'LA',
          },
          {
            'full': 'Massachusetts',
            'abbr': 'MA',
          },
          {
            'full': 'Maryland',
            'abbr': 'MD',
          },
          {
            'full': 'Maine',
            'abbr': 'ME',
          },
          {
            'full': 'Michigan',
            'abbr': 'MI',
          },
          {
            'full': 'Minnesota',
            'abbr': 'MN',
          },
          {
            'full': 'Missouri',
            'abbr': 'MO',
          },
          {
            'full': 'Mississippi',
            'abbr': 'MS',
          },
          {
            'full': 'Montana',
            'abbr': 'MT',
          },
          {
            'full': 'North Carolina',
            'abbr': 'NC',
          },
          {
            'full': 'North Dakota',
            'abbr': 'ND',
          },
          {
            'full': 'Nebraska',
            'abbr': 'NE',
          },
          {
            'full': 'New Hampshire',
            'abbr': 'NH',
          },
          {
            'full': 'New Jersey',
            'abbr': 'NJ',
          },
          {
            'full': 'New Mexico',
            'abbr': 'NM',
          },
          {
            'full': 'Nevada',
            'abbr': 'NV',
          },
          {
            'full': 'New York',
            'abbr': 'NY',
          },
          {
            'full': 'Ohio',
            'abbr': 'OH',
          },
          {
            'full': 'Oklahoma',
            'abbr': 'OK',
          },
          {
            'full': 'Oregon',
            'abbr': 'OR',
          },
          {
            'full': 'Pennsylvania',
            'abbr': 'PA',
          },
          {
            'full': 'Rhode Island',
            'abbr': 'RI',
          },
          {
            'full': 'South Carolina',
            'abbr': 'SC',
          },
          {
            'full': 'South Dakota',
            'abbr': 'SD',
          },
          {
            'full': 'Tennessee',
            'abbr': 'TN',
          },
          {
            'full': 'Texas',
            'abbr': 'TX',
          },
          {
            'full': 'Utah',
            'abbr': 'UT',
          },
          {
            'full': 'Virginia',
            'abbr': 'VA',
          },
          {
            'full': 'Vermont',
            'abbr': 'VT',
          },
          {
            'full': 'Washington',
            'abbr': 'WA',
          },
          {
            'full': 'Wisconsin',
            'abbr': 'WI',
          },
          {
            'full': 'West Virginia',
            'abbr': 'WV',
          },
          {
            'full': 'Wyoming',
            'abbr': 'WY',
          },
          {
            'full': 'District of Columbia',
            'abbr': 'DC'
          }
        ],
        cars: [
          'CARGO VAN',
          'SPRINTER VAN',
          'BOX TRUCK',
          'Box Truck 24ft', 
          'Box Truck 53ft', 
          'BOX TRUCK W/ LIFT GATE',   
          'SMALL STRAIGHT',
          'LARGE STRAIGHT',
          'LIFTGATE',
          'Flatbed',
          'Tractor',
        ],
        onceLoading: false,
      };
    },
    filters: {
      dateFormat(date) {
        return moment(date).format("hh:mm A") == "Invalid date" ?
          "" :
          moment(date).format("hh:mm A");
      },
      metaBlockDateFormat(date) {
        return moment(date).format("D/M/Y H:mm") == "Invalid date" ?
          "" :
          moment(date).format("D/M/Y H:mm");
      },
    },
    components: {
      loadMap,
      chatWindow,
    },
    watch: {
      brokeragesModel: function (val, oldVal) {
        if (val.length === 0) {
          this.brokeragesModel = this.brokerages.map((val) => val.email)
        }
        localStorage.setItem('brokerages', JSON.stringify(this.brokeragesModel))

        this.filter(true)
      },
      'selectedLoad.driver': function (selectedCar) {
        if (!selectedCar) return

        // Map.calculateDistance(selectedCar.location, this.selectedLoad.start_location).then(function(result) {
        //     console.log(result);
        // });

        let origin = Map.parseСoordinates(selectedCar.location)
        let destinations = Map.parseСoordinates(this.selectedLoad.start_location)
        let self = this

        // self.selectedCar = {
        //     driver_id: (selectedCar.active_driver == null ? selectedCar.drivers[0].id : selectedCar.active_driver.user.id),
        //     car_id: selectedCar.id,
        //     car_number: selectedCar.number,
        //     car_type: selectedCar.type,
        //     car_location: selectedCar.location,
        //     active_driver: (selectedCar.active_driver == null ? selectedCar.drivers[0] : selectedCar.active_driver.user)
        // }

        // self.selectedCar.width = selectedCar.width
        // self.selectedCar.height = selectedCar.height
        // self.selectedCar.length = selectedCar.length

        const loader = new Loader(this.$store.getters.getGmapApiKey);

        loader.load().then(function (google) {

          const service = new google.maps.DistanceMatrixService()
          service.getDistanceMatrix(
            {
              origins: [origin],
              destinations: [destinations],
              travelMode: google.maps.TravelMode.DRIVING,
              unitSystem: google.maps.UnitSystem.IMPERIAL,
              avoidHighways: false,
              avoidTolls: false,
              avoidFerries: true
            },
            (response, status) => {
              if (status !== "OK") {
                self.selectedCar = {
                  driver_id: (selectedCar.active_driver == null ? selectedCar.drivers[0].user.id : selectedCar.active_driver.user.id),
                  car_id: selectedCar.id,
                  car_number: selectedCar.number,
                  car_type: selectedCar.type,
                  car_location: selectedCar.location,
                  active_driver: (selectedCar.active_driver == null ? selectedCar.drivers[0] : selectedCar.active_driver.user)
                }

                self.selectedCar.width = selectedCar.width
                self.selectedCar.height = selectedCar.height
                self.selectedCar.length = selectedCar.length
                self.selectedCar.miles_out = self.selectedLoad.miles

                alert("Error was: " + status)
              } else {

                if (response.rows[0].elements[0].status !== "OK") {
                  alert("Ошибка GOOGLE MAPS API при вычелсении дистанции. Статус: " + response.rows[0].elements[0].status)
                } else {
                  self.selectedLoad.miles_out = Math.floor(response.rows[0].elements[0].distance.value / 1609.34)
                  self.selectedLoad.approximate_time = response.rows[0].elements[0].duration.value
                }

                self.selectedCar = {
                  driver_id: (selectedCar.active_driver == null ? selectedCar.drivers[0].user.id : selectedCar.active_driver.user.id),
                  car_id: selectedCar.id,
                  car_number: selectedCar.number,
                  car_type: selectedCar.type,
                  car_location: selectedCar.location,
                  active_driver: (selectedCar.active_driver == null ? selectedCar.drivers[0] : selectedCar.active_driver.user)
                }

                self.dialogData.driversTable.items.forEach(function (val, index) {
                  let driver_id = val.active_driver == null ? val.drivers[0].user.id : val.active_driver.user.id
                  if (val.id == self.selectedCar.car_id && driver_id == self.selectedCar.driver_id) {
                    self.$set(self.dialogData.driversTable.items[index], 'miles_formatted', self.selectedLoad.miles_out)
                    self.$set(self.selectedCar, 'miles_out', self.selectedLoad.miles_out)
                  }
                })

                console.log(self.dialogData.driversTable)

                self.selectedCar.width = selectedCar.width
                self.selectedCar.height = selectedCar.height
                self.selectedCar.length = selectedCar.length
              }
            });
        });
      }
    },
    created() {
      this.setBrokeragesData();

      const self = this;
      let accessToken = this.$store.getters.getToken ?
        this.$store.getters.getToken :
        localStorage.getItem("etl-user-token");

      // isAdmin Check for administrator
      if (this.$store.getters.getCurrentUser.email === "admin@gmail.com") {
        self.isAdmin = true;
      }

      this.$globalEvents.$on("renewSettings", () => {
        const settings = this.$store.getters.getSettings;
        self.dialogData.message = settings.email_template;

        if (settings.companies_blacklist !== undefined) {
          self.companies_blacklist = settings.companies_blacklist.split("|");
        }
      });
      this.$globalEvents.$emit("renewSettings");

      this.filter();

      this.$globalEvents.$on("updateLoads", () => {
        this.filter();
      });

      this.$globalEvents.$on("heartbeat", () => {
        this.filter();
      });

      this.$globalEvents.$on("bidComes", () => {
        this.filter();
      });

      this.profile = this.$store.getters.getCurrentUser;
    },
    mounted() {
      this.$store.commit("updateToolbarData", {
        title: "",
        actions: [{
          type: "icon-text",
          text: "Capacity Search ",
          icon: "mdi-map-marker-radius",
          action: () => this.$router.push("/vehicles/map"),
          color: "blue",
          class: "blue--text text-capitalize",
        }, ],
      });
    },
    beforeDestroy() {
      this.$store.commit("updateToolbarData", {});
      this.$globalEvents.$off("heartbeat");
      this.$globalEvents.$off("renewCurrentUser");
      this.$globalEvents.$off("bidComes");
    },
    methods: {
      inputHandler(key, $event) {
        const value = this.formatNumber($event);
        this.selectedLoad[key] = value;
      },
      formatNumber(value) {
        if (value.length === 1 && value[0] === ".") {
          value = "0.";
        }
        return +value;
      },
      wrapPhonesInHtml(html) {
        let output = html;
        if (!output) return "";
        const self = this;

        output = output.replace(/(\+?\(?[\d ()_-]{8,}\d)/gi, function (str) {
          let number = "+1" + str.replace(/[^\d+|]/gi, "");
          return (
            '<span style="color: #1976d2; cursor:pointer" onclick=window.emitPhoneCall("' +
            number +
            '") >' +
            str +
            "</span>"
          );
        });

        return output;
      },
      setBrokeragesData() {
        let brokerages = localStorage.getItem("brokerages");

        if (brokerages === null) {
          this.brokeragesModel = this.brokerages.map((val) => val.email);
        } else {
          this.brokeragesModel = JSON.parse(brokerages);
        }
      },
      closeChat() {
        this.windowChatData.isOpen = false;
      },
      openChat(id) {
        let self = this;
        let accessToken = this.$store.getters.getToken ?
          this.$store.getters.getToken :
          localStorage.getItem("etl-user-token");

        axios({
            method: "post",
            url: self.$store.state.backendUrl + "/backend/api/users/current/chats",
            data: {
              driver_id: id,
            },
            headers: {
              Authorization: "JWT " + accessToken
            },
          })
          .then(function (response) {
            console.log(response);

            if (response.data.message == "Driver doesn`t exist") {
              alert("Driver doesn`t exist. Error opening chat");
              return;
            }

            response.data.chat_group_messages.reverse();

            let data = response.data;

            let chat_title = "";

            data.users.forEach(function (val, index) {
              if (index == 0) {
                chat_title += val.first_name;
              } else {
                chat_title += ", " + val.first_name;
              }
            });

            self.$globalEvents.$emit("setWindowChatData", true, {
              id: data.id,
              title: chat_title,
              messages: data.chat_group_messages,
              participants: data.users,
            });

            // self.loading = false;
          })
          .catch(function (error) {
            // self.loading = false;
            console.log(error);
          });
      },
      filter(from_input = false) {
        const self = this;

        if (this.onceLoading === false) {
          this.loading = true;
          this.onceLoading = true;
        }

        if (from_input) {
          this.loading = true;
        }
      console.log(this.filters);
        let filterGetParams = this.$globalFunctions.createFilterUrl(
          this.filters,
          this.sortingOptions,
          this.page
        );

        if (this.brokeragesModel.length > 0) {
          filterGetParams += "&brokerage__or=";
          this.brokeragesModel.map(function (value, index) {
            filterGetParams += value;
            if (index !== self.brokeragesModel.length - 1) {
              filterGetParams += ",";
            }
          });
        }

        if (this.companies_blacklist.length > 0) {
          filterGetParams += "&companies_blacklist=";
          this.companies_blacklist.map(function (value, index) {
            filterGetParams += value;
            if (index !== self.companies_blacklist.length - 1) {
              filterGetParams += "%%";
            }
          });
        }

        this.getLoads(filterGetParams)
          .then((data) => {
            const items = this.sortingAll(data);
            // console.log(this.$store.getters.getCurrentUser.email);
            // console.log(items.items);
            this.loads = items.items;
            this.totalLoads = items.total;
            this.loading = false;
          })
          .catch((err) => {
            // console.log(err);
            this.loading = false;
          });
      },
      clearFilters() {
        for (const filter in this.filters.values) {
          if (this.filters.values.hasOwnProperty(filter)) {
            const element = this.filters.values[filter];
            this.$set(element, "value", "");
          }
        }
        this.filter();
      },
      sort(index) {
        if (!this.headers[index].sortable) {
          return;
        }

        let order = "";

        if (this.headers[index].sorting == "ASC") {
          order = "DESC";
        } else if (this.headers[index].sorting == "") {
          order = "ASC";
        }

        this.sortingOptions = {
          orderBy: order == "" ? "id" : this.headers[index].value,
          order: order,
        };

        this.headers.forEach((item, i) => {
          if (i == index) {
            this.$set(this.headers[index], "sorting", order);
          } else {
            this.$set(this.headers[i], "sorting", "");
          }
        });

        this.filter();
      },
      sortingAll(loads) {
        let items = loads.results;
        const total = loads.count;

        items.forEach((item) => {
          item.modifiedDateTime = this.$globalFunctions.repairDatetime(
            item.modifiedDateTime
          );

          // let descr = []
          // if (item.isCanPutOnTop) {
          //     descr.push('Stackable')
          // }
          // if (item.isDanger) {
          //     descr.push('Dangerous')
          // }
          // if (item.isUrgent) {
          //     descr.push('Urgent')
          // }

          // item.descr = descr.join(', ')
        });

        return {
          items,
          total,
        };
      },
      sortingAllCars(cars) {
        const {
          sortBy,
          sortDesc,
          page,
          itemsPerPage
        } = this.options;

        let items = cars.results;
        const total = items.length;
        const self = this;

        // items.forEach(item => {
        //   let driver = item.active_driver == null ? item.drivers[0].user : item.active_driver

        // if (typeof driver.saved_loads !== 'undefined' && driver.saved_loads.length > 0) {
        //   driver.saved_loads.forEach(load => {
        //     if (load == this.selectedLoad.id) {
        //       item.bid = load.driver_price
        //     }
        //   })
        // }

        // item.miles = 'Loading...'
        // this.getDistance(item.location, this.selectedLoad.pickUpAt, item).then(data => {self.$set(item, 'miles', data);})

        // })

        if (sortBy.length === 1 && sortDesc.length === 1) {
          items = items.sort((a, b) => {
            const sortA = a[sortBy[0]];
            const sortB = b[sortBy[0]];

            if (sortDesc[0]) {
              if (sortA < sortB) return 1;
              if (sortA > sortB) return -1;
              return 0;
            } else {
              if (sortA < sortB) return -1;
              if (sortA > sortB) return 1;
              return 0;
            }
          });
        }

        if (itemsPerPage > 0) {
          items = items.slice((page - 1) * itemsPerPage, page * itemsPerPage);
        }

        return {
          items,
          total,
        };
      },
      getLoads(getParams = "") {
        let self = this;
        let accessToken = this.$store.getters.getToken ?
          this.$store.getters.getToken :
          localStorage.getItem("etl-user-token");

        return new Promise((resolve, reject) => {
          let loads = null;

          axios({
              method: "get",
              url: self.$store.state.backendUrl +
                "/backend/api/loads/all/" +
                getParams,
              headers: {
                Authorization: "JWT " + accessToken
              },
            })
            .then(function (response) {
              // console.log(response);
              loads = response.data;

              resolve({
                results: loads.results,
                count: loads.count,
              });
              // self.loading = false;
            })
            .catch(function (error) {
              // self.loading = false;
              console.log(error);
            });
        });
      },
      open(item) {
        this.selectedLoad = Object.assign({}, item);
        this.newPrice = this.selectedLoad.price;
        this.dialog = true;
        this.dialogData.driversTable.loading = true;
        this.dialogData.email = item.reply_email;

        this.selectedLoad.broker_price = item.price;

        this.$set(this.dialogData.mapData, "startLoc", item.start_location);
        this.$set(this.dialogData.mapData, "endLoc", item.end_location);

        const self = this;
        const accessToken = this.$store.getters.getToken ?
          this.$store.getters.getToken :
          localStorage.getItem("etl-user-token");

        axios({
            method: "get",
            url: self.$store.state.backendUrl +
              "/backend/api/loads/" +
              self.selectedLoad.id,
            headers: {
              Authorization: "JWT " + accessToken
            },
          })
          .then(function (response) {})
          .catch(function (error) {
            self.sendLoading = false;
            console.log(error);
          });

        this.getAvailableCars(item.id).then((data) => {
          const items = self.sortingAllCars(data);

          items.items.forEach(function (val, index) {
            items.items[index]["miles_formatted"] = false;
          });

          self.dialogData.driversTable.items = items.items;
          self.dialogData.driversTable.count = items.total;

          self.dialogData.driversTable.loading = false;
        });
      },
      convertSecondsToTime(sec) {
        const h = (sec / 3600) ^ 0;
        const m = ((sec - h * 3600) / 60) ^ 0;
        const s = sec - h * 3600 - m * 60;
        return (
          (h < 10 ? "0" + h : h) +
          "h. " +
          (m < 10 ? "0" + m : m) +
          "min. " +
          (s < 10 ? "0" + s : s) +
          "s."
        );
      },
      repairMail() {
        let mail = this.dialogData.message;
        mail = mail
          .replace(/\<script\>.+\<\/script\>/, "")
          .replace(/\[bold\]/gi, "<b>")
          .replace(/\[\/bold\]/gi, "</b>")
          .replace(/\{miles\}/gi, this.selectedLoad.miles)
          .replace(
            /\{sign\}/gi,
            this.profile.first_name + " " + this.profile.last_name
          )
          .replace(/\{vehicle\}/gi, this.selectedCar.car_type)
          .replace(/\{MCNumber\}/gi, this.selectedCar.car_number)
          .replace(
            /\{eta\}/gi,
            this.convertSecondsToTime(this.selectedLoad.approximate_time)
          )
          .replace(/\{brokerPrice\}/gi, this.selectedLoad.broker_price)
          .replace(
            /\{dims\}/gi,
            this.selectedCar.width +
            "x" +
            this.selectedCar.height +
            "x" +
            this.selectedCar.length +
            "in"
          )
          .replace(
            /\{mapLink\}/gi,
            this.$store.state.backendUrl +
            "/map/?company=" +
            this.$store.getters.getCurrentUser.company_info.user.id +
            "&load=" +
            this.selectedLoad.id
          );

        return mail;
      },
      sendProp(load) {
        if (!load.driver) {
          alert("Select driver, please");
          return;
        }

        if (load.broker_price == 0 || load.driver_price == 0) {
          alert("Select price, please");
          return;
        }

        this.sendLoading = true;
        const self = this;
        const accessToken = this.$store.getters.getToken ?
          this.$store.getters.getToken :
          localStorage.getItem("etl-user-token");
        const mail = this.repairMail();

        console.log(self.selectedCar.miles_out);
        // console.log(this);

        axios({
            method: "post",
            url: self.$store.state.backendUrl + "/backend/api/propositions/add/",
            data: {
              load: load.id,
              price: load.price ? load.price : load.driver_price,
              driver_price: load.driver_price ? load.driver_price : load.price,
              broker_price: load.broker_price ? load.broker_price : load.price,
              driver: self.selectedCar.driver_id,
              car: self.selectedCar.car_id,
              miles_out: self.selectedCar.miles_out,
              mail: mail,
            },
            headers: {
              Authorization: "JWT " + accessToken
            },
          })
          .then(function (response) {
            // console.log(response);
            // self.userCanMakeProposition = false
            self.sendLoading = false;
            self.dialog = false;
          })
          .catch(function (error) {
            self.sendLoading = false;
            console.log(error);
          });
      },
      async getDistance(from, to, item) {
        const self = this;
        const point_from = from.replace(" ", "%20");
        const point_to = to.replace(" ", "%20");
        const apiKey = this.$store.getters.getBingApiKey;

        let distance = 0;

        await axios({
            method: "get",
            url: "https://dev.virtualearth.net/REST/v1/Routes?wp.1=" +
              point_from +
              "&wp.2=" +
              point_to +
              "&key=" +
              apiKey +
              "&distanceUnit=mi",
          })
          .then(function (response) {
            distance = Math.round(
              response["data"]["resourceSets"][0]["resources"][0][
                "travelDistance"
              ]
            );
            // self.$set(item, 'distance', Math.round(response['data']['resourceSets'][0]['resources'][0]['travelDistance']))
          })
          .catch(function (error) {
            console.log(error);
            distance = 0;
            // self.$set(item, 'distance', 0)
          });

        return distance;
      },
      getAvailableCars(load_id) {
        const accessToken = this.$store.getters.getToken ?
          this.$store.getters.getToken :
          localStorage.getItem("etl-user-token");
        const self = this;

        return new Promise((resolve, reject) => {
          let loads = null;

          axios({
              method: "get",
              url: self.$store.state.backendUrl +
                "/backend/api/cars/my?free_only=true&load_id=" +
                self.selectedLoad.id,
              headers: {
                Authorization: "JWT " + accessToken
              },
            })
            .then(function (response) {
              // console.log(response)
              resolve(response.data);
              // self.loading = false;
            })
            .catch(function (error) {
              // self.loading = false;
              console.log(error);
            });
        });
      },
      brokerCostUpdate($event) {
        if (isNaN(+$event)) {
          this.selectedLoad.broker_price = this.formatNumber($event);
        } else {
          this.selectedLoad.broker_price = Math.floor(
            $event * this.selectedLoad.miles
          );
        }
      },
      driverCostUpdate($event) {
        if (isNaN(+$event)) {
          this.selectedLoad.driver_price = this.formatNumber($event);
        } else {
          this.selectedLoad.driver_price = Math.floor(
            $event * this.selectedLoad.miles
          );
        }
      },
      callToOwner(owner_id) {
        let self = this;
        let accessToken = this.$store.getters.getToken ?
          this.$store.getters.getToken :
          localStorage.getItem("etl-user-token");

        axios({
            method: "get",
            url: self.$store.state.backendUrl +
              "/backend/api/owners/" +
              owner_id +
              "/",
            headers: {
              Authorization: "JWT " + accessToken
            },
          })
          .then(function (response) {
            self.callTo(response.data.owner_info.user.phone_number);
          })
          .catch(function (error) {
            console.log(error);
          });
      },
      callTo(number) {
        this.$globalEvents.$emit("telephonyCallToNumber", number);
      },
    },
    computed: {
      brokerCostPerMile() {
        let cost = 0;
        const miles = this.selectedLoad.miles;
        const total = this.selectedLoad.broker_price;

        if (Number(miles) > 0) {
          cost = (total / miles).toFixed(1);
        }

        return Number(cost);
      },
      driverCostPerMile() {
        let cost = 0;
        const miles = this.selectedLoad.miles;
        const total = this.selectedLoad.driver_price;

        if (Number(miles) > 0) {
          cost = (total / miles).toFixed(1);
        }

        return Number(cost);
      },
    },
  };

</script>

<style lang="sass" scoped>
.load-dialog-content
  background-color: #FAFAFA

.flex
  display: flex
  align-items: center
  justify-content: center

.input-wrap
  width: 40px

  input
    text-align: center

.header-name
  &:hover
    cursor: pointer

table
  border-collapse: collapse

  thead
    tr
      th
        border-bottom: 1px solid #e0e0e0

  tbody
    tr
      transition: 0.1s

      &:hover
        background-color: #eee
        cursor: pointer

      td
        border-bottom: 1px solid #e0e0e0

      &:nth-child(even)
        background-color: #f2f2f2

.single-load-letter-preview
  border: 2px solid #d0d0d0
  padding: 10px
  margin-bottom: 10px

.table-col-title
  padding: 20px 0

.subtitle-1
  margin: 10px 0

.v-dialog > .v-card > .v-toolbar
  position: sticky
  top: 0
  z-index: 999

.v-application p
  margin-bottom: 0 !important

.load_meta, .load_meta b, .load_meta span
  font-size: 13px !important

.load_meta
  font-weight: 400

.load_meta b
  font-weight: 900

.load_meta_2 *
  line-height: 1.3

.load_meta_3
  line-height: 1.3

.not-viewed *
  font-weight: 800

::v-deep input::-webkit-outer-spin-button,
::v-deep input::-webkit-inner-spin-button
  -webkit-appearance: none
  margin: 0
</style>

