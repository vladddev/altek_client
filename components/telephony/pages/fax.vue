<template>
  <div class="cellphone-page-body">
    <div style="height: 630px" class="cellphone-container celphone-scroll-view">
      <div class="telephony-form">
        <div class="c-form-group">
          <label for="send_to" class="c-form-control form-title">Send to</label>
          <div class="cellphone-input_adv">
            <input id="send_to" type="text" class="c-form-control with-expansion" v-model="sendToModel" placeholder="Phone number"/>
            <img class="cellphone-input__button_right" src='/icons/phone-plus.svg' v-if="sendToModel.length > 0" @click="addRecipient"/>
          </div>
          <div class="cellphone-form-expansion" v-if="recipients.length > 0">
            <div class="cellphone-form-expansion__list">
              <div class="cellphone-form-expansion_list__item" v-for="(item, index) in recipients" :key="index">
                <span>{{item.number}}</span>
                <img src='/icons/phone-trash.svg' @click="deleteRecipient(index)"/>
              </div>
            </div>
          </div>
        </div>
        <div class="c-form-group">
          <label for="note" class="c-form-control form-title">Cover page notes</label>
          <textarea id="note" type="text" class="c-form-control" placeholder="Type message here (optional)"></textarea>
        </div>
        <div class="c-form-group">
          <label for="file" class="c-form-control form-title">Attach files</label>
          <label htmlFor="file" class="c-form-control file-attach with-expansion">
            <input id="file" ref="file" type="file" style="display: none" @change="addFile"/>
            <div class="file-attach-area">
              <span>My computer</span>
              <div class="file-attach-button"><img src='/icons/phone-attach.svg'/></div>
            </div>
          </label>
          <div class="cellphone-form-expansion" v-if="files.length > 0">
            <div class="cellphone-form-expansion__list">
              <div class="cellphone-form-expansion_list__item" v-for="(file, index) in files" :key="index">
                <div class="cellphone-form-expansion_list__item__name">
                  <img v-if="file.type === 'image'" src='/icons/phone-photo.svg'/>
                  <img v-else src='/icons/phone-doc.svg'/>
                  <span>{{file.name | fileName}}</span>
                  <small>{{file.size}} mb</small>
                </div>
                <img src='/icons/phone-trash.svg' @click="deleteFile(index)"/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="form-group">
        <button class="c-form-control large-btn">Send</button>
      </div>
    </div>
  </div>
</template>


<script>

export default {
  name: 'telephony-fax',
  data() {
    return {
      sendToModel: '',
      recipients: [],
      files: []
    }
  },
  methods: {
    addFile() {
      let file = this.$refs.file.files[0]
      this.files.push({
        name: file.name,
        type: file.type === 'image/jpeg' ? 'image' : 'docs',
        size: (file.size / (1024*1024)).toFixed(2),
        data: file
      })

      console.log(this.files)
    },
    addRecipient() {
      this.recipients.push({
        number: this.sendToModel
      })
      this.sendToModel = ''
    },
    deleteFile(index) {
      this.files.splice(index, 1);
    },
    deleteRecipient(index) {
      this.recipients.splice(index, 1);
    }
  },
  created() {


  },
  beforeDestroy() {

  },
  mounted() {
  },
  filters: {
    fileName: function (filename) {
      filename = filename.trim()
      return filename.length >= 10 ? filename.slice(0, 10) + '....' + filename.split('.').pop() : filename;
    }
  },
  components: {}
}
</script>

<style lang="css" scoped src="@/components/telephony/style.css"></style>
