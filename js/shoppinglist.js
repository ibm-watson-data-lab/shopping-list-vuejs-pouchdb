
const sampleShoppingList = {
  "_id": "",
  "type": "list",
  "version": 1,
  "title": "",
  "checked": false,
  "place": {
    "title": "",
    "license": null,
    "lat": null,
    "lon": null,
    "address": null
  },
  "createdAt": "",
  "updatedAt": ""
};

const clone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

// Vue app
Vue.use(VueMaterial);

// theme
Vue.material.registerTheme('default', {
  primary: 'blue',
  accent: 'white',
  warn: 'red',
  background: 'grey'
})

// this will be the PouchDB database
var db = null;

// this is the Vue.js app
var app = new Vue({
  el: '#app',
  data: {
    mode: 'showlist',
    pagetitle: 'Shopping Lists',
    shoppingLists: [],
    singleList: null,
    listItems: []
  },
  created: () => {

    // initialize PouchDB
    db = new PouchDB('shopping');

    // create database index ordered by updatedAt date
    db.createIndex({ index: { fields: ['updatedAt'] }}).then(() => {
      // load all 'list' items ordered by updated date
      var q = {
        selector: {
          type: 'list',
          updatedAt: { '$gt': '' }
        },
        sort: [ { 'updatedAt': 'desc' }]
      };
      return db.find(q)
    }).then((data) => {
      // write the data to the Vue model, and from there the web page
      app.shoppingLists = data.docs;
    });

  },
  computed: {
    shoppingListSaveDisabled: function() {
      return (this.singleList.title.length == 0);
      //|| this.singleList.place.title.length == 0);
    }
  },
  methods: {
    onClickAddShoppingList: function(e) {
      // open shopping list form
      this.singleList = clone(sampleShoppingList);
      this.singleList._id = 'list:' + cuid();
      this.singleList.createdAt = new Date().toISOString();
      this.pagetitle = 'New Shopping List';
      this.mode='addlist';
    },
    onClickSaveShoppingList: function() {

      // add timestamps
      //console.log(JSON.stringify(this.singleList));
      this.singleList.updatedAt = new Date().toISOString();

      // add to on-screen list, if it's not there already
      if (typeof this.singleList._rev === 'undefined') {
        this.shoppingLists.unshift(this.singleList);
      }
      
      // write to database
      db.put(this.singleList).then((data) => {
        // keep the revision tokens
        this.singleList._rev = data.rev;

        // switch mode
        this.mode='showlist';
      });
    },
    onBack: function() {
      this.mode='showlist';
      this.pagetitle='Shopping Lists';
    },
    saveList: function(id) {
      // locate this document and save it to PouchDB
      for(var i in this.shoppingLists) {
        if (this.shoppingLists[i]._id == id) {
          this.$nextTick(() => {
            db.put(this.shoppingLists[i]).then((data) => {
              this.shoppingLists[i]._rev = data.rev;
            });
          })
          break;
        }
      }
    },
    onClickEdit: function(ev) {
      var id = $(ev.target.parentNode).attr('data-id');
      for(var i in this.shoppingLists) {
        if (this.shoppingLists[i]._id == id) {
          this.singleList = this.shoppingLists[i];
          this.pagetitle = 'Edit - ' + this.singleList.title;
          this.mode='addlist';
          break;
        }
      }
    },
    onClickDelete: function(ev) {
      var id = $(ev.target.parentNode).attr('data-id');
      for(var i in this.shoppingLists) {
        if (this.shoppingLists[i]._id == id) {
          db.remove(this.shoppingLists[i]).then(() => {
            this.shoppingLists.splice(i, 1);
            console.log('removed');
          });
          break;
        }
      }
    },
    onClickList: function(ev) {
      console.log('click card', ev);
      var id = $(ev.target).attr('data-id');
      this.mode = 'itemedit';
      this.listItems = [
        {
          "_id": "list:cj6mj1zfj000001n1ugjfkj33:item:cj6mn7e36000001p9n14fgk6s",
          "type": "item",
          "version": 1,
          "title": "Mangos",
          "checked": false,
          "createdAt": "2017-08-21T18:43:00.000Z",
          "updatedAt": "2017-08-21T18:43:00.000Z"
        },
        {
          "_id": "list:cj6mj1zfj000001n1ugjfkj33:item:cj6mn7e36000001p9n14fgk6s",
          "type": "item",
          "version": 1,
          "title": "Apples",
          "checked": false,
          "createdAt": "2017-08-21T18:43:00.000Z",
          "updatedAt": "2017-08-21T18:43:00.000Z"
        }
      ]
      console.log(id);
    }

  }
})