# Limitations

- MongoDB only

# Usage in Parse Server

Run the `prepare` script of the plugin that patches the Parse Server code to add the streams functionality.

## Installation

First, install the plugin:

```bash
npm install parse-server-moralis-streams
```

## Prepare Server

The Plugin needs to run some patches before the server starts. To do so, run the `prepare` script of the plugin.

```bash
parse-server-moralis-streams prepare
```

# Configuration

Add the following to your Parse Server configuration:

```json
{
    //..
    "moralisApiKey": "YOUR_API_KEY",
    "streamsConfig": "PATH/TO/STREAMSCONFIG.JSON",
}
```

## Streams Config

The Streams object define the streams that will be used by the plugin. It is an array of objects with the following properties:
  - tableName (string): The name of the table that will be used to store the stream data in MongoDB
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

# Setup Stream

The endpoint to receive webhooks is `https://YOUR_SERVER_URL:PORT/streams`. This is the URL that you should use when setting up a stream.

# Done!

After you have configured the plugin and created a stream you can see the data in the dashboard. Note that the tableName will be concatenated with `Txs` and `Logs` meaning if you have a tableName called "MyTable" you will have two collections in mongoDB called "MyTableTxs" and "MyTableLogs", you will also have ERC20Transfers/Approvals and NFTTransfers/Approvals collections by default.