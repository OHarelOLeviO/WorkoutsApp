import React, { useState, useRef, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TextInput,
    Button,
    ScrollView,
    Pressable,
    TouchableOpacity,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TimerPickerModal } from 'react-native-timer-picker';
import { Storage } from '../utils/storage';
import CustomAlert from '../components/CustomAlert';
import Icon from 'react-native-vector-icons/Feather';

/* ---------- helpers ---------- */
const ddMMyyyyToDate = str => {
    const [d, m, y] = str.split('/').map(Number);
    return new Date(y, m - 1, d);
};
const formatDuration = secs => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

/* ---------- main component ---------- */
const ItemPopup = ({ visible, onClose, initialData = null }) => {
    const isEditing = initialData !== null;

    /* ----- state ----- */
    const [itemType, setItemType] = useState(initialData?.type ?? 'run');
    const [name, setName] = useState(initialData?.name ?? '');
    const [date, setDate] = useState(
        initialData ? ddMMyyyyToDate(initialData.date) : new Date()
    );
    const [showDatePicker, setShowDatePicker] = useState(false);

    // run fields
    const [distance, setDistance] = useState(initialData?.distance ?? '');
    const [durationSecs, setDurationSecs] = useState(
        initialData?.durationSecs ?? 0
    );
    const [showDurationPicker, setShowDurationPicker] = useState(false);

    // workout fields
    const [exercises, setExercises] = useState(
        initialData?.exercises ?? [{ name: '', reps: '', weight: '' }]
    );

    // alerts
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const okCallback = useRef(() => { });

    /* ----- sync state when a new item is passed in ----- */
    useEffect(() => {
        if (!visible) return; // avoid state churn when modal closes
        if (initialData) {
            setItemType(initialData.type);
            setName(initialData.name);
            setDate(ddMMyyyyToDate(initialData.date));
            setDistance(initialData.distance ?? '');
            setDurationSecs(initialData.durationSecs ?? 0);
            setExercises(initialData.exercises ?? [
                { name: '', reps: '', weight: '' },
            ]);
        } else {
            resetState();
        }
    }, [initialData, visible]);

    /* ----- utils ----- */
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(
        date.getMonth() + 1
    )
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`;

    const showAlert = (title, message, onOk = () => { }) => {
        setAlertTitle(title);
        setAlertMessage(message);
        okCallback.current = onOk;
        setAlertVisible(true);
    };

    const resetState = () => {
        setItemType('run');
        setName('');
        setDate(new Date());
        setDistance('');
        setDurationSecs(0);
        setExercises([{ name: '', reps: '', weight: '' }]);
    };

    /* ----- exercise helpers ----- */
    const addExercise = () =>
        setExercises([...exercises, { name: '', reps: '', weight: '' }]);
    const deleteExercise = idx =>
        setExercises(exercises.filter((_, i) => i !== idx));
    const updateExercise = (idx, field, v) =>
        setExercises(
            exercises.map((ex, i) => (i === idx ? { ...ex, [field]: v } : ex))
        );

    /* ----- SAVE (add or update) ----- */
    const handleSave = async () => {
        try {
            if (itemType === 'run') {
                // validation
                if (!name.trim()) return showAlert('Missing Name', 'Enter a name.');
                if (!distance.trim())
                    return showAlert('Missing Distance', 'Enter the distance.');
                if (durationSecs === 0)
                    return showAlert('Missing Duration', 'Set the duration.');

                const runObj = {
                    id: initialData?.id ?? Date.now().toString(),
                    name: name.trim() || `Run on ${formattedDate}`,
                    date: formattedDate,
                    distance,
                    duration: formatDuration(durationSecs),
                    durationSecs,
                    type: 'run',
                };

                if (isEditing) {
                    await Storage.updateRun(runObj);
                } else {
                    await Storage.addRun(runObj);
                }
            } else {
                // workout validation
                if (!name.trim())
                    return showAlert('Missing Name', 'Enter a workout name.');
                const allValid = exercises.every(
                    ex => ex.name.trim() && ex.reps.trim() && ex.weight.trim()
                );
                if (!allValid)
                    return showAlert(
                        'Incomplete Exercise',
                        'Every exercise needs name, reps & weight.'
                    );

                const workoutObj = {
                    id: initialData?.id ?? Date.now().toString(),
                    name: name.trim() || `Workout on ${formattedDate}`,
                    date: formattedDate,
                    exercises,
                    type: 'workout',
                };

                if (isEditing) {
                    await Storage.updateWorkout(workoutObj);
                } else {
                    await Storage.addWorkout(workoutObj);
                }
            }

            showAlert(
                isEditing ? 'Item Updated!' : 'Item Saved!',
                `${name.trim() || (itemType === 'run' ? 'Run' : 'Workout')} ${isEditing ? 'updated' : 'saved'
                } successfully.`,
                () => {
                    resetState();
                    onClose(true); // true → refresh parent list
                }
            );
        } catch (err) {
            console.error(err);
            showAlert('Error', 'Something went wrong.');
        }
    };

    /* ----- DELETE ----- */
    const handleDelete = async () => {
        if (!initialData) return;
        try {
            if (initialData.type === 'run') {
                await Storage.deleteRun(initialData.id);
            } else {
                await Storage.deleteWorkout(initialData.id);
            }
            onClose(true);
        } catch (err) {
            console.error(err);
            showAlert('Error', 'Failed to delete.');
        }
    };

    /* ----- render ----- */
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.title}>
                            {isEditing ? 'Edit Item' : 'Add A New Item'}
                        </Text>

                        {/* TYPE SELECT */}
                        {!isEditing ? (
                            <View style={styles.typeRow}>
                                <Pressable
                                    style={styles.checkboxRow}
                                    onPress={() => setItemType('run')}
                                >
                                    <Checkbox
                                        value={itemType === 'run'}
                                        onValueChange={() => setItemType('run')}
                                    />
                                    <Text style={styles.checkboxLabel}>Run</Text>
                                </Pressable>

                                <Pressable
                                    style={styles.checkboxRow}
                                    onPress={() => setItemType('workout')}
                                >
                                    <Checkbox
                                        value={itemType === 'workout'}
                                        onValueChange={() => setItemType('workout')}
                                    />
                                    <Text style={styles.checkboxLabel}>Workout</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <View style={styles.typeRow}>
                                <Text style={[styles.checkboxLabel, { fontWeight: 'bold' }]}>
                                    Type: {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
                                </Text>
                            </View>
                        )}

                        {/* COMMON FIELDS */}
                        <TextInput
                            style={styles.input}
                            placeholder={
                                itemType === 'run' ? 'Enter Run Name' : 'Enter Workout Name'
                            }
                            value={name}
                            onChangeText={setName}
                        />

                        {/* DATE */}
                        <Pressable onPress={() => setShowDatePicker(true)}>
                            <TextInput
                                style={styles.input}
                                value={formattedDate}
                                editable={false}
                            />
                        </Pressable>
                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={(_, sel) => {
                                    setShowDatePicker(false);
                                    if (sel) setDate(sel);
                                }}
                            />
                        )}

                        {/* RUN-ONLY */}
                        {itemType === 'run' && (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Distance (km)"
                                    keyboardType="numeric"
                                    value={distance}
                                    onChangeText={setDistance}
                                />

                                {/* Duration */}
                                <Pressable onPress={() => setShowDurationPicker(true)}>
                                    <TextInput
                                        style={styles.input}
                                        editable={false}
                                        value={formatDuration(durationSecs)}
                                    />
                                </Pressable>
                                <TimerPickerModal
                                    visible={showDurationPicker}
                                    setIsVisible={setShowDurationPicker}
                                    onConfirm={({ hours = 0, minutes = 0, seconds = 0 }) => {
                                        setDurationSecs(hours * 3600 + minutes * 60 + seconds);
                                        setShowDurationPicker(false);
                                    }}
                                    modalTitle="Select Run Duration"
                                    closeOnOverlayPress
                                />
                            </>
                        )}

                        {/* WORKOUT-ONLY */}
                        {itemType === 'workout' && (
                            <>
                                {exercises.map((ex, idx) => (
                                    <View key={idx} style={styles.exerciseRow}>
                                        <TextInput
                                            style={[styles.input, styles.flex1]}
                                            placeholder="Exercise"
                                            value={ex.name}
                                            onChangeText={v => updateExercise(idx, 'name', v)}
                                        />
                                        <TextInput
                                            style={[styles.input, styles.smallInput]}
                                            placeholder="Reps"
                                            keyboardType="numeric"
                                            value={ex.reps}
                                            onChangeText={v => updateExercise(idx, 'reps', v)}
                                        />
                                        <TextInput
                                            style={[styles.input, styles.smallInput]}
                                            placeholder="Weight"
                                            keyboardType="numeric"
                                            value={ex.weight}
                                            onChangeText={v => updateExercise(idx, 'weight', v)}
                                        />
                                        {idx > 0 && (
                                            <TouchableOpacity
                                                onPress={() => deleteExercise(idx)}
                                                style={styles.trashButton}
                                            >
                                                <Icon name="trash-2" size={20} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                                <Button title="+ Add Exercise" onPress={addExercise} />
                            </>
                        )}

                        {/* ACTION BUTTONS */}
                        <View style={styles.buttonBar}>
                            <Button title="Save" onPress={handleSave} />
                            {isEditing && (
                                <Button title="Delete" color="#B00020" onPress={handleDelete} />
                            )}
                            <Button
                                title="Cancel"
                                color="black"
                                onPress={() => {
                                    resetState();
                                    onClose(false);
                                }}
                            />
                        </View>
                    </ScrollView>

                    {/* Alert */}
                    <CustomAlert
                        visible={alertVisible}
                        title={alertTitle}
                        message={alertMessage}
                        onClose={() => {
                            setAlertVisible(false);
                            okCallback.current();
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
};

/* ---------- styles ---------- */
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '88%',
        maxHeight: '90%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 16,
        textDecorationLine: 'underline',
    },
    input: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 6,
        padding: 10,
        fontSize: 18,
        marginBottom: 12,
    },
    typeRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    checkboxLabel: { fontSize: 18 },
    exerciseRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    flex1: { flex: 1 },
    smallInput: { flex: 0.6 },
    buttonBar: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    trashButton: { justifyContent: 'center', alignItems: 'center' },
});

export default ItemPopup;
