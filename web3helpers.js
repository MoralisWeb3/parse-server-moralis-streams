const ethers = require("ethers");

function realtimeUpsertTxParams(trxData, confirmed, block) {
  const filter = {
    transaction_hash: trxData.transactionHash,
    transaction_index: trxData.transactionIndex,
  };

  const update = {
    ...trxData,
    confirmed,
    block_number: block.number,
  };
  return { filter, update };
}

function realtimeUpsertParams(abi, trxData, confirmed, block) {
  const block_number = block.number;
  const address = trxData.address.toLowerCase();
  const transaction_hash = trxData.transactionHash.toLowerCase();
  const log_index = trxData.logIndex;
  const topics = [
    trxData.topic0,
    trxData.topic1,
    trxData.topic2,
    trxData.topic3,
  ];
  const data = trxData.data;

  const filter = {
    transaction_hash,
    log_index,
  };

  const rest = {
    address,
    block_number,
  };

  rest.confirmed = confirmed;

  if (abi) {
    const update = {
      ...filter,
      ...decodeWithEthers(
        abi,
        data,
        topics.filter((t) => t !== null)
      ),
      ...rest,
    };
    return { filter, update };
  }

  const update = {
    ...filter,
    ...rest,
    data,
    topic0: topics[0],
    topic1: topics[1],
    topic2: topics[2],
    topic3: topics[3],
  };

  return { filter, update };
}

function decodeWithEthers(abi, data, topics) {
  try {
    const iface = new ethers.utils.Interface(abi);
    const { args } = iface.parseLog({ data, topics });
    const event = iface.getEvent(topics[0]);
    const decoded = {};
    event.inputs.forEach((input, index) => {
      if (input.type === "uint256") {
        decoded[`${input.name}_decimal`] = {
          __type: "NumberDecimal",
          value: ethers.BigNumber.from(args[index]._hex).toString(),
        };
        decoded[input.name] = ethers.BigNumber.from(
          args[index]._hex
        ).toString();
        return;
      }
      decoded[input.name] = args[index];
    });
    return decoded;
  } catch (error) {
    return {};
  }
}

module.exports = {
  realtimeUpsertParams,
  realtimeUpsertTxParams,
};
