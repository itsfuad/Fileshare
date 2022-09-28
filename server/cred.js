const fileStore = new Map();

function store(filename, data){
    fileStore.set(filename, data);
}

module.exports = { fileStore, store };