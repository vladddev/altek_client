<template>
  <div class="cellphone-page-body">
    <div class="cellphone-chat-body">
      <template v-if="!isDisplayShat">
        <div class="cellphone-list celphone-scroll-view cellphone-chat-list">
          <div
            v-for="(interlocutor, index) in interlocutors"
            :key="index"
            class="cellphone-list__item"
            @click="toСorrespondence(interlocutor)"
          >
            <div class="cellphone-list__item_avatar">
              <img :src="interlocutor.avatar" alt="" />
            </div>

            <div class="cellphone-chat-list__item_body">
              <div class="cellphone-list__item_name">
                <div class="title">
                  <span>{{ interlocutor.name }}</span>
                </div>

                <div class="subtitle">
                  <span>{{ interlocutor.messages | lastMessage }}</span>
                </div>
              </div>

              <div
                v-if="interlocutor.numberNewMessages > 0"
                class="cellphone-list__item_right"
              >
                <div class="cellphone-list__item_meta">
                  <div class="cellphone-chat__interlocutor-badge">
                    <span class="interlocutor-badge-message">{{
                      interlocutor.numberNewMessages
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="cellphone-chat__chat-display">
          <div class="chat-display__header">
            <div class="chat-dispaly__interlocutor-avatar">
              <img
                class="interlocutor-avatar"
                :src="interlocutor.avatar"
                alt=""
              />
            </div>

            <div class="chat-dispaly__interlocutor-name">
              <span> {{ interlocutor.name }} </span>
            </div>

            <div class="chat-dispaly__interlocutor-toolbar">
              <div class="chat-dispaly__interlocutor-icon">
                <img src="/icons/icon-chat-phon.svg" />
              </div>
              <div class="chat-dispaly__interlocutor-icon">
                <img src="/icons/icon-chat-more.svg" />
              </div>
            </div>
          </div>

          <div class="chat-dispaly__messages-block celphone-scroll-view">
            <div
              v-for="(message, index) in interlocutor.messages"
              :key="index"
              class="messages__message-wrapper"
              :class="{ owner: message.owner }"
            >
              <div class="chat-dispaly__interlocutor-avatar">
                <img
                  class="interlocutor-avatar"
                  :src="interlocutor.avatar"
                  alt=""
                />
              </div>
              <div class="message" :class="{ owner: message.owner }">
                <p class="message__text">
                  {{ message.text }}
                  <span class="message__time">{{ message.time }}</span>
                </p>
              </div>
            </div>
          </div>

          <form action="" @submit.prevent="">
            <div class="chat-display__bottom">
              <div class="chat-dispaly__typing">
                <input
                  name="typing"
                  id="typing"
                  placeholder="Start typing here"
                />
              </div>

              <div class="chat-dispaly__interlocutor-toolbar">
                <div class="chat-dispaly__interlocutor-icon">
                  <button type="submit">
                    <img src="/icons/icon-chat-airplane.svg" />
                  </button>
                </div>
                <div class="chat-dispaly__interlocutor-icon">
                  <img src="/icons/icon-chat-clip.svg" />
                </div>
              </div>
            </div>
          </form>
        </div>
      </template>

      <!-- <v-list @click="s">
          <template v-for="(user, index) in users">
            <v-list-item :key="index" @click="s" two-line class="pl-0 title">
              <v-list-item-avatar class="mr-2">
                <v-img :src="user.avatar" />
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title v-html="user.name"></v-list-item-title>
                <v-list-item-subtitle
                  v-html="user.message"
                ></v-list-item-subtitle>
              </v-list-item-content>

              <v-badge v-if="user.numberMessages > 0">
                <template v-slot:badge>
                  <span>{{ user.numberMessages }}</span>
                </template>
              </v-badge>
            </v-list-item>
            <v-divider :key="`${index} + d`" inset class="ml-10"></v-divider>
          </template>
        </v-list> -->
    </div>
  </div>
</template>


<script>
export default {
  name: "telephony-chat",
  data() {
    return {
      isDisplayShat: false,
      interlocutor: {},
      interlocutors: [],
      // interlocutor: {
      //   avatar:
      //     "https://flynow.ru/wp-content/themes/flynow-new/images/default-user.png",
      //   name: "Damien Jones",
      //   messages: [
      //     {
      //       text: "I have a problem with a load, please fix it asap",
      //       owner: false,
      //       time: "12:45",
      //     },
      //     { text: "I ", owner: false, time: "12:45" },
      //     { text: "I have a problem with a load", owner: true, time: "12:45" },
      //     { text: "I have a problem with a load", owner: false, time: "12:45" },
      //     { text: "I have a problem with a load", owner: true, time: "12:45" },
      //     { text: "I have a problem with a load", owner: true, time: "12:45" },
      //     { text: "I have a problem with a load", owner: true, time: "12:45" },
      //     { text: "I have a problem with a load", owner: true, time: "12:45" },
      //     { text: "I have a problem with a load", owner: true, time: "12:45" },
      //     { text: "I have a problem with a load I have a problem with ith a load I have a problem with a load", owner: true, time: "12:45" },
      //     {
      //       text: "I have a problem with a load, please fix it asap",
      //       owner: false,
      //       time: "12:45",
      //     },
      //   ],
      //   numberNewMessages: 1,
      // },
      // interlocutors: [],
      // interlocutors: [
      //   {
      //     avatar:
      //       "https://flynow.ru/wp-content/themes/flynow-new/images/default-user.png",
      //     name: "Damien Jones",
      //     numberNewMessages: 1,
      //     messages: [
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false,
      //       },
      //       { text: "I ", owner: false },
      //       { text: "I have a problem with a load", owner: true, time: "12:45" },
      //       { text: "I have a problem with a load", owner: false, time: "12:45" },
      //       { text: "I have a problem with a load", owner: true, time: "12:45" },
      //       { text: "I have a problem with a load", owner: true, time: "12:45" },
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false , time: "12:45"
      //       },
      //     ],
      //   },
      //   {
      //     avatar:
      //       "https://flynow.ru/wp-content/themes/flynow-new/images/default-user.png",
      //     name: "Dmitry Semenov",
      //     numberNewMessages: 0,
      //     messages: [
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false,
      //       },
      //       { text: "I ", owner: false },
      //       { text: "I have a problem with a load", owner: true, time: "12:45" },
      //       { text: "I have a problem with a load", owner: false, time: "12:45" },
      //       { text: "I have a problem with a load", owner: true , time: "12:45"},
      //       { text: "I have a problem with a load", owner: true , time: "12:45"},
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false, time: "12:45"
      //       },
      //     ],
      //   },
      //   {
      //     avatar:
      //       "https://flynow.ru/wp-content/themes/flynow-new/images/default-user.png",
      //     name: "Constantin Jones",
      //     numberNewMessages: 0,
      //     messages: [
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false,
      //       },
      //       { text: "I ", owner: false },
      //       { text: "I have a problem with a load", owner: true , time: "12:45"},
      //       { text: "I have a problem with a load", owner: false , time: "12:45"},
      //       { text: "I have a problem with a load", owner: true , time: "12:45"},
      //       { text: "I have a problem with a load", owner: true , time: "12:45"},
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false, time: "12:45"
      //       },
      //     ],
      //   },
      //   {
      //     avatar:
      //       "https://flynow.ru/wp-content/themes/flynow-new/images/default-user.png",
      //     name: "Yuliana Zimina",
      //     numberNewMessages: 0,
      //     messages: [
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false, time: "12:45"
      //       },
      //       { text: "I ", owner: false },
      //       { text: "I have a problem with a load", owner: true, time: "12:45" },
      //       { text: "I have a problem with a load", owner: false, time: "12:45" },
      //       { text: "I have a problem with a load", owner: true , time: "12:45"},
      //       { text: "I have a problem with a load", owner: true, time: "12:45" },
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false, time: "12:45"
      //       },
      //     ],
      //   },
      //   {
      //     avatar:
      //       "https://flynow.ru/wp-content/themes/flynow-new/images/default-user.png",
      //     name: "Alite Jones",
      //     numberNewMessages: 1,
      //     messages: [
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false, time: "12:45"
      //       },
      //       { text: "I ", owner: false },
      //       { text: "I have a problem with a load", owner: true , time: "12:45"},
      //       { text: "I have a problem with a load", owner: false , time: "12:45"},
      //       { text: "I have a problem with a load", owner: true , time: "12:45"},
      //       { text: "I have a problem with a load", owner: true , time: "12:45"},
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false, time: "12:45"
      //       },
      //     ],
      //   },
      //   {
      //     avatar:
      //       "https://flynow.ru/wp-content/themes/flynow-new/images/default-user.png",
      //     name: "Alite Jones",
      //     numberNewMessages: 1,
      //     messages: [
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false,
      //       },
      //       { text: "I ", owner: false },
      //       { text: "I have a problem with a load", owner: true, time: "12:45" },
      //       { text: "I have a problem with a load", owner: false, time: "12:45" },
      //       { text: "I have a problem with a load", owner: true , time: "12:45"},
      //       { text: "I have a problem with a load", owner: true, time: "12:45" },
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false, time: "12:45"
      //       },
      //     ],
      //   },
      //   {
      //     avatar:
      //       "https://flynow.ru/wp-content/themes/flynow-new/images/default-user.png",
      //     name: "Alite Jones",
      //     numberNewMessages: 1,
      //     messages: [
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false,
      //       },
      //       { text: "I ", owner: false },
      //       { text: "I have a problem with a load", owner: true , time: "12:45"},
      //       { text: "I have a problem with a load", owner: false , time: "12:45"},
      //       { text: "I have a problem with a load", owner: true , time: "12:45"},
      //       { text: "I have a problem with a load", owner: true , time: "12:45"},
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false, time: "12:45"
      //       },
      //     ],
      //   },
      //   {
      //     avatar:
      //       "https://flynow.ru/wp-content/themes/flynow-new/images/default-user.png",
      //     name: "Alite Jones",
      //     numberNewMessages: 1,
      //     messages: [
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false,
      //       },
      //       { text: "I ", owner: false },
      //       { text: "I have a problem with a load", owner: true },
      //       { text: "I have a problem with a load", owner: false },
      //       { text: "I have a problem with a load", owner: true },
      //       { text: "I have a problem with a load", owner: true },
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false,
      //       },
      //     ],
      //   },
      //   {
      //     avatar:
      //       "https://flynow.ru/wp-content/themes/flynow-new/images/default-user.png",
      //     name: "Alite Jones",
      //     numberNewMessages: 1,
      //     messages: [
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false,
      //       },
      //       { text: "I ", owner: false },
      //       { text: "I have a problem with a load", owner: true },
      //       { text: "I have a problem with a load", owner: false },
      //       { text: "I have a problem with a load", owner: true },
      //       { text: "I have a problem with a load", owner: true },
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false,
      //       },
      //     ],
      //   },
      //   {
      //     avatar:
      //       "https://flynow.ru/wp-content/themes/flynow-new/images/default-user.png",
      //     name: "Alite Jones",
      //     numberNewMessages: 1,
      //     messages: [
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false,
      //       },
      //       { text: "I ", owner: false },
      //       { text: "I have a problem with a load", owner: true },
      //       { text: "I have a problem with a load", owner: false },
      //       { text: "I have a problem with a load", owner: true },
      //       { text: "I have a problem with a load", owner: true },
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false,
      //       },
      //     ],
      //   },
      //   {
      //     avatar:
      //       "https://flynow.ru/wp-content/themes/flynow-new/images/default-user.png",
      //     name: "Alite Jones",
      //     numberNewMessages: 1,
      //     messages: [
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false,
      //       },
      //       { text: "I ", owner: false },
      //       { text: "I have a problem with a load", owner: true },
      //       { text: "I have a problem with a load", owner: false },
      //       { text: "I have a problem with a load", owner: true },
      //       { text: "I have a problem with a load", owner: true },
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false,
      //       },
      //     ],
      //   },
      //   {
      //     avatar:
      //       "https://flynow.ru/wp-content/themes/flynow-new/images/default-user.png",
      //     name: "Alite Jones",
      //     numberNewMessages: 1,
      //     messages: [
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false,
      //       },
      //       { text: "I ", owner: false },
      //       { text: "I have a problem with a load", owner: true },
      //       { text: "I have a problem with a load", owner: false },
      //       { text: "I have a problem with a load", owner: true },
      //       { text: "I have a problem with a load", owner: true },
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false,
      //       },
      //     ],
      //   },
      //   {
      //     avatar:
      //       "https://flynow.ru/wp-content/themes/flynow-new/images/default-user.png",
      //     name: "Alite Jones",
      //     numberNewMessages: 1,
      //     messages: [
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false,
      //       },
      //       { text: "I ", owner: false },
      //       { text: "I have a problem with a load", owner: true },
      //       { text: "I have a problem with a load", owner: false },
      //       { text: "I have a problem with a load", owner: true },
      //       { text: "I have a problem with a load", owner: true },
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false,
      //       },
      //     ],
      //   },
      //   {
      //     avatar:
      //       "https://flynow.ru/wp-content/themes/flynow-new/images/default-user.png",
      //     name: "Alite Jones",
      //     numberNewMessages: 1,
      //     messages: [
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false,
      //       },
      //       { text: "I ", owner: false },
      //       { text: "I have a problem with a load", owner: true },
      //       { text: "I have a problem with a load", owner: false },
      //       { text: "I have a problem with a load", owner: true },
      //       { text: "I have a problem with a load", owner: true },
      //       {
      //         text: "I have a problem with a load, please fix it asap",
      //         owner: false,
      //       },
      //     ],
      //   },
      // ],
    };
  },
  methods: {
    toСorrespondence(interlocutor) {
      this.isDisplayShat = true;
      this.interlocutor = interlocutor;
    },
  },
  filters: {
    lastMessage(messages) {
      console.log(messages);
      return messages[messages.length - 1].text;
    },
  },
};
</script>

<style lang="css" scoped src="@/components/telephony/style.css"></style>