import AsyncStorage from '@react-native-async-storage/async-storage';

const WORKOUTS_KEY = 'workouts_table';
const RUNS_KEY = 'runs_table';

async function addItem(tableKey, newItem) {
    try {
        const existing = await AsyncStorage.getItem(tableKey);
        const data = existing ? JSON.parse(existing) : [];
        data.push(newItem);
        await AsyncStorage.setItem(tableKey, JSON.stringify(data));
    } catch (error) {
        console.error(`Failed to save item in ${tableKey}:`, error);
    }
}

async function getItems(tableKey) {
    try {
        const data = await AsyncStorage.getItem(tableKey);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error(`Failed to load items from ${tableKey}:`, error);
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
