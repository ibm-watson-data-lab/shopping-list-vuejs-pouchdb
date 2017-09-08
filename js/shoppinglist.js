
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

// if we have HTML like this
// <div data-id="x"><div><span>
// then findDataIt, given the span will recurse up the tree to
// find a node with a data-id attribute.
const findDataId = function(el) {
  var id = el.attr('data-id');
  if (!id) {
    var parent = el.parent();
    if (parent) {
      return findDataId(parent);
    }
  } else {
    return id;
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
    newItemTitle:''
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
    findUpdateDoc: function(docs, id) {
      var doc = null;
      for(var i in docs) {
        if (docs[i]._id == id) {
          doc = docs[i];
          this.$nextTick(() => {
            db.put(doc).then((data) => {
              doc._rev = data.rev;
            });
          });
          break;
        }
      }
    },
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
      this.findUpdateDoc(this.shoppingLists, id);
    },
    onClickEdit: function(ev) {
      var id = findDataId($(ev.target));
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
      var id = findDataId($(ev.target));
      for(var i in this.shoppingLists) {
        if (this.shoppingLists[i]._id == id) {
          db.remove(this.shoppingLists[i]).then(() => {
            this.shoppingLists.splice(i, 1);
          });
          break;
        }
      }
    },
    onClickList: function(ev) {
      this.currentListId = findDataId($(ev.target));
      this.listItems = [];

      var q = {
        selector: {
          type: 'item',
          list: this.currentListId,
          updatedAt: { '$gt': '' }
        },
        sort: [ { 'updatedAt': 'desc' }]
      };
      db.find(q).then((data) => {
        this.listItems = data.docs;
        this.mode = 'itemedit';
      });
    },
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
    onCheckListItem: function(v, ev) {
      var id = findDataId($(ev.target));
      this.findUpdateDoc(this.listItems, id);
    }

  }
})