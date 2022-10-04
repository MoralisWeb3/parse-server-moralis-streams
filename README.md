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

Locate `src/ParseServer.js` and initialize the plugin by importing it from the package and passing following parameters:
  - `app` - the parse server (this)
  - `secret` - The Moralis Web3 Api Key
  - `streamsConfig` - The **absolute** path of the streams configuration


```typescript
import { InitializeSyncsPlugin } from 'parse-server-moralis-streams'

class ParseServer {
  // ...
  start(options: ParseServerOptions, callback) {
    // ...
    InitializeSyncsPlugin(this, "API_KEY", "/absolute/path/to/your/streams.json")
    // ...
  }
  // ...
}
```

# Use Streams

The endpoint to receive webhooks is `https://YOUR_SERVER_URL:PORT/streams`. This is the URL that you should use when setting up a stream.