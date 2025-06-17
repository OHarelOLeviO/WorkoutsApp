import { useState } from 'react';
import { View, Text, StyleSheet, Switch, StatusBar } from 'react-native';
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function SettingsPage() {

    const { isDarkMode, toggleDarkMode } = useTheme();

    const backgroundColor = isDarkMode ? 'black' : 'white';
    const textColor = isDarkMode ? 'white' : 'black';

    const [isNotificationsOn, setIsNotificationsOn] = useState(false);

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={backgroundColor}
            />
            <Text style={[styles.title, { color: textColor }]}>
                Settings Page
            </Text>
            <View style={styles.options}>
                <Text style={{ color: textColor }}>
                    Enable / Disable Dark Mode:
                </Text>
                <Switch
                    trackColor={{ false: "grey", true: "green" }}
                    thumbColor={"white"}
                    onValueChange={toggleDarkMode}
                    value={isDarkMode}
                />
                <Text style={{ color: textColor }}>
                    Enable / Disable Notifications:
                </Text>
                <Switch
                    trackColor={{ false: "grey", true: "green" }}
                    thumbColor={"white"}
                    onValueChange={() => setIsNotificationsOn(prev => !prev)}
                    value={isNotificationsOn}
                />
            </View>
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
    options: {
        marginTop: 50,
    }
});
