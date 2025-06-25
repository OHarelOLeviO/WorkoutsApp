import { Stack } from "expo-router";
import { ThemeProvider } from "./Contexts/ThemeContext.jsx";
import { RefreshProvider } from "./Contexts/RefreshContext.jsx";

export default function Layout() {
    return (
        <ThemeProvider>
            <RefreshProvider>
                <Stack>
                    <Stack.Screen name="AppPages" options={{ title: 'App', headerShown: false }} />
                </Stack>
            </RefreshProvider>
        </ThemeProvider>
    );
}
