
// this will be the PouchDB database
var db = new PouchDB('shopping');

// template shopping list
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
    "address": {}
  },
  "createdAt": "",
  "updatedAt": ""
};

// template shopping list item
const sampleListItem = {
  "_id": "",
  "type": "item",
  "version": 1,
  "title": "",
  "checked": false,
  "createdAt": "",
  "updatedAt": ""
};

// sort comparison function to sort an objected by "updateAt" field
const newestFirst = (a, b) => {
  if (a.createdAt > b.createdAt) return -1;
  if (a.createdAt < b.createdAt) return 1;
  return 0 
};

// perform AJAX request
const ajax = function (url, querystring) {
  return new Promise(function(resolve, reject) {

    // construct URL
    var qs = [];
    for(var i in querystring) { qs.push(i + '=' + encodeURIComponent(querystring[i]))}
    url = url + '?' + qs.join('&');
    console.log('GET', url);

    // make HTTP GET request
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          var obj = JSON.parse(xmlhttp.responseText);
          resolve(obj);
        } else {
          reject(null);
        }
      }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  });
};

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
    mode: 'showlist',
    pagetitle: 'Shopping Lists',
    shoppingLists: [],
    shoppingListItems: [],
    singleList: null,
    currentListId: null,
    newItemTitle:'',
    places: [],
    selectedPlace: null,
    syncURL:'',
    syncStatus: 'notsyncing'
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
    },
    sortedShoppingLists: function() {
      return this.shoppingLists.sort(newestFirst);
    },
    sortedShoppingListItems: function() {
      return this.shoppingListItems.sort(newestFirst);
    }
  },
  // called once at app startup
  created: function() {

    // create database index on 'type'
    db.createIndex({ index: { fields: ['type'] }}).then(() => {
      
      // load all 'list' items 
      var q = {
        selector: {
          type: 'list'
        }
      };
      return db.find(q);
    }).then((data) => {

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
      app.shoppingListItems = data.docs;

      // load settings
      return db.get('_local/user');
    }).then((data) => {
      // if we have settings
      this.syncURL = data.syncURL;
      this.startSync();
    }).catch((e) => {})

  },
  methods: {
    onClickSettings: function() {
      this.mode = 'settings';
    },
    saveLocalDoc: function(doc) {
      return db.get(doc._id).then((data) => {
        doc._rev = data._rev;
        return db.put(doc);
      }).catch((e) => {
        return db.put(doc);
      });
    },
    onClickStartSync: function() {
      var obj = {
        '_id': '_local/user',
        'syncURL': this.syncURL
      };
      this.saveLocalDoc(obj).then( () => {
        this.startSync();
      });
    },
    startSync: function() {
      this.syncStatus = 'notsyncing';
      if (this.sync) {
        this.sync.cancel();
        this.sync = null;
      }
      if (!this.syncURL) { return; }
      this.syncStatus = 'syncing';
      this.sync = db.sync(this.syncURL, {
        live: true,
        retry: false
      }).on('change', (info) => {
        // handle change
        // if this is an incoming change
        if (info.direction == 'pull' && info.change && info.change.docs) {

          // loop through all the changes
          for(var i in info.change.docs) {
            var change = info.change.docs[i];
            var arr = null;

            // see if it's an incoming item or list or something else
            if (change._id.match(/^item/)) {
              arr = this.shoppingListItems;
            } else if (change._id.match(/^list/)) {
              arr = this.shoppingLists;
            } else {
              continue;
            }

            // locate the doc in our existing arrays
            var match = this.findDoc(arr, change._id);

            // if we have it already 
            if (match.doc) {
              // and it's a deletion
              if (change._deleted == true) {
                // remove it
                arr.splice(match.i, 1);
              } else {
                console.log('found a match', match);
                // modify it
                delete change._revisions;
                Vue.set(arr, match.i, change);
              }
            } else {
              // add it
              if (!change._deleted) {
                arr.unshift(change);
              }
            }
          }
        }
      }).on('error', (e) => {
        this.syncStatus = 'syncerror';
      }).on('denied', (e) => {
        this.syncStatus = 'syncerror';
      }).on('paused', (e) => {
        if (e) {
          this.syncStatus = 'syncerror';
        }
      });;
    },

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
        
        // modift the updated date
        doc.updatedAt = new Date().toISOString();

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
      this.singleList = JSON.parse(JSON.stringify(sampleShoppingList));
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
      var obj = JSON.parse(JSON.stringify(sampleListItem));
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

      // make request to the OpenStreetMap API
      var url = 'https://nominatim.openstreetmap.org/search';
      var qs = {
        format: 'json',
        addressdetails: 1, 
        namedetails: 1,
        q: this.singleList.place.title
      };
      ajax(url, qs).then((d) => {

        // add the list of places to our list
        this.places = d;

        // if there is only one item in the list
        if (d.length ==1) {
          // simulate selection of first and only item
          this.onChangePlace(d[0].place_id);
        }
      });

    },

    // when a place is selected from the list, we find the object in the list
    // and copy the lat/long, licence and name over to our database
    onChangePlace: function(v) {
      var doc = this.findDoc(this.places, v, 'place_id').doc;
      this.singleList.place.lat = doc.lat;
      this.singleList.place.lon = doc.lon;
      this.singleList.place.license = doc.licence;
      this.singleList.place.address = doc.address;
     },

     // when an item is to be deleted (not just checked), we find the object
     // delete it in the database and delete it from the UI
     onDeleteItem: function(id) {
       var match = this.findDoc(this.shoppingListItems, id);
       db.remove(match.doc).then((data) => {
         this.shoppingListItems.splice(match.i, 1);
       });
     }

  }
})