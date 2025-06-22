import { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import { Storage } from '../utils/storage.js';
import CustomButton from '../components/CustomButton.jsx';
import NewItemPopup from '../components/NewItemPopup.jsx';
import ItemPopup from '../components/ItemPopup.jsx';
import { useRefresh } from '../Contexts/RefreshContext.jsx';

export default function HomePage() {
    const { refreshFlag, triggerRefresh } = useRefresh();
    const { isDarkMode } = useTheme();

    const [items, setItems] = useState([]);
    const [refresh, setRefresh] = useState(false);

    const [addNewItemVisible, setAddNewItemVisible] = useState(false);
    const [editVisible, setEditVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const backgroundColor = isDarkMode ? 'black' : 'white';
    const textColor = isDarkMode ? 'white' : 'black';

    /* -------- fetch combined list -------- */
    async function fetchAll() {
        const workouts = await Storage.getWorkouts();
        const runs = await Storage.getRuns();
        setItems([...workouts, ...runs]);
    }

    useEffect(() => {
        fetchAll();
    }, [refresh, refreshFlag]);

    /* -------- callbacks -------- */
    async function deleteAll() {
        await Storage.clearWorkouts();
        await Storage.clearRuns();
        setRefresh(r => !r);
        triggerRefresh();
    }

    function handleNewItemAdded() {
        setAddNewItemVisible(false);
        setRefresh(r => !r);
        triggerRefresh();
    }

    /* -------- render -------- */
    return (
        <View style={[styles.container, { backgroundColor }]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={backgroundColor}
            />

            <Text style={[styles.title, { color: textColor }]}>Home Page</Text>

            {/* SCROLLING LIST */}
            <ScrollView
                style={[styles.scrollContainer, { borderColor: textColor }]}
                contentContainerStyle={styles.scrollContent}
            >
                {items.length === 0 ? (
                    <Text style={[styles.noItems, { color: textColor }]}>No items yet</Text>
                ) : (
                    items.map(item => (
                        <TouchableOpacity
                            key={`${item.type[0]}_${item.id}`}
                            onPress={() => {
                                setSelectedItem(item);
                                setEditVisible(true);
                            }}
                            activeOpacity={0.6}
                        >
                            <Text style={[styles.rowText, { color: textColor, borderColor: textColor }]}>
                                <Text style={{ fontSize: 22 }}>Name:</Text> <Text style={{ fontWeight: "600", fontSize: 22, textDecorationLine: "underline" }}>{item.name}{'\n'}</Text>
                                <Text style={{ fontSize: 22 }}>Type:</Text> <Text style={{ fontWeight: "600", fontSize: 22, textDecorationLine: "underline" }}>{item.type}{'\n'}</Text>
                                <Text style={{ fontSize: 22 }}>Date:</Text> <Text style={{ fontWeight: "600", fontSize: 22, textDecorationLine: "underline" }}>{item.date}</Text>
                            </Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* BUTTONS ROW */}
            <View style={styles.buttonRow}>
                <CustomButton
                    title="Add An Item"
                    onPress={() => setAddNewItemVisible(true)}
                    backgroundColor={textColor}
                    color={backgroundColor}
                    style={styles.flexButton}
                />
            </View>

            {/* POP-UPS */}
            <NewItemPopup visible={addNewItemVisible} onClose={handleNewItemAdded} />

            <ItemPopup
                visible={editVisible}
                initialData={selectedItem}
                onClose={refreshNeeded => {
                    setEditVisible(false);
                    setSelectedItem(null);
                    if (refreshNeeded) {
                        fetchAll();
                        triggerRefresh();
                    }
                }}
            />
        </View>
    );
}

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: '12%',
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20,
        textDecorationLine: 'underline',
    },
    scrollContainer: {
        height: 300,
        width: 350,
        borderWidth: 3,
        padding: 20,
        marginTop: 10,
    },
    scrollContent: { paddingBottom: 30 },
    rowText: {
        fontSize: 20,
        borderWidth: 2,
        padding: 10,
        marginBottom: 10,
    },
    noItems: {
        fontSize: 30,
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 300,
        marginTop: 30,
        marginBottom: 20,
    },
    flexButton: {
        flex: 1,
        marginHorizontal: 10,
        height: 70
    },
});
