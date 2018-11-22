const createEth = require('./eth')
const _ = require('lodash')
const { setTransactionStream, dumpTransactions } = require('./files')
const { temporaryFilePath } = require('./config')

var eth

function askTask() {
    process.send({
        pid: process.pid,
        command: 'new task'
    })
}

function convertTransaction(t) {
    return JSON.stringify(t)
}

process.on('message', function(message) {
    switch (message.command) {
        case 'config':
            const fileTot = temporaryFilePath() + message.filename
            eth = createEth(message.api)
            setTransactionStream(fileTot)
            askTask()
            break
        case 'task':
            eth.queryBlocks(message.task).then(block_array => {
                dumpTransactions(
                    _.flatten(
                        block_array
                            .filter(block => block.transactions.length > 0)
                            .map(block => block.transactions)
                    ).map(t => convertTransaction(t))
                )
                askTask()
            })
            break
        case 'end':
            process.disconnect()
            break
        default:
            console.log(
                '[child ' + process.pid + '] wrong command + ' + message.command
            )
    }
})