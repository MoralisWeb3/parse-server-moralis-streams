# Parse Server Moralis Streams

This Plugin adapts parse-server to support [streams](https://github.com/MoralisWeb3/streams-beta) with some extra benefits:

- True Upsert: Inserting directly to mongo via a bulkUpdate allows to handle millions of rows (parse-server slows downs insertions as the rows increase)


- BigNumber Support: Allows bigNumbers to be inserted into MongoDB via numberDecimal.


# Limitations

- This plugin only works with MongoDB


- Parse-Dashboard will not work due to numberDecimal, we will be releasing
our version of dashboard with numberDecimal support soon. 

# Usage

## Parse Server

First clone the [parse server repo](https://github.com/parse-community/parse-server.git) and install the dependencies. 

This plugin was tested with v5.2.7 of parse server

```
git clone -b release https://github.com/parse-community/parse-server.git
```

## Installation

Install the Plugin in your parse-server:

```bash
npm install parse-server-moralis-streams
```

## Prepare Server

The Plugin needs to run some patches before the server starts. To do so, run the `prepare` script of the plugin.

```bash
parse-server-moralis-streams prepare
```

## Streams Config

Create a folder in your project root called `cloud` and add a file called `streams.json` with the following content:

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

The Streams object defines the streams that will be used by the plugin. It is an array of objects with the following properties.:

  - tableName (string): The name of the table that will be used to store the stream data in MongoDB
  - tag (string): The tag that will be used to identify the stream

## Configuration

Add the following to your Parse Server configuration:

```json
{
    //..
    "moralisApiKey": "YOUR_API_KEY",
    "streamsConfig": "./cloud/streams.json",
}
```

# Setup Stream

The endpoint to receive webhooks is `https://YOUR_SERVER_URL:PORT/streams`. This is the URL that you should use when setting up a stream.

# Done!

After you have configured the plugin and created a stream you can see the data in the dashboard. Note that the tableName will be concatenated with `Txs` and `Logs` meaning if you have a tableName called "MyTable" you will have two collections in mongoDB called "MyTableTxs" and "MyTableLogs", you will also have ERC20Transfers/Approvals and NFTTransfers/Approvals collections by default.
