var saveFolder = undefined
var folderName = undefined
var range = undefined
var processNum = 1

const Constraints = (module.exports = {
    setSaveFolder: (path: string) => {
        saveFolder = path
    },
    getSaveFolder: () => {
        return saveFolder
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
    setProcessNum: (processes: number) => {
        processNum = processes
    },
    getProcessNum: () => {
        return processNum
    }
})