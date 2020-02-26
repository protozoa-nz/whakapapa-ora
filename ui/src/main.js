import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import store from './store'

import { createProvider } from './plugins/vue-apollo'
import vuetify from './plugins/vuetify'
import VuejsClipper from 'vuejs-clipper'

if (process.env.VUE_APP_PLATFORM === 'cordova') {
  document.addEventListener('deviceready', main, false)
} else {
  main()
}

function main () {
  // install
  Vue.use(VuejsClipper)
  Vue.config.productionTip = false

  new Vue({
    router,
    // store,

    apolloProvider: createProvider(),
    vuetify,

    render: h => h(App)
  }).$mount('#app')
}
