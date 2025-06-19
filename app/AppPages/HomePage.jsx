import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import { Storage } from '../utils/storage.js';
import CustomButton from '../components/CustomButton.jsx';
import NewItemPopup from '../components/NewItemPopup.jsx';

export default function HomePage() {

    const { isDarkMode } = useTheme();
    const [workouts, setWorkouts] = useState([]);
    const [runs, setRuns] = useState([]);
    const [addNewItemVisible, setAddNewItemVisible] = useState(false);

    const backgroundColor = isDarkMode ? 'black' : 'white';
    const textColor = isDarkMode ? 'white' : 'black';

    async function getAll() {
        const savedWorkouts = await Storage.getWorkouts();
        const savedRuns = await Storage.getRuns();
        setWorkouts(savedWorkouts);
        setRuns(savedRuns);
        console.log("\n----------------------------------------------------------")
        console.log("Workouts:", savedWorkouts);
        console.log("Runs:", savedRuns);
        console.log("----------------------------------------------------\n")
    }

    async function deleteAll() {
        await Storage.clearWorkouts();
        await Storage.clearRuns();
        console.log("\n----------------------------------------------------------")
        console.log("All Deleted !!!");
        console.log("----------------------------------------------------\n")
    }

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={backgroundColor}
            />
            <Text style={[styles.title, { color: textColor }]}>
                Home Page
            </Text>
            <CustomButton
                title="Get All Items"
                onPress={getAll}
                backgroundColor={textColor}
                color={backgroundColor}
                style={{ marginTop: 30, marginLeft: -200 }}
            />
            <CustomButton
                title="Delete All Items"
                onPress={deleteAll}
                backgroundColor={textColor}
                color={backgroundColor}
                style={{ marginTop: -67, marginLeft: 180 }}
            />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.workouts, { borderColor: textColor }]}>
                    <Text style={{ color: textColor }}>
                        Hello
                    </Text>
                </View>
            </ScrollView>
            <CustomButton
                title="Add An Item"
                onPress={() => setAddNewItemVisible(true)}
                backgroundColor={textColor}
                color={backgroundColor}
                style={{ marginBottom: 40 }}
            />
            <NewItemPopup
                visible={addNewItemVisible}
                onClose={() => setAddNewItemVisible(false)}
            />
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
        marginTop: 20,
    },
    workouts: {
        borderWidth: 3,
        width: 350,
        height: 500,
        padding: 20
    },
    button: {
        borderRadius: 8,
        alignItems: 'center',
        padding: 20,
        marginTop: 20
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
