const Web3 = require('web3');
const web3 =  new Web3()
const bodyParser = require('body-parser')
const {upsert} = require("./helpers")
const {realtimeUpsertParams, realtimeUpsertTxParams} = require("./web3helpers")

const logsMap = new Map();
const txsMap = new Map();

const verifySignature = (req, secret) => {

    const ProvidedSignature = req.headers["x-signature"]
    if(!ProvidedSignature) throw new Error("Signature not provided")
    const GeneratedSignature= web3.utils.sha3(JSON.stringify(req.body)+secret)
    if(GeneratedSignature !== ProvidedSignature) throw new Error("Invalid Signature")

}

const prepareSyncs = async (parseObject, syncs) => {
    const dbAdapter = parseObject.config.databaseController.adapter
    for( const sync of syncs){
        await dbAdapter.ensureUniqueness(sync.tableName.concat('Txs'), { fields: { transaction_index: {}, transaction_hash: {} } }, ['transaction_index', 'transaction_hash']);
        await dbAdapter.ensureUniqueness(sync.tableName.concat('Logs'), { fields: { log_index: {}, transaction_hash: {} } }, ['log_index', 'transaction_hash']);
        await dbAdapter.ensureUniqueness(sync.tableName.concat('ERC20Transfers'), { fields: { log_index: {}, transaction_hash: {} } }, ['log_index', 'transaction_hash']);
        await dbAdapter.ensureUniqueness(sync.tableName.concat('ERC20Approvals'), { fields: { log_index: {}, transaction_hash: {} } }, ['log_index', 'transaction_hash']);
        await dbAdapter.ensureUniqueness(sync.tableName.concat('NFTTransfers'), { fields: { log_index: {}, transaction_hash: {} } }, ['log_index', 'transaction_hash']);
        await dbAdapter.ensureUniqueness(sync.tableName.concat('ERC721Approvals'), { fields: { log_index: {}, transaction_hash: {} } }, ['log_index', 'transaction_hash']);
        await dbAdapter.ensureUniqueness(sync.tableName.concat('ERC1155Approvals'), { fields: { log_index: {}, transaction_hash: {} } }, ['log_index', 'transaction_hash']);
        txsMap.set(sync.tag, sync)
        logsMap.set(sync.tag, sync)
    }
}

const InitializeSyncsPlugin = async (parseObject, secret, syncs) => {

    if(syncs.length === 0) return

    await prepareSyncs(parseObject, syncs)

    parseObject.expressApp.post('/streams', bodyParser.json({ limit: '50mb' }), async (req, res) => {
        try {
            verifySignature(req, secret)
        } catch (e) {
            return res.status(401).json({message: e.message})
        }
        try {
            const updates = {}
            for (const log of req.body.logs) {
                const sync = logsMap.get(log.tag)
                const abi = req.body.abis[log.streamId]
                if (sync && abi) {
                    const {filter, update} = realtimeUpsertParams(abi, log, req.body.confirmed, req.body.block);
                    if (!updates[sync.tableName.concat("Logs")]) updates[sync.tableName.concat("Logs")] = []
                    updates[sync.tableName.concat("Logs")].push({ filter, update, upsert: true })
                }
            }
            if(req.body.txs?.length > 0){
            for(const tx of req.body.txs) {
                    const sync = txsMap.get(tx.tag)
                    if(sync) {
                        const {filter, update} = realtimeUpsertTxParams(tx, req.body.confirmed, req.body.block);
                        if (!updates[sync.tableName.concat("Txs")]) updates[sync.tableName.concat("Txs")] = []
                        updates[sync.tableName.concat("Txs")].push({ filter, update, upsert: true })
                    }
                }
            }   
            if(req.body.erc20Transfers?.length > 0){
                for(const erc20Transfer of req.body.erc20Transfers) {
                    if(!updates["ERC20Transfers"]) updates["ERC20Transfers"] = []
                    updates["ERC20Transfers"].push({ filter: { transaction_hash: erc20Transfer.transactionHash, log_index: erc20Transfer.logIndex }, update: erc20Transfer, upsert: true })
                }
            }
            for(const erc20Approval of req.body.erc20Approvals) {
                if(!updates["ERC20Approvals"]) updates["ERC20Approvals"] = []
                updates["ERC20Approvals"].push({ filter: { transaction_hash: erc20Approval.transactionHash, log_index: erc20Approval.logIndex }, update: erc20Approval, upsert: true })
            }
            for(const nftTransfer of req.body.nftTransfers) {
                if(!updates["NFTTransfers"]) updates["NFTTransfers"] = []
                updates["NFTTransfers"].push({ filter: { transaction_hash: nftTransfer.transactionHash, log_index: nftTransfer.logIndex }, update: nftTransfer, upsert: true })
            }
            for( const erc721Approval of req.body.nftApprovals.ERC721 ) {
                if(!updates["ERC721Approvals"]) updates["ERC721Approvals"] = []
                updates["ERC721Approvals"].push({ filter: { transaction_hash: erc721Approval.transactionHash, log_index: erc721Approval.logIndex }, update: erc721Approval, upsert: true })
            }
            for( const erc1155Approval of req.body.nftApprovals.ERC1155 ) {
                if(!updates["ERC1155Approvals"]) updates["ERC1155Approvals"] = []
                updates["ERC1155Approvals"].push({ filter: { transaction_hash: erc1155Approval.transactionHash, log_index: erc1155Approval.logIndex }, update: erc1155Approval, upsert: true })
            }
            for (const tableName in updates) {
                await parseObject.config.databaseController.bulkUpdate(tableName, updates[tableName])
            }
        } catch (e) {
            console.log("error while inserting logs", e.message)
            return res.status(500).json({message: "error while inserting logs"})
        }

        return res.status(200).json({message: "ok"})
    })
}

module.exports = {
    InitializeSyncsPlugin
};