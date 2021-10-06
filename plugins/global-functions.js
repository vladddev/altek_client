import Vue from 'vue'

const globalFunctions = {}

globalFunctions.install = function (Vue) {
  Vue.prototype.$globalFunctions = new Vue()

  Vue.prototype.$globalFunctions.repairDatetime = (dateString) => {
    if (!dateString) {
      return 'None'
    }

    const dateReg = /^.+[T]{1}.+[Z]{1}$/
    const dateReg2 = /^.+[T]{1}.+$/

    if (dateString.match(dateReg) == null && dateString.match(dateReg2) == null) {
      return dateString
    }

    const dateTimeArray = dateString.split('T');
    const date = dateTimeArray[0];
    const time = dateTimeArray[1];

    const normalizeDate = date.split('-').reverse().join('/')
    const normalizeTime = time.split('.')[0]

    return normalizeDate + ' ' + normalizeTime;
  }

  Vue.prototype.$globalFunctions.translateFilterColumn = (str = '') => {
    console.log(str);
    switch (str) {
      case 'Received':
        return 'modifiedDateTime'
        break;
      case 'Pick-up at':
        return 'pickUpAt'
        break;
      case 'Deliver to':
        return 'deliverTo'
        break;
      case 'Vehicle':
        return 'car'
        break;
      default:
        return str.toLowerCase();
        break;
    }
  }

  Vue.prototype.$globalFunctions.translateFilterValue = (str = '') => {
    switch (str) {
      case 'Does not equal':
        return 'not_equal'
        break;
      case 'More than':
        return 'more'
        break;
      case 'Less than':
        return 'less'
        break;
      default:
        return String(str).toLowerCase();
        break;
    }
  }

  Vue.prototype.$globalFunctions.createFilterUrl = (filter = null, sorting = null, page = 1) => {
    const self = Vue.prototype.$globalFunctions
    let url = '?'

    if (filter != null) {
      url += 'filter_type=' + filter.type + '&'
      if (filter.type == 'single') {
        if (filter.filterType !== '') {
          const filterObj = {
            filter_field: self.translateFilterColumn(filter.filterColumn),
            condition: self.translateFilterValue(filter.filterType),
            value: filter.filterValue
          }

          for (const key in filterObj) {
            url += key + '=' + filterObj[key] + '&'
          }
        }
      } else if (filter.type == 'multipart') {
        for (const key in filter.values) {

            if(filter.values[key].type == 'text' || filter.values[key].type == 'number') {

              if (filter.values[key].value) {
                
                if(filter.values[key].multiValues) {
                  url += key + '__or' + '=' + filter.values[key].value + '&'
                }else {
                  url += key + '__icontains' + '=' + filter.values[key].value + '&'
                }
              }

            }else if(filter.values[key].type == 'select') {

              if (filter.values[key].value !== 0) {
                url += key + '=' + filter.values[key].value + '&'
              }

            }else if(filter.values[key].type == 'range') {

              if (filter.values[key].value_gte) {
                url += key + '__gte' + '=' + filter.values[key].value_gte + '&'
              }
              if(filter.values[key].value_lte) {
                url += key + '__lte' + '=' + filter.values[key].value_lte + '&'
              }
            }
            // let coincidence = filter.values[key].type == 'text' || filter.values[key].type == 'number' ? '__icontains' : ''
            // url += key + coincidence + '=' + filter.values[key].value + '&'
        }
      }

    }

    if (sorting != null) {
      if (sorting.orderBy != '') {
        url += 'order_by=' + sorting.orderBy + '&order=' + sorting.order + '&'
      }
    }


    url += 'page=' + page

    return url
  }

  Vue.prototype.$globalFunctions.removeGmapsScripts = () => {
    let scripts = document.getElementsByTagName('script')
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src.indexOf('maps.googleapis') >= 0) {
        console.log(scripts[i].parentNode.removeChild(scripts[i]))
        // scripts[i].remove()
      }
    }
  }

}

Vue.use(globalFunctions)
