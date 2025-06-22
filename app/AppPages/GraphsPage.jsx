import { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    StatusBar
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import { Storage } from '../utils/storage.js';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 20;

/* helper: convert dd/mm/yyyy → Date */
const toDate = str => {
    const [d, m, y] = str.split('/').map(Number);
    return new Date(y, m - 1, d);
};

export default function GraphsPage() {
    const { isDarkMode } = useTheme();
    const backgroundColor = isDarkMode ? 'black' : 'white';
    const textColor = isDarkMode ? 'white' : 'black';

    const [runs, setRuns] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [selectedDistance, setSelectedDistance] = useState(null);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [trackRuns, setTrackRuns] = useState(true);
    const [trackExercises, setTrackExercises] = useState(false);

    const isFocused = useIsFocused();

    /* fetch whenever page gains focus */
    useEffect(() => {
        (async () => {
            setRuns(await Storage.getRuns());
            setWorkouts(await Storage.getWorkouts());
        })();
    }, [isFocused]);

    /* unique lists */
    const distances = [...new Set(runs.map(r => r.distance))];
    const exerciseNames = [
        ...new Set(workouts.flatMap(w => w.exercises.map(e => e.name))),
    ];

    /* ----- RUNS (sorted by date) ----- */
    const runsForDistance = runs
        .filter(r => r.distance === selectedDistance)
        .sort((a, b) => toDate(a.date) - toDate(b.date));

    /* ----- WORKOUTS (sorted by date) ----- */
    const workoutsForExercise = workouts
        .filter(w => w.exercises.some(e => e.name === selectedExercise))
        .sort((a, b) => toDate(a.date) - toDate(b.date));

    /* chart style */
    const chartConfig = {
        backgroundGradientFrom: backgroundColor,
        backgroundGradientTo: backgroundColor,
        color: (opacity = 1) => `rgba(0,122,255,${opacity})`,
        labelColor: () => textColor,
        strokeWidth: 2,
        decimalPlaces: 2,
        propsForDots: { r: '4' },
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor }]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={backgroundColor}
            />
            <Text style={[styles.title, { color: textColor }]}>Graphs Page</Text>
            {/* selectors */}
            <View style={styles.checkboxRow}>
                <View style={styles.checkboxBox}>
                    <Checkbox
                        value={trackRuns}
                        onValueChange={() => {
                            setTrackRuns(true);
                            setTrackExercises(false);
                            setSelectedExercise(null);
                        }}
                    />
                    <Text style={[styles.label, { color: textColor }]}>Track Runs</Text>
                </View>
                <View style={styles.checkboxBox}>
                    <Checkbox
                        value={trackExercises}
                        onValueChange={() => {
                            setTrackRuns(false);
                            setTrackExercises(true);
                            setSelectedDistance(null);
                        }}
                    />
                    <Text style={[styles.label, { color: textColor }]}>Track Exercises</Text>
                </View>
            </View>

            {/* distance buttons */}
            {trackRuns && (
                <View style={styles.buttonGroup}>
                    {distances.map(dist => (
                        <TouchableOpacity
                            key={dist}
                            style={[
                                styles.btn,
                                selectedDistance === dist && styles.selectedBtn,
                            ]}
                            onPress={() => setSelectedDistance(dist)}
                        >
                            <Text style={[styles.btnText, { color: textColor }]}>{dist} km</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* exercise buttons */}
            {trackExercises && (
                <View style={styles.buttonGroup}>
                    {exerciseNames.map(name => (
                        <TouchableOpacity
                            key={name}
                            style={[
                                styles.btn,
                                selectedExercise === name && styles.selectedBtn,
                            ]}
                            onPress={() => setSelectedExercise(name)}
                        >
                            <Text style={[styles.btnText, { color: textColor }]}>{name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* RUN LINE CHART */}
            {trackRuns && selectedDistance && runsForDistance.length > 0 && (
                <View style={styles.chartBox}>
                    <Text style={[styles.chartTitle, { color: textColor }]}>
                        {selectedDistance} km – Time (hours)
                    </Text>
                    <LineChart
                        width={screenWidth}
                        height={400}
                        data={{
                            labels: runsForDistance.map(r => r.date),
                            datasets: [
                                {
                                    data: runsForDistance.map(r =>
                                        +(r.durationSecs / 3600).toFixed(2)
                                    ),
                                },
                            ],
                        }}
                        yAxisSuffix=" h"
                        chartConfig={chartConfig}
                        bezier
                        fromZero
                    />
                </View>
            )}

            {/* EXERCISE LINE CHART (reps & weight) */}
            {trackExercises && selectedExercise && workoutsForExercise.length > 0 && (
                <View style={styles.chartBox}>
                    <Text style={[styles.chartTitle, { color: textColor }]}>
                        {selectedExercise} – Reps & Weight
                    </Text>
                    <LineChart
                        width={screenWidth}
                        height={400}
                        data={{
                            labels: workoutsForExercise.map(w => w.date),
                            datasets: [
                                {
                                    data: workoutsForExercise.map(
                                        w =>
                                            +(
                                                w.exercises.find(e => e.name === selectedExercise)?.reps ??
                                                0
                                            )
                                    ),
                                    color: () => 'rgba(0,122,255,1)', // reps line
                                    strokeWidth: 2,
                                },
                                {
                                    data: workoutsForExercise.map(
                                        w =>
                                            +(
                                                w.exercises.find(e => e.name === selectedExercise)?.weight ??
                                                0
                                            )
                                    ),
                                    color: () => 'rgba(255,99,132,1)', // weight line
                                    strokeWidth: 2,
                                },
                            ],
                            legend: ['Reps', 'Weight'],
                        }}
                        yAxisSuffix=""
                        chartConfig={{
                            ...chartConfig,
                            color: (o = 1) => `rgba(0,122,255,${o})`,
                        }}
                        bezier
                        fromZero
                    />
                </View>
            )}
        </ScrollView>
    );
}

/* ----------------------- styles ----------------------- */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: '10%',
    },
    title: {
        fontSize: 30,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20,
        textDecorationLine: 'underline',
    },
    checkboxRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 40,
        marginTop: 20,
        marginBottom: 30,
    },
    checkboxBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    label: {
        fontSize: 20,
    },
    buttonGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 40,
    },
    btn: {
        borderWidth: 2,
        borderColor: '#007AFF',
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 8,
    },
    selectedBtn: {
        backgroundColor: '#007AFF',
    },
    btnText: {
        fontSize: 18,
        fontWeight: "600"
    },
    chartBox: {
        marginBottom: 30,
        alignItems: 'center',
    },
    chartTitle: {
        fontSize: 22,
        marginBottom: 50,
        fontWeight: '600',
        textDecorationLine: "underline"
    },
});
