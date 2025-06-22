import AsyncStorage from '@react-native-async-storage/async-storage';

const WORKOUTS_KEY = 'workouts_table';
const RUNS_KEY = 'runs_table';

/* ---------- generic helpers ---------- */
const getNextId = (usedIds) => {
    let id = 1;
    while (usedIds.has(id)) id += 1;
    return id;
};

/** Insert */
async function addItem(tableKey, partialItem) {
    const rows = await getItems(tableKey);
    const id = getNextId(new Set(rows.map(r => r.id)));
    const newItem = { id, ...partialItem };
    rows.push(newItem);
    await AsyncStorage.setItem(tableKey, JSON.stringify(rows));
    return newItem;                 // so caller can know the id if needed
}

/** Read */
async function getItems(tableKey) {
    const json = await AsyncStorage.getItem(tableKey);
    return json ? JSON.parse(json) : [];
}

/** Update (replace by id) */
async function updateItem(tableKey, updated) {
    const rows = await getItems(tableKey);
    const newRows = rows.map(r => (r.id === updated.id ? updated : r));
    await AsyncStorage.setItem(tableKey, JSON.stringify(newRows));
}

/** Delete (filter out by id) */
async function deleteItem(tableKey, id) {
    const rows = await getItems(tableKey);
    const newRows = rows.filter(r => r.id !== id);
    await AsyncStorage.setItem(tableKey, JSON.stringify(newRows));
}

/** Clear */
async function clearTable(tableKey) {
    await AsyncStorage.removeItem(tableKey);
}

/* ---------- exported wrapper ---------- */
export const Storage = {
    /* Workouts */
    addWorkout: (w) => addItem(WORKOUTS_KEY, w),
    getWorkouts: () => getItems(WORKOUTS_KEY),
    updateWorkout: (w) => updateItem(WORKOUTS_KEY, w),
    deleteWorkout: (id) => deleteItem(WORKOUTS_KEY, id),
    clearWorkouts: () => clearTable(WORKOUTS_KEY),

    /* Runs */
    addRun: (r) => addItem(RUNS_KEY, r),
    getRuns: () => getItems(RUNS_KEY),
    updateRun: (r) => updateItem(RUNS_KEY, r),
    deleteRun: (id) => deleteItem(RUNS_KEY, id),
    clearRuns: () => clearTable(RUNS_KEY),
};
