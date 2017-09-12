# Shopping List with Vue.js & PouchDB Tutorial

This document describes how to build your own Shopping List app with Vue.js and PouchDB in a step-by-step tutorial.

##  Prerequisite Knowledge & Skills

You will need to know how a web page is built, including HTML and CSS. A working knowledge of JavaScript is also essential.

This tutorial will guide you through the process of creating the app on your machine, so it is recommended you have a code editor (I use [Visual Studio Code](https://code.visualstudio.com/)) and a web server - I use Python's built-in server (see Inital Set Up).

You'll also need a modern web browser, such as Google Chrome. It helps to use the browser's Developer Tools so that you can debug your app as you develop it.

##  Key Concepts

The shopping list app is a very simple web app consisting of a single HTML file, a single CSS file and a single JavaScript file. The web page will allow multiple shopping lists to be created (Food, Drink, Pets etc) each with a number of shopping list items associated with them (Bread, Wine, Dog Food etc). 

The web page will be controlled by [Vue.js](https://vuejs.org/) which will be responsible for transferring user input to the JavaScript app and for rendering the app's data in HTML. 

Later we will add *persistance* to the app by storing the shopping lists and items in an in-browser database [PouchDB](https://pouchdb.com/). This will allow your data to survive between sessions and allow the data to be synced to the cloud for safekeeping.

At the end of the tutorial we will have created a [Progressive Web App](https://developers.google.com/web/progressive-web-apps/), an enhanced website that can be "installed" on a mobile phone which can be used with or without an internet connection.

## Initial Set Up

First we need a new empty folder on your computer and three files that define our app:

- index.html - the HTML markup of our website
- shoppinglist.js - the "app" itself, storing the shopping list state and defining your application's logic
- shoppinglist.css - some CSS styling to customise our app's look

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

## Creating the Vue.js App

Next we need to add the Vue.js to our project. Vue.js is a JavaScript library that controls the follow of data from your JavaScript application to the HTML page, and vice versa. 

First we'll need to include some extra styling information in the 'head' section of your index.html, before the line that includes your CSS file:

```html
  <!-- Material Design icons and fonts  -->
  <link rel="stylesheet" href="//fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic">
  <link rel="stylesheet" href="//fonts.googleapis.com/icon?family=Material+Icons">

  <!-- Material Design styles for Vue.js  -->
  <link rel="stylesheet" href="https://unpkg.com/vue-material@0.7.4/dist/vue-material.css">
```

These are the fonts and styles required to turn a plain HTML app into one that adheres to the [Material Design Guidelines](https://material.io/guidelines/) - the design framework Google uses in its products. We are using a library called [Vue Material](http://vuematerial.io/) which contains a number of HTML components that are Vue.js compatible and conform to Material Design for very little effort on our part.

We also need some extra JavaScript objects at the bottom of our index.html file, just above the line that includes our shoppinglist.js file:

```html
  <!-- Vue.js - framework that handles DOM/Model interaction -->
  <script src="https://unpkg.com/vue@2.4.2/dist/vue.js"></script>

   <!-- vue-material - Material Design for Vue.js -->
   <script src="https://unpkg.com/vue-material@0.7.4/dist/vue-material.js"></script>
```

This is the Vue.js core code and the Vue Material plugin.

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

Your code should now look like [Tutorial Step 2 - Initial Set Up](tutorial/step2) and in a web browser should be beginning to look like an app with a blue bar at the top.




First we'll need to include some extra JavaScript files in your index.html
* Adding a PouchDB Database
* Syncing Data
  * Configure a Database
     * Option 1: Apache CouchDB
     * Option 2: IBM Cloudant
     * Option 3: Cloudant Developer Edition
  * Configure Remote Database Credentials
  * Trigger Database Replication
* Adding Multi-User / Multi-Device Features with Hoodie
  * Installing Hoodie
  * Configuring Hoodie
  * Using the Hoodie Store API
  * Using Hoodie Account API
  * Testing Offline Sync
* Adding Gelocation Features
* What's next?
  * Other Features
  * Get Involved in the Offline First Community!
  * Further Reading and Resources