<template>
  <v-dialog v-model="dialog" class="ma-8">
    <v-card>
      <v-card-title>Load #{{ selectedLoad.id }}</v-card-title>
      <v-container fluid>
        <v-row>
          <v-col cols="3">
            <v-card-text>
              <load-map v-bind:locData="dialogData.mapData"></load-map>
            </v-card-text>
            <v-card-text class="subtitle-2">
              Pick-up at: <span class="px-1 font-weight-bold body-1"> {{ selectedLoad.pickUpAt }} </span> <br>
              Deliver to: <span class="px-1 font-weight-bold body-1"> {{ selectedLoad.deliverTo }} </span> <br>
              Weight: <span class="px-1 font-weight-bold body-1"> {{ selectedLoad.weight }} </span> <br>
              Length: <span class="px-1 font-weight-bold body-1"> {{ selectedLoad.length }} </span> <br>
              Height: <span class="px-1 font-weight-bold body-1"> {{ selectedLoad.height }} </span> <br>
              Width: <span class="px-1 font-weight-bold body-1"> {{ selectedLoad.width }} </span> <br>
              Price: <span class="px-1 font-weight-bold body-1">
                {{ selectedLoad.price == 0 ? 'Best price' : selectedLoad.price }} </span> <br>
              Preferred transport type: <span class="px-1 font-weight-bold body-1"> {{ selectedLoad.car }} </span> <br>
              <template v-if="selectedLoad.note.length > 0">
                NOTE: <span class="px-1 font-weight-bold body-1"> {{ selectedLoad.note }} </span> <br>
              </template>
              Dangerous: <span class="px-1 font-weight-bold body-1"> {{ selectedLoad.isDanger ? 'Yes' : 'No' }} </span>
              <br>
              Urgent: <span class="px-1 font-weight-bold body-1"> {{ selectedLoad.isUrgent ? 'Yes' : 'No' }} </span>
              <br>
              Stackable: <span class="px-1 font-weight-bold body-1"> {{ selectedLoad.isCanPutOnTop ? 'Yes' : 'No' }}
              </span> <br>
              <div v-html="selectedLoad.mail_part"></div>
            </v-card-text>
          </v-col>
          <v-col cols="9">
            <v-row>
              <v-col cols="12">
                <v-card-title>Units found: {{ dialogData.driversTable.count }}</v-card-title>
              </v-col>
              <v-col cols="12">
                <v-data-table :headers="dialogData.driversTable.headers" :items="dialogData.driversTable.items"
                  :options.sync="options" :hide-default-footer="true" :items-per-page="-1"
                  :server-items-length="dialogData.driversTable.totalLoads" :loading="dialogData.driversTable.loading"
                  class="elevation-1">
                  <template v-slot:item.check="{ item }">
                    <v-radio-group v-model="selectedLoad.driver">
                      <v-radio :value="item"></v-radio>
                    </v-radio-group>
                  </template>
                  <!-- <template v-slot:item.miles="{ item }">
                                            <span>{{ getDistance(item.location, selectedLoad.pickUpAt, item) ? item.distance : 0 }}</span>
                                        </template> -->
                  <template v-slot:item.driver="{ item }">
                    <span>{{ item.active_driver == null ? item.drivers[0].email : item.active_driver.user.email }}</span>
                  </template>
                  <template v-slot:item.dimensions="{ item }">
                    <span>{{ item.length }}x{{ item.width }}x{{ item.height }}in.</span>
                  </template>
                  <template v-slot:item.actions="{ item }">
                    <v-btn small class="mr-2" color="green" dark
                      @click="callTo((item.active_driver == null ? item.drivers[0].phone_number : item.active_driver.user.phone_number))">
                      Driver
                    </v-btn>
                    <v-btn small color="red" dark @click="callTo(item.car_owner.phone)">
                      Owner
                    </v-btn>
                  </template>

                </v-data-table>
              </v-col>
              <v-col cols="12">
                <span class="heading-4">Broker email: {{ dialogData.email }}</span>
              </v-col>
              <v-col cols="12">
                <v-row>
                  <v-col cols="6">
                    <v-card-title>Bid placement: ({{ selectedLoad.miles }}ml)</v-card-title>
                    <v-row>
                      <v-col cols="6">
                        <v-text-field label="Price for broker" v-model="selectedLoad.broker_price" />
                      </v-col>
                      <v-col cols="6">
                        <v-text-field label="Price for driver" v-model="selectedLoad.driver_price" />
                      </v-col>
                      <v-col cols="6">
                        <v-text-field label="Price per mile" @input="brokerCostUpdate($event)"
                          :value="brokerCostPerMile" />
                      </v-col>
                      <v-col cols="6">
                        <v-text-field label="Price per mile" @input="driverCostUpdate($event)"
                          :value="driverCostPerMile" />
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="6">
                    <!-- <v-switch v-model="htmlMode" inset label="Edit as html"></v-switch> -->
                    <template v-if="htmlMode">
                      <v-card class="mb-3">
                        <v-card-text>
                          <div v-html="repairMail(dialogData.message)"></div>
                        </v-card-text>
                      </v-card>
                    </template>
                    <template v-else>
                      <v-textarea v-model="dialogData.message" class="caption" outlined rows="6"></v-textarea>
                    </template>
                    <div>
                      <v-btn color="green" @click="sendProp(selectedLoad)" dark>Place bid</v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>
