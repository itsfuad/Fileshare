export const fileStore = new Map();

export function store(filename, data){
    fileStore.set(filename, data);
}