var saveFolderPath = undefined
var folderName = undefined
var range = undefined
var oldDownload = false
var currentPhase = undefined

const RunSettings = (module.exports = {
    setSaveFolderPath: (path: string) => {
        saveFolderPath = path
    },
    getSaveFolderPath: () => {
        return saveFolderPath
    },
    setFolderName: (name: string) => {
        folderName = name
    },
    getFolderName: () => {
        return folderName
    },
    setRange: r => {
        range = r
    },
    getRange: () => {
        return range
    },
    setOldDownload: (oldDwn: boolean) => {
        oldDownload = oldDwn
    },
    getOldDownload: () => {
        return oldDownload
    },
    setCurrentPhase: current => {
        currentPhase = current
    },
    getCurrentPhase: () => {
        return currentPhase
    }
})