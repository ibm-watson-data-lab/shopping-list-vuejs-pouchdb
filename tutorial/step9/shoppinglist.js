var db = new PouchDB('shopping');

// Vue Material plugin
Vue.use(VueMaterial);

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

const sampleListItem = {
  "_id": "list:cj6mj1zfj000001n1ugjfkj33:item:cj6mn7e36000001p9n14fgk6s",
  "type": "item",
  "version": 1,
  "title": "",
  "checked": false,
  "createdAt": "",
  "updatedAt": ""
};

// Vue Material theme
Vue.material.registerTheme('default', {
  primary: 'blue',
  accent: 'white',
  warn: 'red',
  background: 'grey'
});

var app = new Vue({
  el: '#app',
  data: {
    pagetitle: 'Shopping Lists',
    shoppingLists: [],
    shoppingListItems: [],
    mode: 'showlist',
    singleList: null,
    currentListId: null,
    newItemTitle:''
  },
  computed: {
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

    // create database index on the 'type' field
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
    onClickAddShoppingList: function() {
      // open shopping list form
      this.pagetitle = 'New Shopping List';
      this.mode='addlist';
      this.singleList = JSON.parse(JSON.stringify(sampleShoppingList));
      this.singleList._id = 'list:' + cuid();
      this.singleList.createdAt = new Date().toISOString();
    },
    onBack: function() {
      this.mode='showlist';
      this.pagetitle='Shopping Lists';
    },
    onClickSaveShoppingList: function() {
      
      // add timestamps
      this.singleList.updatedAt = new Date().toISOString();

      // add to on-screen list
      this.shoppingLists.unshift(this.singleList);

      // write to database
      db.put(this.singleList).then((data) => {
        // keep the revision tokens
        this.singleList._rev = data.rev;

        // switch mode
        this.onBack();
      });
    },
    onClickList: function(id, title) {
      this.currentListId = id;
      this.pagetitle = title;
      this.mode = 'itemedit';
    },
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
    }
  }
});