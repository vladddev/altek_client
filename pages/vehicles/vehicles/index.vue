<template>
  <v-container fluid>
    <v-card :loading="loading" :disabled="loading">
      <table width="100%">
        <thead>
          <tr>
            <th
              v-for="(item, index) in headers"
              :key="index"
              class=""
              :class="{ 'header-name': item.sortable }"
              :width="item.width"
              style="padding: 0 10px"
            >
              <div v-if="item.text == 'checkbox'">
                <v-checkbox color="blue" v-model="checkAllModel"></v-checkbox>
              </div>
              <div
                v-else
                class="table-col-title"
                style="text-align: left; cursor: pointer"
                @click="sort(index)"
              >
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
            <th
              v-for="(item, index) in headers"
              :key="index"
              class=""
              :class="{ 'header-name': item.sortable }"
              :width="item.width"
              style="padding: 0 10px"
            >
              <div style="height: 44px">
                <template
                  v-if="
                    filters.values[item.value] &&
                    filters.values[item.value].type !== 'select'
                  "
                >
                  <v-text-field
                    dense
                    :type="filters.values[item.value].type"
                    :placeholder="item.text"
                    v-debounce:700ms="filter"
                    debounce-events="input"
                    v-model="filters.values[item.value].value"
                    class="subtitle-1"
                  ></v-text-field>
                </template>
                <template
                  v-else-if="
                    filters.values[item.value] &&
                    filters.values[item.value].type == 'select'
                  "
                >
                  <div
                    v-if="car_statuses_all.length == 0"
                    style="display: flex; height: 100%; align-items: center"
                  >
                    <v-progress-linear
                      color="blue accent-4"
                      indeterminate
                      rounded
                      height="6"
                    ></v-progress-linear>
                  </div>
                  <v-select
                    v-else
                    dense
                    class="subtitle-1"
                    :items="car_statuses_all"
                    v-model="filters.values[item.value].value"
                    item-text="name"
                    placeholder="Status"
                    @change="filter()"
                    item-value="id"
                  >
                    <!--                      <template v-slot:prepend-item>-->
                    <!--                        <v-list-item-->
                    <!--                          role="option"-->
                    <!--                          aria-selected="true"-->
                    <!--                          value="0"-->
                    <!--                          input-value="2"-->
                    <!--                          @click="filter()"-->
                    <!--                        >-->
                    <!--                          <v-list-item-content>-->
                    <!--                            <v-list-item-title>-->
                    <!--                              All-->
                    <!--                            </v-list-item-title>-->
                    <!--                          </v-list-item-content>-->
                    <!--                        </v-list-item>-->
                    <!--                      </template>-->
                  </v-select>
                </template>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in cars">
            <tr class="load-item" v-bind:key="item.id">
              <td
                v-for="(headProps, i) in headers"
                :key="i"
                class="text-center pa-1 body-2"
              >
                <div v-if="headProps.value == 'check'">
                  <v-checkbox
                    color="blue"
                    v-model="checkedCars"
                    :value="item.id"
                  ></v-checkbox>
                </div>
                <div v-else-if="headProps.value == 'id'">
                  <div style="white-space: nowrap">
                    <span>{{ item.id }}</span>
                  </div>
                </div>
                <div v-else-if="headProps.value == 'drivers'">
                  <div>
                    <template v-for="(driver, index) in item.drivers">
                      <template v-if="index == 0">
                        {{
                          driver.user != undefined ? driver.user.first_name : ""
                        }}
                      </template>

                      <template v-else>
                        ,
                        {{
                          driver.user != undefined ? driver.user.first_name : ""
                        }}
                      </template>
                    </template>
                  </div>
                </div>
                <div v-else-if="headProps.value == 'length'">
                  <div style="white-space: nowrap">
                    <span
                      >{{ item.length }}x{{ item.width }}x{{
                        item.height
                      }}
                      in.</span
                    >
                  </div>
                </div>
                <div v-else-if="headProps.value == 'status'">
                  <div v-if="car_statuses.length == 0">
                    <v-progress-linear
                      color="blue accent-4"
                      indeterminate
                      rounded
                      height="6"
                    ></v-progress-linear>
                  </div>
                  <div v-else style="white-space: nowrap">
                    <select
                      style="
                        width: 100px;
                        text-align: center;
                        text-align-last: center;
                      "
                      :vehicle-id="item.id"
                      :class="pickColorByStatus(item.status.name)"
                      class="table-changer-element"
                      @change="setStatus"
                    >
                      <option
                        v-for="(status, index) in car_statuses"
                        :selected="item.status.id === status.id"
                        :key="index"
                        :value="status.id"
                      >
                        {{ status.name }}
                      </option>
                    </select>
                  </div>
                </div>
                <div v-else-if="headProps.value == 'note'">
                  <div style="white-space: nowrap">
                    <input
                      type="text"
                      :vehicle-id="item.id"
                      class="table-changer-element note-input"
                      @input="setNote"
                      :value="item.note"
                    />
                  </div>
                </div>
                <div v-else-if="headProps.value == 'availableCity'">
                  <input
                    type="text"
                    :vehicle-id="item.id"
                    class="table-changer-element"
                    v-on:focus="setAutocomplete"
                    style="width: 100%"
                    :value="item.availableCity"
                  />
                </div>
                <div v-else-if="headProps.value == 'availableDate'">
                  <div style="white-space: nowrap">
                    <input
                      type="date"
                      class="table-changer-element"
                      :vehicle-id="item.id"
                      :value="
                        item.availableDates !== 'None'
                          ? item.availableDates
                          : ''
                      "
                      @change="setDate"
                      style="width: 125px"
                    />
                  </div>
                </div>
                <div
                  v-else-if="headProps.value == 'actions'"
                  style="display: flex; justify-content: space-evenly"
                >
                  <v-btn small icon color="blue" @click="openChat(item)">
                    <v-icon>mdi-message-text-outline</v-icon>
                  </v-btn>
                  <v-btn
                    small
                    icon
                    color="blue"
                    @click="openEditCarDialog(item)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </div>
                <div v-else>
                  <div style="white-space: nowrap">
                    {{ item[headProps.value] }}
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </v-card>
    <!--        <v-data-table-->
    <!--            :headers="headers"-->
    <!--            :items="cars"-->
    <!--            :options.sync="options"-->
    <!--            :server-items-length="totalCars"-->
    <!--            :loading="loading"-->
    <!--            class="elevation-1"-->
    <!--        >-->
    <!--            <template v-slot:item.dispatcher="{ item }">-->
    <!--                <span>{{ item.dispatcher ? item.dispatcher.email : '' }}</span>-->
    <!--            </template>-->
    <!--            <template v-slot:item.size="{ item }">-->
    <!--              <span>{{ item.length }}x{{ item.width }}x{{ item.height }} in.</span>-->
    <!--            </template>-->
    <!--            <template v-slot:item.status="{ item }">-->
    <!--              <select-->
    <!--                style="width: 100px; text-align: center; text-align-last: center"-->
    <!--                :vehicle-id="item.id"-->
    <!--                :class="pickColorByStatus(item.status.name)"-->
    <!--                class="table-changer-element"-->
    <!--                @change="setStatus">-->
    <!--                <option-->
    <!--                  v-for="(status, index) in car_statuses"-->
    <!--                  :selected="item.status.id === status.id"-->
    <!--                  :key="index"-->
    <!--                  :value="status.id">{{status.name}}-->
    <!--                </option>-->
    <!--              </select>-->
    <!--            </template>-->
    <!--            <template v-slot:item.availableCity="{ item }">-->
    <!--              <input type="text" :vehicle-id="item.id" class="table-changer-element" v-on:focus="setAutocomplete" style="width: 140px" :value="item.availableCity" />-->
    <!--&lt;!&ndash;              <span class="table-changer-city">{{ item.availableCity }}</span>&ndash;&gt;-->
    <!--            </template>-->
    <!--            <template v-slot:item.availableDate="{ item }">-->
    <!--              <input type="date" class="table-changer-element" :vehicle-id="item.id" :value="item.availableDates" @change="setDate">-->
    <!--            </template>-->
    <!--            <template v-slot:item.actions="{ item }">-->
    <!--                <v-btn-->
    <!--                    small-->
    <!--                    icon-->
    <!--                    color="blue"-->
    <!--                    @click="open(item)"-->
    <!--                >-->
    <!--                    <v-icon>mdi-pencil</v-icon>-->
    <!--                </v-btn>-->
    <!--            </template>-->
    <!--        </v-data-table>-->

    <v-dialog v-model="edit_car_dialog" max-width="700px">
      <v-card
        :loading="editCarData.loading"
        :disabled="editCarData.loading"
        elevation="10"
      >
        <v-card-title>Edit car #{{ editCar.id }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-subheader class="font-weight-bold subtitle-1"
              >General info:</v-subheader
            >
          </v-row>
          <v-divider></v-divider>
          <v-row>
            <v-col cols="4">
              <v-text-field label="Number" v-model="editCar.number" />
            </v-col>
            <v-col cols="4">
              <v-select
                v-model="editCar.type"
                :items="carVariants"
                :menu-props="{ maxHeight: '400' }"
                label="Transport type"
              ></v-select>
            </v-col>
            <v-col cols="4">
              <v-text-field label="Car model" v-model="editCar.carModel" />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Car year"
                type="number"
                v-model="editCar.carYear"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-subheader class="font-weight-bold subtitle-1"
              >Car sizes:</v-subheader
            >
          </v-row>
          <v-divider></v-divider>
          <v-row>
            <v-col cols="4">
              <v-text-field
                label="Width"
                v-model="editCar.width"
                type="number"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Height"
                v-model="editCar.height"
                type="number"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Length"
                v-model="editCar.length"
                type="number"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-subheader class="font-weight-bold subtitle-1"
              >Car details:</v-subheader
            >
          </v-row>
          <v-divider></v-divider>
          <v-row>
            <v-col cols="4">
              <v-text-field
                label="Available city"
                v-model="editCar.availableCity"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field label="Available weight" v-model="editCar.weight" />
            </v-col>
            <v-col cols="4">
              <v-text-field label="Vin" v-model="editCar.vin" />
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="Licence plate"
                v-model="editCar.licensePlate"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="Licance state"
                v-model="editCar.licenseState"
              />
            </v-col>
            <v-col cols="6">
              <v-menu
                ref="menu1"
                v-model="menu1"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="editCar.licenseExpiryDate"
                    label="Licence expiry date"
                    readonly
                    v-on="on"
                  >
                  </v-text-field>
                </template>
                <v-date-picker
                  v-model="editCar.licenseExpiryDate"
                  no-title
                  scrollable
                >
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="menu1 = false"
                    >Cancel</v-btn
                  >
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.menu1.save(editCar.licenseExpiryDate)"
                    >OK</v-btn
                  >
                </v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="6">
              <v-menu
                ref="menu2"
                v-model="menu2"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="editCar.insuranceExpiry"
                    label="Insurance expiry"
                    readonly
                    v-on="on"
                  >
                  </v-text-field>
                </template>
                <v-date-picker
                  v-model="editCar.insuranceExpiry"
                  no-title
                  scrollable
                >
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="menu2 = false"
                    >Cancel</v-btn
                  >
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.menu2.save(editCar.insuranceExpiry)"
                    >OK</v-btn
                  >
                </v-date-picker>
              </v-menu>
            </v-col>
          </v-row>
          <v-row>
            <v-subheader class="font-weight-bold subtitle-1"
              >Other information:</v-subheader
            >
          </v-row>
          <v-divider></v-divider>
          <v-row>
            <v-col cols="6">
              <v-select
                v-model="editCar.dispatcher"
                :items="dispatchers"
                item-text="email"
                item-value="id"
                :menu-props="{ maxHeight: '400' }"
                label="Dispatcher"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="editCar.car_owner"
                :items="car_owners"
                item-text="email"
                item-value="id"
                :menu-props="{ maxHeight: '400' }"
                label="Car owner"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                :loading="drivers == []"
                v-model="selectedDrivers"
                :items="drivers"
                item-text="email"
                item-value="id"
                :menu-props="{ maxHeight: '400' }"
                multiple
                :hint="editCar.car_owner == '' ? 'Please choose car owner' : ''"
                :persistent-hint="editCar.car_owner == ''"
                label="Drivers"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                :loading="drivers == []"
                v-model="activeDriver"
                :items="activeDriverItems"
                item-text="email"
                item-value="id"
                :menu-props="{ maxHeight: '400' }"
                label="Active driver"
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field label="Notice" v-model="editCar.note" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="edit_car_dialog = false"> Cancel </v-btn>
          <v-btn color="red" dark outlined @click="deleteConfirmDialog = true"
            >Delete
          </v-btn>
          <v-btn color="primary" type="submit" @click="submit">Submit </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteConfirmDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline"> Delete a car </v-card-title>
        <v-card-text
          >Are you sure you want to delete a car with id #{{ editCar.id }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="deleteConfirmDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn color="red darken-1" text @click="deleteCar(editCar.id)">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <newCarDialog
      :open="newCarDialogOpen"
      :close-event="closeNewCarDialog"
    ></newCarDialog>
  </v-container>
