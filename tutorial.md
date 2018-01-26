# Shopping List with Vue.js & PouchDB Tutorial

This document describes how to build your own Shopping List app with Vue.js and PouchDB in a step-by-step tutorial.

##  Prerequisite Knowledge & Skills

You will need to know how a web page is built, including HTML and CSS. A working knowledge of JavaScript is also essential.

This tutorial will guide you through the process of creating the app on your machine, so it is recommended you have a code editor (I use [Visual Studio Code](https://code.visualstudio.com/)) and a web server - I use Python's built-in server (see Inital Set Up).

You'll also need a modern web browser, such as Google Chrome. It helps to use the browser's Developer Tools so that you can debug your app as you develop it. The tutorial is broken down into steps.  At the end of each step we've provided both a screenshot and an example of how all your files should look at this point, so you can always check against those or jump to a particular step if you need to.

##  Key Concepts

The shopping list app is a very simple web app consisting of a single HTML file, a single CSS file and a single JavaScript file. The web page will allow multiple shopping lists to be created (Food, Drink, Pets etc) each with a number of shopping list items associated with them (Bread, Wine, Dog Food etc). 

The web page will be controlled by [Vue.js](https://vuejs.org/) which will be responsible for transferring user input to the JavaScript app and for rendering the app's data in HTML. 

Later we will add *persistence* to the app by storing the shopping lists and items in an in-browser database [PouchDB](https://pouchdb.com/). This will allow your data to survive between sessions and allow the data to be synced to the cloud for safekeeping.  It will also allow the data to be used on multiple devices, even if they aren't consistently connected.

At the end of the tutorial we will have created a [Progressive Web App](https://developers.google.com/web/progressive-web-apps/), an enhanced website that can be "installed" on a mobile phone which can be used with or without an internet connection.

## Initial Set Up

First we need a new empty folder on your computer and three files that define our app:

- `index.html` - the HTML markup of our website
- `shoppinglist.js` - the "app" itself, storing the shopping list state and defining your application's logic
- `shoppinglist.css` - some CSS styling to customise our app's look

Create the three blank files in a new directory and we can start to build the application scaffolding.

We can leave our JavaScript and CSS files blank for now, but let's create a simple HTML file to start with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0"/>
  <title>Shopping List</title>

  <!-- our styles -->
  <link href="shoppinglist.css" type="text/css" rel="stylesheet" media="screen,projection"/>
</head>
<body>
   
  <h1>Hello World</h1>
  <!-- our code -->
  <script src="shoppinglist.js"></script>

  </body>
</html>
```

This web page does nothing but pull in your JavaScript & CSS files and show a "Hello World" message. You can run a simple web server on your machine to view your web page. I use Python's built-in web server:

```sh
python -m SimpleHTTPServer 8001
```

Once running, you can visit http://localhost:8001 in your web browswer to see your "Hello World" web page. Try modifying the contents of the 'h1' tag in index.html and refreshing your web browser to see the changes.

Your code should now look like [Tutorial Step 1 - Initial Set Up](tutorial/step1).

![step1](img/step1.png)

## Creating the Vue.js App

Next we need to add the Vue.js to our project. Vue.js is a JavaScript library that controls the follow of data from your JavaScript application to the HTML page, and vice versa. 

First we'll need to include some extra styling information in the 'head' section of your `index.html`, before the line that includes your CSS file:

```html
  <!-- Material Design icons and fonts  -->
  <link rel="stylesheet" href="//fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic">
  <link rel="stylesheet" href="//fonts.googleapis.com/icon?family=Material+Icons">

  <!-- Material Design styles for Vue.js  -->
  <link rel="stylesheet" href="https://unpkg.com/vue-material@0.7.4/dist/vue-material.css">
```

These are the fonts and styles required to turn a plain HTML app into one that adheres to the [Material Design Guidelines](https://material.io/guidelines/) - the design framework Google uses in its products. We are using a library called [Vue Material](http://vuematerial.io/) which contains a number of HTML components that are Vue.js compatible and conform to Material Design for very little effort on our part.

We also need some extra JavaScript objects at the bottom of our `index.html` file, just above the line that includes our `shoppinglist.js` file:

```html
 <!-- cuid - unique id generator -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/cuid/1.3.8/browser-cuid.min.js"></script>

  <!-- Vue.js - framework that handles DOM/Model interaction -->
  <script src="https://unpkg.com/vue@2.4.2/dist/vue.js"></script>

   <!-- vue-material - Material Design for Vue.js -->
   <script src="https://unpkg.com/vue-material@0.7.4/dist/vue-material.js"></script>
```

They are

- the `cuid` library that generates unique identifiers. We use this to create `_id` field for the documents we create
- the Vue.js JavaScript library itself
- the Vue-Material JavaScript that makes it easy to add Material Design UI to our app

We can then replace our hard-coded 'h1' tag with a 'div' tag that will become our Vue.js app:

```html
  <div id="app" class="app-viewport">
    <!-- top bar -->
    <md-whiteframe md-elevation="3" class="main-toolbar">
      <md-toolbar>
        
        <!-- page title -->
        <h2 class="md-title" style="flex: 1">{{ pagetitle }}</h2>

      </md-toolbar>
    </md-whiteframe> <!-- top bar -->


  </div>
```

It contains the top bar for our app and a placeholder for where our page title will be. Because our page title will vary as users progress through the app, we use the `{{ pagetitle }}` template markup to indicate that this value will come from our JavaScript app at run-time.

Finally, our `shoppinglist.js` needs some content:

```js
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
```

The above code hands control of the div whose id is 'app' to the Vue.js framework. It now controls how that div is updated. The `data` object in the Vue object is our app's *state*. Currently, it only holds the page title and the HTML template renders that page title on the top bar of the page. 

> Try altering the page title in your Developer Tools console. Type `app.pagetitle='Hello'` and your page title should update instantly. Vue.js is detecting that your app's state has changed and updates the HTML to reflect that. 

Your code should now look like [Tutorial Step 2 - Creating the Vue.js App](tutorial/step2) and in a web browser should be beginning to look like an app with a blue bar at the top.

![step2](img/step2.png)

## Adding data

Our app is going to store two types of data

- a collection of shoppping lists. Each shopping list has a name (e.g. Food) and an optional place (e.g. Walmart).
- collection of items that are paired with a single shopping list (e.g. Bread in the Food list)

Here's what a shopping list object, repsresented as JSON, would look like:

```js
{
  "_id": "list:cj6mj1zfj000001n1ugjfkj33",
  "type": "list",
  "version": 1,
  "title": "Groceries",
  "checked": false,
  "place": {
    "title": "Healthy Living"
  },
  "createdAt": "2017-08-21T18:40:00.000Z",
  "updatedAt": "2017-08-21T18:40:00.000Z"
}
```

Notice that `_id` of the document consists of the data type (list) and a unique identifier. We also represent the data type in the 'type' field and the other fields are self-explantory.

A shopping list item, is even simpler:

```js
{
  "_id": "item:cj6mn7e36000001p9n14fgk6s",
  "type": "item",
  "list": "list:cj6mj1zfj000001n1ugjfkj33",
  "version": 1,
  "title": "Mangos",
  "checked": false,
  "createdAt": "2017-08-21T18:43:00.000Z",
  "updatedAt": "2017-08-21T18:43:00.000Z"
}
```

It contains a reference to the id of list in which it belongs.

If we want to store a collection of shopping lists and a collection of items in our Vue.js app, all we need to do is add two arrays to the `data` object in our app:

```js
// this is the Vue.js app
var app = new Vue({
  el: '#app',
  data: {
    pagetitle: 'Shopping Lists',
    shoppingLists: [],
    shoppingListItems: []
  }
});
```

It's that simple. Next, in index.html, we want to render the `shoppingLists` array. This is achieved by doing the following:

- the [md-list tag](http://vuematerial.io/#/components/list) from the Vue Material library to render a Material Design list item
- the [v-for directive](https://vuejs.org/v2/guide/list.html) from the Vue.js library to iterate over each item in the `shoppingLists` array
- the [v-bind directive](https://vuejs.org/v2/guide/class-and-style.html) (represented here as `:key` and `:data-id`) to add attributes to HTML tags from our shoppingList object
- [curly bracket template syntax](https://vuejs.org/v2/guide/syntax.html) to surface data from our shoppingList object on the page

Place this code below your top bar in the index.html file:

```html
      <!-- list of shopping lists -->
      <md-list>
        <md-card v-for="list in shoppingLists" :key="list._id" :data-id="list._id">     
          <md-card-header>
            <div class="md-title">{{ list.title }}</div>
            <div class="md-subhead">{{ list.place.title }}</div>
          </md-card-header>
        </md-card>
      </md-list> <!-- list of shopping lists -->
```

You still won't see any data on your web page because the `shoppingList` array is empty. Let's simulate the addition of a new shopping list be running a command on the browser's Developer Tools console (you can access your JavaScript console in Chrome by choosing View --> Developers --> JavaScript Console from your Chrome menu. In Firefox it's Tools --> Web Developer --> Web Console):

```js
var obj = {_id:'list:1',type:'list',version:1,title:'Food',checked:false,place:{title:'Whole Foods'},createdAt: '', updatedAt:''}
app.shoppingLists.push(obj);
```

Let's tidy up the styling, by adding the following to your shoppinglist.css file:

```css
body {
  background-color: #9e9e9e
}

.md-theme-default.md-card {
  background-color: white !important;
  margin:20px
}

.main-toolbar{
  position:sticky;
  top:0px;
  z-index:1000;
}
```

Your code should now look like [Tutorial Step 3 - Adding data](tutorial/step3) and in a web browser should show any lists you manually push into the app's `shoppingList` array:

![step3](img/step3.png)

## Adding a shopping list

To be able to add a shopping list via our app, we need

- a button that takes to a "add shopping list" page
- a form to collect the title and place name of the shopping list
- some logic in our app to collect the form data and add it to the `shoppingList` array

First of all, we need to flip between "pages" in our app. This is a single page web app (so only one index.html file) so the concept of a page switch is something of an optical illusion. We simply flip the page title to "New Shopping List", add a back button to get back to the first page and stop displaying the list of shopping lists when we are in `addlist` mode.

Let's add a `mode` to the data object in our app and set it to `showlist` at startup:

```js
var app = new Vue({
  el: '#app',
  data: {
    pagetitle: 'Shopping Lists',
    shoppingLists: [],
    shoppingListItems: [],
    mode: 'showlist'
  }
});
```

and add `v-if` in our `index.html` to ensure that the list of shopping lists is only shown in `showlist` mode:

```html
    <!-- list of shopping lists -->
    <md-list v-if="mode == 'showlist'">
```

We can then add a floating button to our `index.html` which is clicked when the user wants to add a new shopping list. Add this code as the last item of your "app" div:

```html
      <!-- floating 'add shopping list' button -->
      <div class="floatingbutton" v-if="mode == 'showlist'">
        <md-button class="md-fab md-primary md-raised" v-on:click="onClickAddShoppingList">
          <md-icon>add</md-icon>
        </md-button>
      </div> <!-- floating 'add shopping list' button -->
```

The above button expects a `onClickAddShoppingList()` function to exist on your app, so let's add that as a 'method' to our Vue.js app:

```js
var app = new Vue({
  el: '#app',
  data: {
    pagetitle: 'Shopping Lists',
    shoppingLists: [],
    shoppingListItems: [],
    mode: 'showlist'
  },
  methods: {
    onClickAddShoppingList: function() {

      // open shopping list form
      this.pagetitle = 'New Shopping List';
      this.mode='addlist';
    }
  }
});
```

and some new CSS:

```css
.floatingbutton {
  position: fixed;
  bottom: 5px;
  right: 5px;
  z-index: 1000;
}
```

We can test that now. Your app should have a blue "+" button in the bottom right, which when clicked enters 'addlist' mode. But we have no means of getting back! Let's fix that by adding a back button as the first thing in our `md-toolbar` markup in `index.html`:

```html
        <!-- back button -->
        <md-button class="md-icon-button" v-if="mode != 'showlist'" v-on:click="onBack">
            <md-icon>arrow_back</md-icon>
        </md-button>
```

The button is programmed to only appear when not in 'showlist' mode, but we need to add its handler function `onBack` to the Vue.js app's `methods` object:

```js
    // when someone clicks 'back', restore the home screen
    onBack: function() {
      this.mode='showlist';
      this.pagetitle='Shopping Lists';
    }
```

Your web app should now allow you to navigate between your two screens.   Test it by clicking the `+` button, observing the title change and then clicking the `<-` button by the title to go back to the main page.

Let's add a new object to our Vue.js app to represent a new shopping list, the `data` element of the Vue object should look like this:

```js
  data: {
    pagetitle: 'Shopping Lists',
    shoppingLists: [],
    shoppingListItems: [],
    mode: 'showlist',
    singleList: null
  }

```

We will also add a global constant that represents the structure of a shopping list object (put this near the top of `shoppinglist.js` after the `use` call):

```js
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
```

We can use this shopping list structure to populate `singleList` when the `onClickAddShoppingList` function is called; so modify the Vue method in `shoppinglist.js` like this:

```js

    onClickAddShoppingList: function() {

      // open shopping list form
      this.pagetitle = 'New Shopping List';
      this.mode='addlist';
      this.singleList = JSON.parse(JSON.stringify(sampleShoppingList));
      this.singleList._id = 'list:' + cuid();
      this.singleList.createdAt = new Date().toISOString();
    }
```

Now we need to display a form when in 'addlist' mode. Add the following markup to your `index.html` before the list of lists:

```html
     <!-- add new shopping list form-->
      <md-card v-if="mode == 'addlist'">
        <md-card-header>Add Shopping List</md-card-header>
        <md-card-content>
          <md-input-container>
            <label>List name</label>
            <md-input placeholder="e.g. Food" v-model="singleList.title"></md-input>
          </md-input-container>   
          
          <md-input-container>
            <label>Place name</label>
            <md-input placeholder="e.g. Whole Foods, Reno" v-model="singleList.place.title"></md-input>            
          </md-input-container>   

        </md-card-content>
      </md-card> <!-- add new shopping list form -->
```

Try out your app. When you click the "+" button, you should see a form. Fill in the values and inspect `app.singleList` in your developer tools console to see the values you have typed. This is Vue.js magic working in reverse: moving data from the web page in your your JavaScript app seamlessly.

Your code should now look like [Tutorial Step 4 - Adding a shopping list](tutorial/step4):

![step4](img/step4.png)

Next we need to add a way to save the list!

## Storing the new shopping list

Saving the shopping list is very simple. We just need to add the `singleList` object to the start of our `shoppingLists` array in our Vue.js app. First we need a button that indicates the user wants to save the list (rather than press "back" and cancel the operation). For this we need a button in our `md-toolbar` tag that only displays in 'addlist' mode:

```html
        <!-- save new shopping list button -->
        <md-button class="md-icon-button" v-if="mode == 'addlist'" v-on:click="onClickSaveShoppingList" v-bind:disabled="singleList.title.length == 0">
          <md-icon>check</md-icon>
        </md-button>
```

This button remains disabled until the length of the `singleList.title` is greater than zero, so we can't save a list without a title. We also need to add an `onClickSaveShoppingList()` to our Vue.js app methods to handle the form submission:

```js
    onClickSaveShoppingList: function() {
      this.singleList.updatedAt = new Date().toISOString();
      this.shoppingLists.unshift(this.singleList);
      this.onBack();
    }
```

Your app should now save and display any number of shopping lists!

Let's go one stage further and add a button to show and edit the items on a list. First we need a new Vue.js data item to store the id of the list being viewed (`currentListId`) and a variable to store the new item title (`newItemTitle`):

```js
  data: {
    pagetitle: 'Shopping Lists',
    shoppingLists: [],
    shoppingListItems: [],
    mode: 'showlist',
    singleList: null,
    currentListId: null,
    newItemTitle:''
  }
```

Inside the `md-card` markup that we show for each of our lists, we can add a new final section that displays a button against each shopping list card:

```html
          <md-card-actions>
            <md-button v-on:click="onClickList(list._id, list.title)">
                <md-icon>chevron_right</md-icon>
            </md-button>
          </md-card-actions>
```

When the button is clicked, it calls `onClickList()`, passing it the id of the list and its name. Let's add a Vue.js method to handle that event:

```js
    // the user wants to see the contents of a shopping list
    // we load it and switch views
    onClickList: function(id, title) {
      this.currentListId = id;
      this.pagetitle = title;
      this.mode = 'itemedit';
    }
```

This sets the `currentListId`, changes the page title and switches the app's mode to `itemedit`. Let's add some new markup that is rendered when we are in `itemedit` mode:

```html
      <!-- shopping list item editor -->
      <md-list class="itemedit" v-if="mode == 'itemedit'">
        <md-list-item>
          <md-input-container>
            <md-input v-model="newItemTitle" placeholder="New item e.g. eggs" @keyup.enter.native="onAddListItem"></md-input>
          </md-input-container>
          <md-button class="md-icon-button md-list-action" v-on:click="onAddListItem" v-bind:disabled="newItemTitle.length == 0">
            <md-icon class="md-primary">add</md-icon>
          </md-button>
        </md-list-item>
        <md-list-item v-for="item in shoppingListItems" :key="item._id" v-if="item.list == currentListId">
          <div class="md-list-text-container">
            {{ item.title }}
          </div>
        </md-list-item>
      </md-list> <!-- shopping list item editor -->
```

This consists of:

- a form at the top to allow new list items to be added
- an 'add' button
- a list of shopping list items

Notice how the `md-list-item` doesn't display ALL the list items, only the ones that belong to the `currentListId`. Also see how the `onAddListItem()` function can be called by pressing the enter key on the input control, or by clicking add button. 

We need a new object template for an individual list item:

```js
const sampleListItem = {
  "_id": "list:cj6mj1zfj000001n1ugjfkj33:item:cj6mn7e36000001p9n14fgk6s",
  "type": "item",
  "version": 1,
  "title": "",
  "checked": false,
  "createdAt": "",
  "updatedAt": ""
};
```

And to go with that, an `onAddListItem()` method on our Vue.js app:

```js 
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
```

and finally, a tiny piece of CSS:

```css
.itemedit {
  background-color: white !important
}
```

Now your app should allow multiple lists to be defined, each with their own separate list items.

Your code should now look like [Tutorial Step 5 - Storing the new shopping list](tutorial/step5):

![step5](img/step5.png)

Now let's deal with checking items from the shopping list.

## Checking items

Check an item is a simple matter of setting the `checked` flag for a shopping list item. This is where Vue.js really helps. We can create HTML checkbox which is tied to the `checked` flag of each item in the shopping list and Vue.js will do the rest.

Put the following code in the `v-for` loop of the shopping list editor section of our index.html file:

```html
          <div>
            <md-checkbox v-model="item.checked" class="md-primary"></md-checkbox>
          </div>
```

and we're going to add a CSS class called "cardchecked" to every item that has been checked, by adding some extra markup around our rendering of the `item.title`: 

```html
            <span v-bind:class="{ cardchecked: item.checked}">{{ item.title }}</span>
```

> Hint for where to add the above code : look for the `<md-list-item v-for="item in shoppingListItems"...>` tag.

Finally, adding some extra CSS:

```css
.cardchecked {
  text-decoration: line-through;
  color: #ccc
}
```

That's it! You should now be able to check items from your shopping lists. Checked items should appear grey and crossed out.

Your code should now look like [Tutorial Step 6 - checking items](tutorial/step6):

![step6](img/step6.png)

Next up, we need to know how many items are ticked and how many are left on each list. Read on.


## Adding list counts

Next to each shopping list we need to display:

- how many items are checked in the list
- the total number of items in the list

e.g. Food 6/14

This requires us to instruct Vue.js to compute these aggregated values every time the underlying `shoppingListItem` array changes. Luckily, Vue.js has the concept of [computed properties](https://vuejs.org/v2/guide/computed.html) - we simply have to provide the aggregation function and the values can be automatically reflected in the markup.

First we add a new object called `computed` in our Vue.js app:

```js
var vm = new Vue({
  el: '#app',
  data: {
    ...
  },
  computed: {
  }
```

The `computed` object can contain any number of functions - one per computed value. We are going to add a new function called `counts` into the `computed` object:

```js
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
  }
```

This function iterates over the app's `shoppingListItems` array building up an object that contains `total` and `checked` for each list.  It creates data that looks like the example below:

```js
{
  'list:1': { checked:4, total:26 },
  'list:2': { checked:0, total:3 },
  'list:3': { checked:0, total:0 }
}
```

We can then use `counts` in our `md-card` that displays each shopping list:

```html
          <md-card-content v-if="counts[list._id]">
            {{ counts[list._id].checked }} / {{ counts[list._id].total }} 
          </md-card-content>
```

Now our shopping list will contain a summary counts of the shopping list items.

Your code should now look like [Tutorial Step 7 - Adding list counts](tutorial/step7):

![step7](img/step7.png)

Now we need to add a database to store the data between sessions. This is where PouchDB comes in.

## Adding a PouchDB database

PouchDB is an in-browser database. It allows your application state to be retained between site visits without sending any data to a server-side process. PouchDB can also sync with a remote Apache CouchDB or IBM Cloudant service, but for now we are going to concentrate on making the app store its shopping lists and shopping list items in a local PouchDB database.

PouchDB stores JSON documents, which is ideal for storing our shopping list and shopping list item objects. Our objects a distinguished by their `type` attribute ('list', or 'item') so we can store our data in the same database. Storing the same objects in the same table would be unusual for a relational database, but with document stores this is a common design pattern.

First we need to import the PouchDB libraries into our HTML file, above the line that imports our `shoppinglist.js` file:

```html
  <!-- PouchDB - in-browser database -->
  <script src="https://cdn.jsdelivr.net/gh/pouchdb/pouchdb@6.3.4/dist/pouchdb.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/pouchdb/pouchdb@6.3.4/dist/pouchdb.find.min.js"></script>
```

At the top of our `shoppinglist.js` we need to initialise a PouchDB database:

```js
var db = new PouchDB('shopping');
```

The `db` object is then ready to use immediately. We need to revist our `onClickSaveShoppingList()` function to add code to make it save the data to the database:

```js
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
    }
```

The `db.put` function writes the new object to the database. It returns to us an object containing a revision token `_rev`. We store this in our object, in case we need to update the same document in the future. 

We also need to revisit our `onAddListItem()` function to add the database logic for shopping list items too:

```js
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
    }
```

This should be enough to store shopping lists and their items in the database. Now we need to make sure the data is loaded when the website is first loaded. Vue.js calls a `created` function when it first starts up, which we define in the Vue object at the same level as `methods` and `computed` - we can put our startup code in there:

```js
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
  }
```

The above `created` function first creates an index on the the document's type field. This makes queries on this field more performant. We then follow the index creation with two queries: one for the shopping lists, the other for the shopping list items. The queries are expressed as a JSON object (see [Mango queries](https://pouchdb.com/guides/mango-queries.html)), where the 'selector' attribute describes the portion of the data to retrieve. The resultant data is stored directly in our app's `shoppingList` and `shoppingListItems` array.

Your code should now look like [Tutorial Step 8 - Adding a PouchDB database](tutorial/step8):

![step8](img/step8.png)

We're nearly there! Just a few more loose ends to tie up before we're done.

## Checkbox events

You may have noticed that when you tick or untick a shopping list item, the data is not saved to the database. Vue.js makes sure that the front end and the JavaScript app are in sync, but at the moment we are manually writing changes from the `shoppingLists` and `shoppingListItems` arrays to the database.

To close this loophole we need to add two more utility methods to our Vue.js app to enable us to locate and save items.  When we change records, we'll call `findUpdateDoc()` which itself uses `findDoc()`:

```js
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
        
        // modify the updated date
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
```

The methods we just added will be called by an `onCheckListItem()` method that we will also add now:

```js
    // when an shopping list item is checked, we just need
    // to keep the database in step
    onCheckListItem: function(id) {
      this.findUpdateDoc(this.shoppingListItems, id);
    }
```

Then we modify our checkbox markup to get it to call `onCheckListItem()` when the value changes:

```html
            <md-checkbox v-model="item.checked" class="md-primary" v-on:change="onCheckListItem(item._id)"></md-checkbox>
```

Your code should now look like [Tutorial Step 9 - Checkbox events](tutorial/step9):

## Making a PWA

The final step in our tutorial is to make our application into a Progressive Web App (PWA). A PWA is web application that can be "installed" on a mobile device with an icon on the home screen, just like a native mobile app. To achieve this we need the following components:

- a `manifest.json` in the same directory as your `index.html` file (copy [this one](manifest.json)). The manifest file contains your PWA's meta data including app name, icon urls and colour information.
- a Service Worker, which is a JavaScript process dedicated to your app that controls all the web traffic your app initiates. This allows the Service Worker to cache assets for offline access. Copy [this one](worker.js)
- some icons. Take [icon128x128.png](icon128x128.png) and [icon512x512.png](icon512x512.png)

You'll also need some additional lines in the `<head>` section of your index.html:

```html
  <!-- mobile styling -->
  <meta name="theme-color" content="#448AFF">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="#448AFF">
  <meta name="apple-mobile-web-app-title" content="Shopping List">

  <!-- PWA manifest -->
  <link rel="manifest" href="manifest.json">
```

That's it! Your app is now installable on your mobile's home screen after visiting its URL in your web browser. 

Your code should now look like [Tutorial Step 10 - Making a PWA](tutorial/step10):

![step8](img/screenshots.png)

## Syncing with a remote database

Now you have your PWA working it is very simple to sync your in-browser database to a remote database for backup or data-sharing purposes. In fact, it's a single function call:

```js
  db.sync(url, { live: true});
```

where `url` is the URL of a remote CouchDB, Cloudant or PouchDB database e.g.

```js
  var url = 'https://user:pass@host.cloudant.com/shopping';
```

With this in place, you can add content and then clear your browser cache or even use a different browser and still see the data.

The [complete version](https://ibm-watson-data-lab.github.io/shopping-list-vuejs-pouchdb/) of this implements syncing via a "settings" panel, where the remote database URL is entered.
 
## Summary

In this tutorial we have created a shopping list app from nothing but a handful of empty text files. It is a website that stores its data in a in-browser database and can be installed on mobile devices and used offline. 

The final version of the code can be found [here](https://ibm-watson-data-lab.github.io/shopping-list-vuejs-pouchdb/). It adds a handful of extra features not included in the tutorial:

- shopping lists can be edited and deleted
- shopping list items can be edited
- shopping list place names can be looked-up in a database of points-of-interest to get the address and geo-location
- shopping lists and shopping list items are sorted on load in "newest first" order
- settings page to allow syncing with a remote database
- auto updates when data is changed on another device


