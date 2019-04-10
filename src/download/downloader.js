const _ = require('lodash')
const saveGraph = require('ngraph.tobinary')

const LIVE_CONSTANTS = require('../utilities/constants/live-constants')
    .LIVE_CONSTANTS

const calculateNgraphLayout = require('../live/ngraph-layout')
const logger = require('../utilities/log')

const { getTransactions } = require('./blockchain/ethereum')
const { ensureDirExists } = require('../utilities/utils')
const { dumpJSON, dumpPajek, dumpInfo } = require('../utilities/files')

export type Range = {
    start: number,
    end: number
}

export type Node = {
    id: string
}

export type Link = {
    source: string,
    target: string,
    amount: number
}

export type Graph = {
    nodes: Node[],
    links: Link[]
}

//used from live download
async function scanBlocks(range: Range, doLayout: boolean = true) {
    logger.log('Retrieving blocks...')
    //create an array, size = end - start
    const blocksIndexes = Array(range.end - range.start)
        .fill(1)
        .map((one, index) => range.start + one + (index - 1))

    //divide array in chunck of 240 elems
    const blocksIndexesAtATime = _.chunk(blocksIndexes, 240)

    const blockChunks = []
    for (let i = 0; i < blocksIndexesAtATime.length; i++) {
        const blocksIndexes = blocksIndexesAtATime[i]
        const progressBar = logger.progress(
            `Retrieving chunk ${i + 1} of ${blocksIndexesAtATime.length}...`,
            blocksIndexes.length
        )
        const blocksChunk = await getTransactions(blocksIndexes, () =>
            progressBar.tick()
        )

        blockChunks.push(blocksChunk)
    }
    const blocks = _.flatten(blockChunks)

    const cleanedBlocks = _.compact(blocks) // I don't think we need this

    logger.log('Processing transactions...')
    const transactions = _.flatten(
        cleanedBlocks
            .filter(block => block.transactions.length > 0)
            .map(block => block.transactions)
    )

    logger.log('Processing nodes...')

    //get source and target from stransactions and merge them
    const sourceIds = transactions.map(t => t.source)
    const targetIds = transactions.map(t => t.target)
    const nodeIds = _.uniq(_.compact(_.union(sourceIds, targetIds)))

    const nodes = nodeIds.map(id => ({ id }))

    logger.log('Calculating layout...')

    const graph = { nodes, links: transactions }

    if (doLayout) {
        const ngraphOutDirPath = LIVE_CONSTANTS.ngraphBasePath()
        ensureDirExists(ngraphOutDirPath)
        const ngraph = await calculateNgraphLayout(graph, ngraphOutDirPath)

        saveGraph(ngraph, {
            outDir: ngraphOutDirPath,
            labels: `labels.json`,
            meta: `meta.json`,
            links: `links.bin`
        })
    }

    logger.log('Exporting the graph to JSON...')

    dumpJSON(LIVE_CONSTANTS.jsonFilename(), graph)

    logger.log('Export the graph infos...')

    dumpInfo(LIVE_CONSTANTS.infoFilename(), graph, range)

    logger.log('Exporting the graph to Pajek...')

    dumpPajek(LIVE_CONSTANTS.pajekFilename(), graph)

    logger.log('Finished, cya')
}

module.exports = {
    scanBlocks
}
