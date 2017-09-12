// Vue Material plugin
Vue.use(VueMaterial);

// Vue Material theme
Vue.material.registerTheme('default', {
  primary: 'blue',
  accent: 'white',
  warn: 'red',
  background: 'grey'
});

// this is the Vue.js app
var app = new Vue({
  el: '#app',
  data: {
    pagetitle: 'Shopping Lists'
  }
});