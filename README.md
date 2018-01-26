[![Build Status](https://travis-ci.org/ibm-watson-data-lab/shopping-list-vuejs-pouchdb.svg?branch=master)](https://travis-ci.org/ibm-watson-data-lab/shopping-list-vuejs-pouchdb)
![IBM Cloud Deployments](https://metrics-tracker.mybluemix.net/stats/4b4ca7dd406587d30b91b8ecff5eaf6b/badge.svg)

# Create an Offline First Shopping List with Vue.js and PouchDB

This code pattern is a reference implementation of an Offline First shopping list app, built as a [Progressive Web App](https://developers.google.com/web/progressive-web-apps/) using [Vue.js](https://vuejs.org/) and [PouchDB](https://pouchdb.com/). [This app is part of a series of Offline First demo apps, each built using a different stack.](https://github.com/ibm-watson-data-lab/shopping-list)

When the reader has completed this Code Pattern and explored the code in this GitHub repository, they will understand how to:

- create a shopping list web application that stores its data in a local PouchDB database.
- turn the web application into a Progressive Web App that works with or without an internet connection.
- make the app sync to and from a remote Cloudant database.

![](doc/source/images/architecture.png)

## Flow

1. Browser loads Progressive Web App's resources from the web server. 
2. User interacts with the web app to add shopping lists and list items. 
3. Data is stored locally in PouchDB.
4. PouchDB syncs its data with a remote IBM Cloudant database.


## Included components

* [Cloudant NoSQL DB](https://console.ng.bluemix.net/catalog/services/cloudant-nosql-db): A fully-managed data layer designed for modern web and mobile applications that leverages a flexible JSON schema. Based on the open source Apache CouchDB, IBM Cloudant provides additional full text and geospatial capabilities.

## Featured technologies

* [PouchDB](https://pouchdb.com/) - an in-browser database that can replicate to and from a remote Apache CouchDB or IBM Cloudant database.
* [Vue.js](https://vuejs.org/) - a progressive JavaScript framework.
* [Apache CouchDB](http://couchdb.apache.org/) - modern, document database hosted on your server or in the cloud.

## Key concepts

This shopping list app is a small single page web application consisting of an HTML file, a couple of CSS files, and a single JavaScript file, the Vue.js framework, and the PouchDB library. The web page will allow multiple shopping lists to be created (e.g., Groceries, Clothes, etc.) each with a number of shopping list items associated with them (e.g., Bread, Water, etc.).

So what sets this app apart? Its Offline First architecture. The Offline First approach plans for the most constrained network environment first, enabling a great user experience even while the device is offline or has only an intermittent connection, and providing progressive enhancement as network conditions improve. This design also makes the app incredibly performant (fast!) on the best of networks. 

PouchDB, CouchDB, and Service Worker are the primary tools that turn our simple shopping list app into a high performance, offline-capable Progressive Web App.

**Data stays safe on your device, even while it's offline.**
Persistence of shopping lists and item data entered by the user is achieved using the in-browser database PouchDB. This will allow your data to survive between sessions and when disconnected from the network. (Whether you remember that you need juice while you're on your trusty home Wi-Fi or in the middle of the wilderness, you can still add it your list.)

**Data syncs between devices when a connection is available.**
When a connection is available, the data is synced from the local device to a CouchDB database in the cloud, and can thus be shared across multiple devices or users. (Need to share your grocery list with your roommate or access it on both your phone and your laptop? No problem!)

**The app loads quickly, even while offline.**
To keep the app itself functional while offline, a [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) is used to cache page resources (the most important HTML, CSS, and JavaScript files) when the web application is first visited. Each device must have a connection for this first visit, after which the app will be fully functional even while offline or in shoddy network conditions. (No more error messages or frustratingly slow page loads.)

**The app can be installed on a mobile device.**
In combination with the Service Worker used for caching, a [manifest file]((https://w3c.github.io/manifest/)) containing metadata allows the app to become a Progressive Web App, an enhanced website that can be installed on a mobile device and can then be used with or without an internet connection. (It's secretly still a website, but you can access it through one of those handy dandy little app icons on your homescreen!)

Explore the code in this GitHub repository to see how the Offline First design is applied.

# Tutorial

Refer to the [tutorial](https://github.com/ibm-watson-data-lab/shopping-list-vuejs-pouchdb/tree/master/tutorial.md) for step-by-step instructions on how to build your own Offline First shopping list Progressive Web App with Vue.js and PouchDB.

# Live demo 

To see this app in action without installing anything, simply visit [https://ibm-watson-data-lab.github.io/shopping-list-vuejs-pouchdb](https://ibm-watson-data-lab.github.io/shopping-list-vuejs-pouchdb/) in a web browser or on your mobile device.

# Steps

Want to check out the end product on your own machine? Follow these steps to deploy your own instance of the shopping list app.

This app can be deployed to IBM Cloud. You can also run this app on your local machine for development purposes using either a local Apache CouchDB instance or an IBM Cloudant service instance from the IBM Cloud Catalog.

* [Deploy to IBM Cloud](#deploy-to-ibm-cloud) **OR** [Run locally](#run-locally)
* [Database and replication setup](#database-and-replication-setup)

## Deploy to IBM Cloud
[![Deploy to IBM Cloud](https://metrics-tracker.mybluemix.net/stats/4b4ca7dd406587d30b91b8ecff5eaf6b/button.svg)](https://bluemix.net/deploy?repository=https://github.com/ibm-watson-data-lab/shopping-list-vuejs-pouchdb)

1. Press the above ``Deploy to IBM Cloud`` button and then click on ``Deploy``.

1. In Toolchains, click on Delivery Pipeline to watch while the app is deployed. Once deployed, the app can be viewed by clicking `View app`.

1. To see the app and services created and configured for this code pattern, use the IBM Cloud dashboard. The app is named `shopping-list-vue-pouchdb` with a unique suffix. The following services are created and easily identified by the `sljsp` prefix:
   * sljsp-CloudantNoSQLDB

## Run locally

> NOTE: These steps are only needed when running locally instead of using the ``Deploy to IBM Cloud`` button.


1. [Clone the repo](#1-clone-the-repo)
1. [Install the prerequisites](#2-install-the-prerequisites)
1. [Run the server](#3-run-the-server)
1. [Create a Cloudant or CouchDB service](#4-create-a-cloudant-or-couchdb-service)

### 1. Clone the repo

Clone the `shopping-list-vuejs-pouchdb` locally. In a terminal, run:

```
$ git clone https://github.com/ibm-watson-data-lab/shopping-list-vuejs-pouchdb
$ cd shopping-list-vuejs-pouchdb
```
### 2. Install the prerequisites

First, install the pre-requisites (we assume you have pre-installed [Node.js](https://nodejs.org/)):

    $ npm install 

### 3. Run the server

This command serves the app at `http://127.0.0.1:8081` and provides basic URL routing for the app:

    $ npm start

### 4. Create a Cloudant or CouchDB service

PouchDB can synchronize with CouchDB and compatible servers. To run and test locally, you can install CouchDB. Alternatively, you can use a hosted Cloudant NoSQL DB service for your remote DB.

#### Installing Apache CouchDB

[Install CouchDB 2.1](http://docs.couchdb.org/en/2.1.0/install/index.html). Instructions are available for installing CouchDB 2.1 on Unix-like systems, on Windows, on Mac OS X, on FreeBSD, and via other methods.

Configure CouchDB for a [single-node setup](http://docs.couchdb.org/en/2.1.0/install/setup.html#single-node-setup), as opposed to a cluster setup. Once you have finished setting up CouchDB, you should be able to access CouchDB at `http://127.0.0.1:5984/`. Ensure that CouchDB is running and take note of your admin username and password.

#### Creating a Cloudant NoSQL DB service

To provision a managed Cloudant NoSQL DB

* Log in to [IBM Cloud](https://console.ng.bluemix.net/).
   > Sign up for an account, if you do not already have one.
* [Provision a Cloudant NoSQL DB _Lite_ plan instance](https://console.bluemix.net/catalog/services/cloudant-nosql-db), which is free.
  > If desired, you can also re-use an existing Cloudant NoSQL DB service instance. (Open the [**Data & Analytics**  resources dashboard](https://console.bluemix.net/dashboard/data) to see a list of pre-provisioned instances that you have access to.) 
 * Open the **Service credentials** tab.
* Add new credentials for this service instance if no credentials have been defined yet.
* View the credentials and note the value of the **url** property, which has the following format: `https://username:password@username-bluemix.cloudant.com`.

Tip: Select the **Manage** tab and click **Launch** to open the Cloudant dashboard and manage the service instance.

## Database and replication setup
1. [Create the remote database](#1-create-the-remote-database)
1. [Enable CORS](#2-enable-cors)
1. [Set the replication target](#3-set-the-replication-target)

### 1. Create the remote database

* Use the Cloudant or CouchDB dashboard to create a database.

* Select the Databases tab on the left and then use the `Create Database` button to create the "shopping-list" database.
The Shopping List app can be used locally before the database exists, but cannot sync until the remote database is completed.

  ![Create the shopping-list database](doc/source/images/create_db.png)

### 2. Enable CORS

* Open the Cloudant or CouchDB dashboard to enable Cross-Origin Resource Sharing (CORS).

* Select the Account Settings (or config) tab and open the **CORS** tab.

* Enable CORS and restrict the domain as needed for security.

  ![Enable CORS](doc/source/images/enable_cors.png)

### 3. Set the replication target

Run the Shopping List app and use the *Settings* form to enter your database URL.
If you use the IBM Cloud Cloudant URL taken from the service credentials as described above, the URL includes user name and password.

Add `/shopping-list` to the URL to connect to the database that you created.

  ![Configure replication target](doc/source/images/replicator.png)

# Using the app

The app allows you to create a shopping list by clicking on the plus sign. Click on the twistie to display list items, add new items, remove items or scratch them off.

![app shopping lists](doc/source/images/app_shopping_lists.png)

When you have not configured your Replication Target or when you are offline, the lists will not sync. One good way to test this is to run two browsers. You can use Chrome and Firefox and have different lists in each.

When you go online and have the database and CORS enabled and the Replication Target is set, the shopping lists will sync. You will then be able to use both lists from either browser.

## Running the tests

This repository uses the [Karma test runner](http://karma-runner.github.io/2.0/index.html). Our continuous integration will run the tests when you push to GitHub. To test your code on your machine, simply run `npm test`.

This project does not, at present, have any automated tests. Tests can be added to the `test` directory. If you'd like to contribute some then please raise an issue and submit a pull-request - we'd be very happy to add them!

## Deploying to GitHub Pages

This shopping list app can be deployed to and accessed from GitHub Pages. This app is available to try at [https://ibm-watson-data-lab.github.io/shopping-list-vuejs-pouchdb](https://ibm-watson-data-lab.github.io/shopping-list-vuejs-pouchdb/) without downloading or installing anything because this repository is itself deployed to GitHub Pages.

To make your own custom deployment, you only need the following files:

- `index.html`
- `shoppinglist.js`
- `shoppinglist.css`
- `worker.js`
- `manifest.json`

Create a new GitHub repository containing only the above five files and follow the instructions [here](https://pages.github.com/) on how to publish the files to a GitHub Pages URL.

# Privacy Notice

Refer to [https://github.com/IBM/metrics-collector-service#privacy-notice](https://github.com/IBM/metrics-collector-service#privacy-notice).

## Disabling Deployment Tracking

To disable tracking, simply remove ``require('metrics-tracker-client').track()`` from the ``app.js`` file in the top level directory.


# Links
* [More Shopping List Sample Apps](https://github.com/ibm-watson-data-lab/shopping-list)
* [Offline First](http://offlinefirst.org/)
* [Progressive Web Apps](https://developers.google.com/web/progressive-web-apps/)
* [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
* [Web App Manifest](https://w3c.github.io/manifest/)
* [PouchDB](https://pouchdb.com/)
* [Apache CouchDB](https://couchdb.apache.org/)
* [IBM Cloudant](https://www.ibm.com/cloud/cloudant)
* [Material Design Guidelines](https://material.io/guidelines/)
* [Vue Material](https://vuematerial.io/)
* [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)


# License
[Apache 2.0](LICENSE)
