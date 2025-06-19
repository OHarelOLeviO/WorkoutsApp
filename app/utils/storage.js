import AsyncStorage from '@react-native-async-storage/async-storage';

const WORKOUTS_KEY = 'workouts_table';
const RUNS_KEY = 'runs_table';

/** Find the smallest positive integer not in `usedIds` */
const getNextId = (usedIds) => {
    let id = 1;
    while (usedIds.has(id)) id += 1;
    return id;
};

async function addItem(tableKey, partialItem) {
    try {
        // 1. Load the existing rows (or empty array)
        const existingJson = await AsyncStorage.getItem(tableKey);
        const rows = existingJson ? JSON.parse(existingJson) : [];

        // 2. Work out the next free id
        const usedIds = new Set(rows.map((r) => r.id));
        const id = getNextId(usedIds);

        // 3. Push the completed row
        const newItem = { id, ...partialItem };
        rows.push(newItem);

        // 4. Save back
        await AsyncStorage.setItem(tableKey, JSON.stringify(rows));

        // return newItem;          // ← handy if the caller wants to know the id
    } catch (err) {
        console.error(`Failed to save item in ${tableKey}:`, err);
        throw err;
    }
}

async function getItems(tableKey) {
    try {
        const json = await AsyncStorage.getItem(tableKey);
        return json ? JSON.parse(json) : [];
    } catch (err) {
        console.error(`Failed to load items from ${tableKey}:`, err);
        return [];
    }
}

async function clearTable(tableKey) {
    await AsyncStorage.removeItem(tableKey);
}

export const Storage = {
    addWorkout: (item) => addItem(WORKOUTS_KEY, item),
    getWorkouts: () => getItems(WORKOUTS_KEY),
    clearWorkouts: () => clearTable(WORKOUTS_KEY),
    addRun: (item) => addItem(RUNS_KEY, item),
    getRuns: () => getItems(RUNS_KEY),
    clearRuns: () => clearTable(RUNS_KEY),
};
