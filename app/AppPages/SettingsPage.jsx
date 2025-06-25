import { useState } from 'react';
import { View, Text, StyleSheet, Switch, StatusBar, Image } from 'react-native';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import { Storage } from '../utils/storage.js';
import CustomButton from '../components/CustomButton.jsx';
import CustomAlert from '../components/CustomAlert.jsx';
import { useRefresh } from '../Contexts/RefreshContext.jsx';
import * as Speech from 'expo-speech';

export default function SettingsPage() {
    const { isDarkMode, toggleDarkMode } = useTheme();
    const { triggerRefresh } = useRefresh();

    const backgroundColor = isDarkMode ? 'black' : 'white';
    const textColor = isDarkMode ? 'white' : 'black';

    const [alertVisible, setAlertVisible] = useState(false);

    async function handleResetApp() {
        await Storage.clearRuns();
        await Storage.clearWorkouts();
        setAlertVisible(false);
        triggerRefresh();
    }

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={backgroundColor}
            />

            <Text style={[styles.title, { color: textColor }]}>Settings Page</Text>

            {/* Appearance section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>Appearance</Text>
                <View style={styles.optionRow}>
                    <Text style={[styles.optionLabel, { color: textColor }]}>Dark Mode</Text>
                    <Switch
                        trackColor={{ false: 'grey', true: 'green' }}
                        thumbColor="white"
                        onValueChange={toggleDarkMode}
                        value={isDarkMode}
                    />
                </View>
            </View>

            {/* App info section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>App Info</Text>
                <View style={styles.infoRow}>
                    <Text style={[styles.optionLabel, { color: textColor }]}>Version</Text>
                    <Text style={[styles.infoValue, { color: textColor }]}>1.0.0</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={[styles.optionLabel, { color: textColor }]}>Build</Text>
                    <Text style={[styles.infoValue, { color: textColor }]}>June 2025</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={[styles.optionLabel, { color: textColor }]}>Creators</Text>
                    <Text style={[styles.infoValue, { color: textColor }]}>Harel Levi, Oran Azrad, Ori Nadjar</Text>
                </View>
            </View>

            <Image
                source={
                    !isDarkMode
                        ? require('../assets/Logo_Dark.png')
                        : require('../assets/Logo_Light.png')
                }
                style={styles.logo}
            />

            {/* Reset app */}
            <CustomButton
                title="Reset App Data"
                onPress={() => {
                    setAlertVisible(true);
                    Speech.speak("The app has been successfully reset");
                }}
                backgroundColor="red"
                color="white"
                style={styles.resetButton}
            />

            {/* Alert */}
            <CustomAlert
                visible={alertVisible}
                title="Confirm Reset"
                message="You have reset the app successfully!"
                onClose={handleResetApp}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: '12%',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 30,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 40,
        textDecorationLine: 'underline',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 22,
        marginBottom: 10,
        fontWeight: '500',
        opacity: 0.8,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    optionLabel: {
        fontSize: 18,
    },
    resetButton: {
        marginTop: 'auto',
        marginBottom: 30,
    },
    logo: {
        width: 280,
        height: 280,
        resizeMode: 'contain',
        alignSelf: 'center',
        marginTop: -10,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
        opacity: 0.8,
        marginTop: 3
    },
});
