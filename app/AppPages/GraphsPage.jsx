import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useTheme } from '../Contexts/ThemeContext.jsx'; // Adjust path if needed

export default function GraphsPage() {
    const { isDarkMode } = useTheme();

    const backgroundColor = isDarkMode ? 'black' : 'white';
    const textColor = isDarkMode ? 'white' : 'black';

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={backgroundColor}
            />
            <Text style={[styles.title, { color: textColor }]}>
                Graphs Page
            </Text>
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
});
