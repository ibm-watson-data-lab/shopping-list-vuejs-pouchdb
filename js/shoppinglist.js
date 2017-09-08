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

const clone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

const mapCountItemsByList = function(doc) { 
  if (doc.type=='item') { 
    emit(doc.list, null);
  } 
}

const mapCountCheckedItemsByList = function(doc) { 
  if (doc.type=='item' && doc.checked) { 
    emit(doc.list, null);
  } 
}



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
    listItems: [],
    currentListId: null,
    newItemTitle:'',
    counts: {}
  },

  // called once at app startup
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
      return app.updateCounts()
    });

  },
  methods: {
    updateCounts: function() {
      return db.query({map: mapCountItemsByList, reduce:'_count'}, {group: true}).then( (data) => {
        for(var i in data.rows) {
          Vue.set(this.counts, data.rows[i].key, { total: data.rows[i].value, checked: 0 })
        }
        return db.query({map: mapCountCheckedItemsByList, reduce:'_count'}, {group: true});
      }).then( (data) => {
        for(var i in data.rows) {
          this.counts[data.rows[i].key].checked = data.rows[i].value;
        }
      });
    },
    // given an array (docs) and document id, loop through the docs
    // searching for the one with an _id of id. If you find it
    // write it to PouchDB and keep the revision token
    findUpdateDoc: function(docs, id) {
      var doc = null;
      return new Promise( (resolve, reject) => {
        for(var i in docs) {
          if (docs[i]._id == id) {
            doc = docs[i];
            this.$nextTick(() => {
              db.put(doc).then((data) => {
                doc._rev = data.rev;
                resolve(true)
              });
            });
            break;
          }
        }
      });

    },
    // when the user has hit the big + buton to say they want to
    // add new shopping list
    onClickAddShoppingList: function(e) {
      // open shopping list form
      this.singleList = clone(sampleShoppingList);
      this.singleList._id = 'list:' + cuid();
      this.singleList.createdAt = new Date().toISOString();
      this.pagetitle = 'New Shopping List';
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
      this.updateCounts();
    },

    // the use wants to edit an individual shopping list
    // (not the items, but the meta data)
    onClickEdit: function(id, title, ev) {
      for(var i in this.shoppingLists) {
        if (this.shoppingLists[i]._id == id) {
          this.singleList = this.shoppingLists[i];
          this.pagetitle = 'Edit - ' + title;
          this.mode='addlist';
          break;
        }
      }
    },

    // user wants to delete a shopping list. We kill the parent document
    // but the items remain in the database
    onClickDelete: function(id) {
      for(var i in this.shoppingLists) {
        if (this.shoppingLists[i]._id == id) {
          db.remove(this.shoppingLists[i]).then(() => {
            this.shoppingLists.splice(i, 1);
          });
          break;
        }
      }
    },

    // the user wants to see the contents of a shopping list
    // we load it and switch views
    onClickList: function(id, title) {
      this.currentListId = id
      this.listItems = [];

      var q = {
        selector: {
          type: 'item',
          list: id,
          updatedAt: { '$gt': '' }
        },
        sort: [ { 'updatedAt': 'desc' }]
      };
      db.find(q).then((data) => {
        this.listItems = data.docs;
        this.mode = 'itemedit';
        this.pagetitle = title;
      });
    },

    // when a new shopping list item is added
    // we create a new document and write it to the db
    onAddListItem: function() {
      var obj = clone(sampleListItem);
      obj._id = 'item:' + cuid();
      obj.title = this.newItemTitle;
      obj.list = this.currentListId;
      obj.createdAt = new Date().toISOString();
      obj.updatedAt = new Date().toISOString();
      db.put(obj).then( (data) => {
        obj._rev = data.rev;
        this.listItems.unshift(obj);
        this.newItemTitle = '';
      });
    },

    // when an shopping list item is checked, we just need
    // to keep the database in step
    onCheckListItem: function(id) {
      this.findUpdateDoc(this.listItems, id).then(() => {
        return this.updateCounts();
      });
    }

  }
})