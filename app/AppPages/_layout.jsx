import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function SignInLayout() {
    const { isDarkMode } = useTheme();

    const activeTintColor = isDarkMode ? 'blue' : 'blue';
    const inactiveTintColor = isDarkMode ? 'white' : 'black';
    const backgroundColor = isDarkMode ? 'black' : 'white';

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: activeTintColor,
                tabBarInactiveTintColor: inactiveTintColor,
                tabBarStyle: {
                    backgroundColor: backgroundColor,
                    borderTopColor: isDarkMode ? '#222' : '#ddd',
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="HomePage"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="GraphsPage"
                options={{
                    title: 'Graphs',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="stats-chart-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="SettingsPage"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings-outline" color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}
