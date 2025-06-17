import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Storage } from './utils/storage';

export default function TestStorage() {
    useEffect(() => {
        async function runStorageExample() {
            Storage.clearWorkouts();
            Storage.clearRuns();
            await Storage.addWorkout({ id: 1, type: 'Pushups', reps: 20 });
            await Storage.addRun({ id: 1, distance: 5.2, time: '30:00' });

            console.log("\n-----------------------------------------------------\n");
            const workouts = await Storage.getWorkouts();
            console.log('Workouts:', workouts);
            const runsAfterClear = await Storage.getRuns();
            console.log('Runs after clear:', runsAfterClear);
            console.log("\n-----------------------------------------------------\n");
        }
        runStorageExample();
    }, []);

    return (
        <View>
            <Text>Storage example running (check console)</Text>
        </View>
    );
}