</template>

<script>
const { Loader } = require("google-maps");

import newCarDialog from "@/components/vehicles/new-car";
import Vue from "vue";
import vueDebounce from "vue-debounce";

Vue.use(vueDebounce);

let gmapLoader;
let autocomplete;
let places;
const countryRestrict = {
  country: "us",
};

const axios = require("axios");
export default {
  data() {
    return {
      autocomplete: null,
      loading: true,
      edit_car_dialog: false,
      totalCars: 0,
      options: {},
      editCar: {},
      drivers: [],
      deleteConfirmDialog: false,
      menu1: false,
      menu2: false,
      dispatchers: [],
      car_owners: [],
      selectedDrivers: [],
      selectedVehicle: [],
      activeDriver: "",
      carVariants: ["Cargo van", "Small straight", "Large straight"],
      car_statuses: [],
      car_statuses_all: [],
      cars: [],
      checkedCars: [],
      checkAllModel: false,
      formData: {},
      headers: [
        {
          text: "checkbox",
          value: "check",
          sorting: "",
          width: "4%",
          sortable: false,
        },
        {
          text: "Unit ID",
          value: "number",
          sorting: "",
          width: "8%",
          sortable: true,
        },
        // { text: 'Number', value: 'number', align: 'center'},
        {
          text: "Drivers",
          value: "drivers",
          sorting: "",
          width: "11%",
          sortable: true,
        },
        {
          text: "Type",
          value: "type",
          sorting: "",
          width: "10%",
          sortable: true,
        },
        {
          text: "Size",
          value: "length",
          sorting: "",
          width: "10%",
          sortable: true,
        },
        {
          text: "Status",
          value: "status",
          sorting: "",
          width: "9%",
          sortable: true,
        },
        {
          text: "Note",
          value: "note",
          sorting: "",
          width: "10%",
          sortable: true,
        },
        {
          text: "Available city",
          value: "availableCity",
          sorting: "",
          width: "14%",
          sortable: true,
        },
        {
          text: "Available date",
          value: "availableDate",
          sorting: "",
          width: "12%",
          sortable: true,
        },
        // { text: 'Max cargo weight', value: 'weight', align: 'center'},
        // { text: 'Status', value: 'status', align: 'center'},
        // { text: 'Dispatcher', value: 'dispatcher', align: 'center'},
        {
          text: "Actions",
          value: "actions",
          sorting: "",
          width: "7%",
          sortable: true,
        },
      ],
      newCarDialogOpen: false,
      editCarData: {},
      filters: {
        type: "multipart",
        values: {
          id: {
            type: "number",
            value: "",
          },
          drivers: {
            type: "text",
            value: "",
          },
          type: {
            type: "text",
            value: "",
          },
          note: {
            type: "text",
            value: "",
          },
          length: {
            type: "number",
            value: "",
          },
          status: {
            type: "select",
            value: 0,
          },
          availableCity: {
            type: "text",
            value: "",
          },
          // availableDate: {
          //   type: 'text',
          //   value: '',
          // }
        },
      },
      sortingOptions: {
        orderBy: "",
        order: "",
      },
      page: 1,
    };
  },
  methods: {
    deleteCar(id) {
      const self = this;
      let accessToken = this.$store.getters.getToken
        ? this.$store.getters.getToken
        : localStorage.getItem("etl-user-token");

      axios({
        method: "DELETE",
        url: self.$store.state.backendUrl + "/backend/api/cars/" + id + "/",
        headers: {
          Authorization: "JWT " + accessToken,
        },
      })
        .then(function (response) {
          self.deleteConfirmDialog = false;
          self.edit_car_dialog = false;
          self.$globalEvents.$emit("notify", "Deleted");
          self.filter();
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    openChat(item) {
      let driver_id =
        item.active_driver == null
          ? item.drivers[0].user.id
          : item.active_driver.user.id;

      const self = this;
      let accessToken = this.$store.getters.getToken
        ? this.$store.getters.getToken
        : localStorage.getItem("etl-user-token");

      axios({
        method: "post",
        url: self.$store.state.backendUrl + "/backend/api/users/current/chats",
        data: {
          driver_id: driver_id,
        },
        headers: {
          Authorization: "JWT " + accessToken,
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
    openEditCarDialog(item) {
      this.editCarData.loading = true;

      this.editCar = item;
      this.selectedDrivers = [];
      this.selectedVehicle = [];
      this.activeDriver = "";

      // this.setOwnersList() => self.setDriversList() => setDispatchersList
      // this.setOwnersList();

      this.setDispatchersList();

      if (this.editCar.drivers.length > 0) {
        let driversItems = [];
        let driversModel = [];

        this.editCar.drivers.forEach(function (val, index) {
          driversModel.push({
            id: val.user.id,
            email: val.user.email,
          });
        });
        this.selectedDrivers = driversModel;
        this.selectedVehicle = driversModel;
      }

      if (item.active_driver !== null) {
        this.activeDriver = item.active_driver.user.id;
      }

      this.edit_car_dialog = true;
    },
    // setOwnersList() {
    //   // const self = this;

    //   // const accessToken = this.$store.getters.getToken
    //   //   ? this.$store.getters.getToken
    //   //   : localStorage.getItem("etl-user-token");

    //   // axios({
    //   //   method: "get",
    //   //   url: self.$store.state.backendUrl + "/backend/api/owners/my/",
    //   //   headers: {
    //   //     Authorization: "JWT " + accessToken,
    //   //   },
    //   // })
    //   //   .then(function (response) {
    //   //     if (response.data == []) return false;

    //   //     let ownerItems = [];

    //   //     response.data.forEach(function (driver, index) {
    //   //       ownerItems.push({
    //   //         id: driver.id,
    //   //         email: driver.email,
    //   //       });
    //   //     });

    //   //     self.car_owners = ownerItems;

    //   //     self.setDriversList();
    //   //   })
    //   //   .catch(function (error) {
    //   //     console.log(error);
    //   //   });
    // },
    // setDriversList() {
    //   // const self = this;
    //   // const accessToken = this.$store.getters.getToken
    //   //   ? this.$store.getters.getToken
    //   //   : localStorage.getItem("etl-user-token");

    //   // axios({
    //   //   method: "get",
    //   //   url: self.$store.state.backendUrl + "/backend/api/users/drivers",
    //   //   headers: {
    //   //     Authorization: "JWT " + accessToken,
    //   //   },
    //   // })
    //   //   .then(function (response) {
    //   //     console.log("/backend/api/users/drivers  !!!!!", response.data);
    //   //     self.drivers = response.data;
    //   //     self.setDispatchersList();
    //   //   })
    //   //   .catch(function (error) {
    //   //     console.log(error);
    //   //   });
    // },
    setDispatchersList() {
      const self = this;
      const accessToken = this.$store.getters.getToken
        ? this.$store.getters.getToken
        : localStorage.getItem("etl-user-token");

      axios({
        method: "get",
        url:
          self.$store.state.backendUrl +
          "/backend/api/users/my/?for_working_group=true",
        headers: {
          Authorization: "JWT " + accessToken,
        },
      })
        .then(function (response) {
          self.dispatchers = response.data;
          self.editCarData.loading = false;
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    async submit() {
      this.loading = true;
      let self = this;
      const accessToken = this.$store.getters.getToken;

      let formData = JSON.parse(JSON.stringify(self.editCar));

      let formDrivers = [];
      let oldCarData = self.cars.find((car) => car.id === formData.id);

      if (this.selectedDrivers.length > 0) {
        this.selectedDrivers.forEach(function (val, index) {
          if (val.id !== undefined) {
            formDrivers.push(val.id);
          } else {
            formDrivers.push(val);
          }
        });
      }

      if (this.activeDriver !== "") {
        formData.active_driver_id = this.activeDriver;
      }

      if (typeof formData.dispatcher === "object") {
        formData.dispatcher = formData.dispatcher.id;
      }

      formData.drivers = formDrivers;

      if (formData.drivers.length == 0) delete formData.drivers;
      delete formData.status;
      delete formData.active_driver;

      axios({
        method: "PUT",
        url:
          self.$store.state.backendUrl +
          "/backend/api/cars/" +
          self.editCar.id +
          "/",
        data: formData,
        headers: {
          Authorization: "JWT " + accessToken,
        },
      })
        .then(function (response) {
          self.loading = false;
          self.edit_car_dialog = false;
          self.editCar = {};
          self.selectedDrivers = [];
          self.$globalEvents.$emit("notify", "Saved");
          self.filter();
        })
        .catch(function (error) {
          self.loading = false;
          console.log(error);
        });
    },
    closeNewCarDialog(with_update = false) {
      this.newCarDialogOpen = false;

      if (with_update) {
        this.filter();
      }
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
    filter() {
      this.loading = true;

      const filterGetParams = this.$globalFunctions.createFilterUrl(
        this.filters,
        this.sortingOptions,
        this.page
      );

      this.getCars(filterGetParams)
        .then((data) => {
          const items = this.sortingAll(data);
          this.cars = items.items;
          this.totalCars = items.total;

          this.loading = false;
        })
        .catch((err) => {
          console.log(err);
          this.loading = false;
        });
    },

    setNote(el) {
      const self = this;
      const accessToken = this.$store.getters.getToken
        ? this.$store.getters.getToken
        : localStorage.getItem("etl-user-token");

      axios({
        method: "put",
        url:
          self.$store.state.backendUrl +
          "/backend/api/cars/" +
          parseInt(el.target.getAttribute("vehicle-id")) +
          "/",
        data: {
          note: el.target.value,
        },
        headers: {
          Authorization: "JWT " + accessToken,
        },
      })
        .then(function (response) {
          self.$globalEvents.$emit("notify", "Saved");
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    setStatus(el) {
      const self = this;
      const accessToken = this.$store.getters.getToken
        ? this.$store.getters.getToken
        : localStorage.getItem("etl-user-token");

      let status_id = parseInt(el.target.value);

      axios({
        method: "put",
        url:
          self.$store.state.backendUrl +
          "/backend/api/cars/" +
          parseInt(el.target.getAttribute("vehicle-id")) +
          "/",
        data: {
          status: status_id,
        },
        headers: {
          Authorization: "JWT " + accessToken,
        },
      })
        .then(function (response) {
          self.$globalEvents.$emit("notify", "Saved");
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    setDate(el) {
      const self = this;
      const accessToken = this.$store.getters.getToken
        ? this.$store.getters.getToken
        : localStorage.getItem("etl-user-token");

      axios({
        method: "put",
        url:
          self.$store.state.backendUrl +
          "/backend/api/cars/" +
          parseInt(el.target.getAttribute("vehicle-id")) +
          "/",
        data: {
          availableDates: el.target.value,
        },
        headers: {
          Authorization: "JWT " + accessToken,
        },
      })
        .then(function (response) {
          self.$globalEvents.$emit("notify", "Saved");
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    onPlaceChanged(vehicle_id) {
      const self = this;
      const place = self.autocomplete;
      const accessToken = self.$store.getters.getToken
        ? this.$store.getters.getToken
        : localStorage.getItem("etl-user-token");

      axios({
        method: "put",
        url:
          self.$store.state.backendUrl +
          "/backend/api/cars/" +
          vehicle_id +
          "/",
        headers: {
          Authorization: "JWT " + accessToken,
        },
        data: {
          availableCity: place.formatted_address || place.name,
        },
      })
        .then(function (response) {
          self.$globalEvents.$emit("notify", "Saved");
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    setAutocomplete(el) {
      let self = this;

      gmapLoader.load().then(function (google) {
        const autocomplete = new google.maps.places.Autocomplete(el.target, {
          types: ["(regions)"],
          componentRestrictions: countryRestrict,
          fields: ["formatted_address", "name"],
        });

        // places = new google.maps.places.PlacesService(map);
        autocomplete.addListener("place_changed", function () {
          self.autocomplete = autocomplete.getPlace();
          self.onPlaceChanged(parseInt(el.target.getAttribute("vehicle-id")));
        });
      });
    },
    pickColorByStatus(status) {
      if (status === "Avaliable") {
        return "red--bg";
      }
    },
    sortingAll(cars) {
      let items = cars.results;
      const total = cars.count;

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
    getCars(getParams = "") {
      const self = this;
      const accessToken = this.$store.getters.getToken
        ? this.$store.getters.getToken
        : localStorage.getItem("etl-user-token");

      return new Promise((resolve, reject) => {
        let cars = null;

        axios({
          method: "get",
          url:
            self.$store.state.backendUrl + "/backend/api/cars/my/" + getParams,
          headers: {
            Authorization: "JWT " + accessToken,
          },
        })
          .then(function (response) {
            cars = response.data;
            resolve({
              results: cars.results,
              count: cars.count,
            });
            // self.loading = false;
          })
          .catch(function (error) {
            // self.loading = false;
            console.log(error);
          });
      });
    },
    // setDriversList() {
    //
    //   if (this.newCar.car_owner == null || this.newCar.car_owner == '') return false
    //
    //   const self = this
    //   const accessToken = this.$store.getters.getToken ? this.$store.getters.getToken : localStorage.getItem('etl-user-token')
    //
    //   axios({
    //     method: 'get',
    //     url: self.$store.state.backendUrl + '/backend/api/users/drivers?owner=' + self.newCar.car_owner,
    //     headers: {'Authorization': 'JWT ' + accessToken},
    //   })
    //     .then(function (response) {
    //       if (response.data == []) return false
    //
    //       self.drivers = response.data
    //
    //       let driverItems = []
    //       let driverModel = []
    //
    //       self.drivers.forEach(function (driver, index) {
    //         driverItems.push({
    //           id: driver.id,
    //           email: driver.email
    //         })
    //       })
    //
    //       self.newCar.driverItems = driverItems
    //
    //       self.newCar.drivers.forEach(function (driver, index) {
    //         driverModel.push({
    //           id: driver.user.id,
    //           email: driver.user.email
    //         })
    //       })
    //
    //       self.newCar.driverModel = driverModel
    //     })
    //     .catch(function (error) {
    //       console.log(error);
    //     });
    // }
  },
  watch: {
    checkedCars: function (val) {
      const self = this;
      const accessToken = this.$store.getters.getToken
        ? this.$store.getters.getToken
        : localStorage.getItem("etl-user-token");

      if (val.length > 0) {
        this.$store.commit("updateToolbarActions", [
          {
            type: "icon-menu",
            withBg: true,
            icon: "mdi-checkbox-marked-circle-outline",
            text: "Change status",
            color: "blue",
            items: this.car_statuses.map(function (value, index) {
              return {
                title: value.name,
                action: function () {
                  axios({
                    method: "POST",
                    url:
                      self.$store.state.backendUrl +
                      "/backend/api/cars/update/",
                    data: {
                      cars: val,
                      status_id: value.id,
                    },
                    headers: {
                      Authorization: "JWT " + accessToken,
                    },
                  })
                    .then(function (response) {
                      if (response.data.result === "ok") {
                        self.checkedCars = [];
                        self.checkAllModel = false;
                        self.$globalEvents.$emit("notify", "Saved");
                        self.filter();
                      }
                    })
                    .catch(function (error) {
                      console.log(error);
                    });
                },
              };
            }),
            // items: [
            //   {
            //     title: 'Edit',
            //     icon: 'mdi-pencil',
            //     action: function () {
            //       self.$router.push('/loads/' + self.loadData.id + '/')
            //     }
            //   }
            // ],
          },
        ]);
      } else {
        this.$store.commit("deleteToolbarActions");
      }
    },
    editCarData: function (val) {},
    checkAllModel: function (val) {
      if (!val) {
        this.checkedCars = [];
      } else {
        let checkedCars = [];
        this.cars.forEach(function (val, index) {
          checkedCars.push(val.id);
        });
        this.checkedCars = checkedCars;
      }
    },
  },
  created() {
    const self = this;

    const accessToken = this.$store.getters.getToken
      ? this.$store.getters.getToken
      : localStorage.getItem("etl-user-token");

    axios({
      method: "get",
      url: self.$store.state.backendUrl + "/backend/api/users/drivers",
      headers: {
        Authorization: "JWT " + accessToken,
      },
    })
      .then(function (response) {
        // console.log("/backend/api/users/drivers  created", response.data);
        self.drivers = response.data;
      })
      .catch(function (error) {
        console.log(error);
      });

    axios({
      method: "get",
      url: self.$store.state.backendUrl + "/backend/api/check-permissions/",
      params: {
        page: self.$router.history.current.path,
      },
      headers: {
        Authorization: "JWT " + accessToken,
      },
    })
      .then(function (response) {
        // console.log('/backend/api/check-permissions/', response.data);

        if (response.data.allow) {
          self.$globalEvents.$emit("permissionChecked");
        } else {
          // self.$router.push('/')
        }
      })
      .catch(function (error) {
        console.log(error);
      });

    this.$globalEvents.$on("permissionChecked", () => {
      axios({
        method: "get",
        url: self.$store.state.backendUrl + "/backend/api/cars/my/",
        headers: {
          Authorization: "JWT " + accessToken,
        },
      })
        .then(function (response) {
          // console.log("/backend/api/cars/my/", response.data);
          // let carsData = self.sortingAll(response.data)

          gmapLoader = new Loader(self.$store.getters.getGmapApiKey, {
            language: "en",
            libraries: ["places"],
          });

          axios({
            method: "get",
            url: self.$store.state.backendUrl + "/backend/api/car-statuses",
            headers: {
              Authorization: "JWT " + accessToken,
            },
          })
            .then(function (response) {
              // console.log("/backend/api/car-statuses", response.data);
              self.car_statuses = response.data;
              let data = JSON.parse(JSON.stringify(response.data));
              data.unshift({
                id: 0,
                name: "All",
              });
              self.car_statuses_all = data;
            })
            .catch(function (error) {
              console.log(error);
            });

          self.cars = response.data.results;
          self.totalCars = response.data.count;

          self.loading = false;
        })
        .catch(function (error) {
          console.log(error);
        });

      axios({
        method: "get",
        url: self.$store.state.backendUrl + "/backend/api/users/my/",
        headers: {
          Authorization: "JWT " + accessToken,
        },
      })
        .then(function (response) {
          // console.log("/backend/api/users/my/", response.data);
          self.dispatchers = response.data;
        })
        .catch(function (error) {
          console.log(error);
        });

      // axios({
      //   method: 'get',
      //   url: self.$store.state.backendUrl + '/backend/api/users/drivers/',
      //   headers: {'Authorization': 'JWT ' + accessToken},
      // })
      //   .then(function (response) {
      //     // console.log(response);
      //     self.drivers = response.data
      //   })
      //   .catch(function (error) {
      //     console.log(error);
      //   });

      axios({
        method: "get",
        url: self.$store.state.backendUrl + "/backend/api/owners/my/",
        headers: {
          Authorization: "JWT " + accessToken,
        },
      })
        .then(function (response) {
          // console.log("/backend/api/owners/my/", response.data);
          self.car_owners = response.data;
        })
        .catch(function (error) {
          console.log(error);
        });
    });
  },
  computed: {
    activeDriverItems() {
      if (this.selectedDrivers.length === 0) return;

      let drivers = [];
      const self = this;
      // console.log("drivers", self.drivers);
      self.drivers.map(function (val, index) {
        if (self.selectedDrivers[0].id !== undefined) {
          if (self.selectedDrivers.some((driver) => driver.id === val.id)) {
            drivers.push(val);
          }
        } else {
          if (self.selectedDrivers.some((id) => id === val.id)) {
            drivers.push(val);
          }
        }
      });
      // console.log(drivers)
      return drivers;
    },
  },
  components: {
    newCarDialog,
  },
  directives: {},
  mounted() {
    const self = this;
    this.$store.commit("updateToolbarData", {
      title: "Vehicles",
      backBtn: {
        callback: function () {
          window.history.back();
        },
      },
      actions: [
        {
          type: "icon-text",
          icon: "mdi-pencil-box-outline",
          text: "Add car",
          color: "blue",
          class: "blue--text text-capitalize",
          action: () => {
            self.newCarDialogOpen = true;
          },
        },
      ],
    });
  },
  beforeDestroy() {
    this.$store.commit("updateToolbarData", {});
    this.$globalEvents.$off("refreshTokens");
    this.$globalEvents.$off("permissionChecked");
  },
};
</script>

<style lang="sass" scoped>
.note-input
  width: 100%
  .table-changer-element
    text-align: center
  .table-changer-element:hover
    border: 1px solid #e0e0e0
    box-sizing: border-box !important
    padding: 2px
    border-radius: 3px
    cursor: pointer
  .table-changer-element:focus
    border: 1px solid #cfcfcf
    outline: none
    cursor: text
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
          padding: 0 10px
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
  .subtitle-1
    margin: 10px 0
  .v-dialog>.v-card>.v-toolbar
    position: sticky
    top: 0
    z-index: 999
  .v-application
    p
      margin-bottom: 0 !important
  /*.green--bg {*/
  /*  background-color: #E53935;*/
  /*}*/

  /*.red--bg {*/
  /*  background-color: #E53935;*/
  /*}*/

  /*blue--bg {*/
  /*  background-color: #E53935;*/
  /*}*/
</style>
