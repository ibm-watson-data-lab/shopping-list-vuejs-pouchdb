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
  methods: {
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
      this.singleList.updatedAt = new Date().toISOString();
      this.shoppingLists.unshift(this.singleList);
      this.onBack();
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
      this.shoppingListItems.unshift(obj);
      this.newItemTitle = '';
    }
  }
});