import { Stack } from "expo-router";
import { ThemeProvider } from "./Contexts/ThemeContext.jsx";

export default function Layout() {
    return (
        <ThemeProvider>
            <Stack>
                <Stack.Screen name="AppPages" options={{ title: 'App', headerShown: false }} />
            </Stack>
        </ThemeProvider>
    );
}
