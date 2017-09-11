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

const sampleListItem = {
  "_id": "list:cj6mj1zfj000001n1ugjfkj33:item:cj6mn7e36000001p9n14fgk6s",
  "type": "item",
  "version": 1,
  "title": "",
  "checked": false,
  "createdAt": "",
  "updatedAt": ""
};

// clone an object
const clone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

// sort comparison function to sort an objected by "updateAt" field
const  newestFirst = (a, b) => {
  if (a.updatedAt > b.updatedAt) return -1;
  if (a.updatedAt < b.updatedAt) return 1;
  return 0 
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
    shoppingListItems: [],
    singleList: null,
    currentListId: null,
    newItemTitle:'',
    places: [],
    selectedPlace: null
  },
  computed: {

    // computed functions return data derived from the core data.
    // if the core data changes, then this function will be called too.
    counts: function() {
      // calculate the counts of items and which items are checked,
      // grouped by shopping list
      var obj = {};
      // count #items and how many are checked
      for(var i in this.shoppingListItems) {
        var d = this.shoppingListItems[i];
        if (!obj[d.list]) {
          obj[d.list] = { total: 0, checked: 0};
        }
        obj[d.list].total++;
        if (d.checked) {
          obj[d.list].checked++;
        }
      }
      return obj;
    }
  },
  // called once at app startup
  created: function() {

    // initialize PouchDB
    db = new PouchDB('shopping');

    // create database index ordered by updatedAt date
    db.createIndex({ index: { fields: ['type'] }}).then(() => {
      
      // load all 'list' items ordered by updated date
      var q = {
        selector: {
          type: 'list'
        }
      };
      return db.find(q);
    }).then((data) => {

      // sort so that newest ones are at the top
      data.docs.sort(newestFirst);

      // write the data to the Vue model, and from there the web page
      app.shoppingLists = data.docs;

      // get all of the shopping list items
      var q = {
        selector: {
          type: 'item'
        }
      };
      return db.find(q);
    }).then((data) => {

      // sort newest first
      data.docs.sort(newestFirst);
      app.shoppingListItems = data.docs;
    });

  },
  methods: {

    // given a list of docs and an id, find the doc
    // in the list that has an _id that matches the incoming id
    findDoc: function (docs, id, key) {
      if (!key) {
        key = '_id';
      }
      var doc = null;
      for(var i in docs) {
        if (docs[i][key] == id) {
          doc = docs[i];
          break;
        }
      }
      return { i: i, doc: doc };
    },

    // find the id in docs and then 
    // write it to PouchDB and keep the revision token
    findUpdateDoc: function (docs, id) {

      // locate the doc
      var doc = this.findDoc(docs, id).doc;

      // if it exits
      if (doc) {

        // write it on the next tick (to give Vue.js chance to sync state)
        this.$nextTick(() => {

          // write to database
          db.put(doc).then((data) => {

            // retain the revision token
            doc._rev = data.rev;
          });
        });
      }
    },

    // when the user has hit the big + buton to say they want to
    // add a new shopping list
    onClickAddShoppingList: function() {

      // open shopping list form
      this.singleList = clone(sampleShoppingList);
      this.singleList._id = 'list:' + cuid();
      this.singleList.createdAt = new Date().toISOString();
      this.pagetitle = 'New Shopping List';
      this.places = [];
      this.selectedPlace = null;
      this.mode='addlist';
    },

    // when we know the name of the new shopping list we can
    // timestamp the object and save it
    onClickSaveShoppingList: function() {

      // add timestamps
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
        this.onBack();
      });
    },

    // when someone clicks 'back', restore the home screen
    onBack: function() {
      this.mode='showlist';
      this.pagetitle='Shopping Lists';
    },

    // the use wants to edit an individual shopping list
    // (not the items, but the meta data)
    onClickEdit: function(id, title, ev) {
      console.log('herey woo', id, title, ev)
      this.singleList = this.findDoc(this.shoppingLists, id).doc;
      this.pagetitle = 'Edit - ' + title;
      this.places = [];
      this.selectedPlace = null;
      this.mode='addlist';
    },

    // user wants to delete a shopping list. We kill the parent document
    // but the items remain in the database
    onClickDelete: function(id) {
      var match = this.findDoc(this.shoppingLists, id);
      db.remove(match.doc).then(() => {
        this.shoppingLists.splice(match.i, 1);
      });
    },

    // the user wants to see the contents of a shopping list
    // we load it and switch views
    onClickList: function(id, title) {
      this.currentListId = id;
      this.pagetitle = title;
      this.mode = 'itemedit';
    },

    // when a new shopping list item is added
    // we create a new document and write it to the db
    onAddListItem: function() {
      if (!this.newItemTitle) return;
      var obj = clone(sampleListItem);
      obj._id = 'item:' + cuid();
      obj.title = this.newItemTitle;
      obj.list = this.currentListId;
      obj.createdAt = new Date().toISOString();
      obj.updatedAt = new Date().toISOString();
      db.put(obj).then( (data) => {
        obj._rev = data.rev;
        this.shoppingListItems.unshift(obj);
        this.newItemTitle = '';
      });
    },

    // when an shopping list item is checked, we just need
    // to keep the database in step
    onCheckListItem: function(id) {
      this.findUpdateDoc(this.shoppingListItems, id);
    },

    onClickLookup: function() {
      var r = {
        url: 'https://nominatim.openstreetmap.org/search',
        data: {
          format: 'json',
          q: this.singleList.place.title
        }
      }
      $.ajax(r).done((d) => { 
        this.places = d;
      });

    },

    onChangePlace: function(v) {
      var doc = this.findDoc(this.places, v, 'place_id').doc;
      console.log('change place', v, JSON.stringify(doc));
      this.singleList.place.lat = doc.lat;
      this.singleList.place.lon = doc.lon;
      this.singleList.place.license = doc.licence;
      this.singleList.place.address = doc.display_name;
      console.log('change place', v, JSON.stringify(doc));
    }

  }
})