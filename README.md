# Installation

```bash
npm install parse-server-moralis-streams
```

# Requirements

This dashboard only runs on mongoDB.

# Configuration

First of all add a config.json in your root folder with the following content:

```json
{
    "appId": "YOUR_APP_ID",
    "masterKey": "YOUR_MASTER_KEY",
    "appName": "moralis",
    "cloud": "./cloud/main",
    "liveQuery": "{\"classNames\": [\"^(?!_Session).*$\"]}",
    "databaseURI": "mongodb://localhost:27017/parse",
    "directAccess": "1",
    "publicServerURL": "https://moralis-test-runner:2053",
    "maxUploadSize": "64mb",
    "liveQueryServerOptions": "{}",
    "allowOrigin" : "*",
    "mountPath" : "/server"
}
```

Create a folder in your root folder called `cloud` and create 2 files inside the folder:
  - main.js
  - streams.json

## main.js

Leave it empty. It requires to be there to export properly

## streams.json

The Streams object define the streams that will be used by the plugin. It is an array of objects with the following properties:
  - tableName (string): The name of the table that will be used to store the stream data in mongoDB
  - tag (string): The tag that will be used to identify the stream

Example:
```json
[
  {
    "tableName": "MyStream",
    "tag": "myStream"
  }
  // ...
]
```

# Usage in Parse Server

Run the `prepare` script of the plugin that patches the Parse Server code to add the streams functionality.

```bash
parse-server-moralis-streams prepare
```

# Use Streams

The endpoint to receive webhooks is `https://YOUR_SERVER_URL:PORT/streams`. This is the URL that you should use when setting up a stream.

# Done!

After you have configured the plugin and created a stream you can see the data in the dashboard. Note that the tableName will be concatenated with `Txs` and `Logs` meaning if you have a tableName called "MyTable" you will have two collections in mongoDB called "MyTableTxs" and "MyTableLogs", you will also have ERC20Transfers/Approvals and NFTTransfers/Approvals collections by default.