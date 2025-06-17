import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import { Storage } from '../utils/storage.js';

export default function HomePage() {
    const { isDarkMode } = useTheme();
    const [workouts, setWorkouts] = useState([]);
    const [runs, setRuns] = useState([]);

    const backgroundColor = isDarkMode ? 'black' : 'white';
    const textColor = isDarkMode ? 'white' : 'black';

    useEffect(() => {
        async function fetchData() {
            await Storage.clearWorkouts();
            await Storage.clearRuns();
            await Storage.addWorkout({ id: 1, type: 'Pushups', reps: 20 });
            await Storage.addRun({ id: 1, distance: 5.2, time: '30:00' });

            const savedWorkouts = await Storage.getWorkouts();
            const savedRuns = await Storage.getRuns();

            setWorkouts(savedWorkouts);
            setRuns(savedRuns);

            console.log("\n----------------------------------------------------------")
            console.log("Workouts:", savedWorkouts);
            console.log("Runs:", savedRuns);
            console.log("----------------------------------------------------\n")
        }
        fetchData();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={backgroundColor}
            />
            <Text style={[styles.title, { color: textColor }]}>
                Home Page
            </Text>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.workouts}>
                    <Text style={{ color: textColor }}>
                        Hello
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: '12%',
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        textDecorationLine: 'underline',
    },
    scrollContent: {
        paddingBottom: 100,
        marginTop: 50,
    },
    workouts: {
        borderWidth: 3,
        width: 350,
        height: 500,
        padding: 20
    },
});
