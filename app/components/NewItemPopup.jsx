import React, { useState, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TextInput,
    Button,
    ScrollView,
    Pressable,
    TouchableOpacity
} from 'react-native';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TimerPickerModal } from 'react-native-timer-picker';
import { Storage } from '../utils/storage';
import CustomAlert from '../components/CustomAlert';
import Icon from 'react-native-vector-icons/Feather';

const NewItemPopup = ({ visible, onClose }) => {

    const [itemType, setItemType] = useState('run');
    const [name, setName] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [distance, setDistance] = useState('');
    const [durationSecs, setDurationSecs] = useState(0);
    const [showDurationPicker, setShowDurationPicker] = useState(false);

    const [exercises, setExercises] = useState([{ name: '', reps: '', weight: '' }]);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const okCallback = useRef(() => { });

    const addExercise = () => {
        setExercises([...exercises, { name: '', reps: '', weight: '' }]);
    }

    const deleteExercise = (index) => {
        setExercises(prev => prev.filter((_, i) => i !== index));
    };

    const updateExercise = (idx, field, value) =>
        setExercises(prev =>
            prev.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex)),
        );

    const resetState = () => {
        setItemType('run');
        setName('');
        setDate(new Date());
        setDistance('');
        setDurationSecs(0);
        setExercises([{ name: '', reps: '', weight: '' }]);
    };

    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(
        date.getMonth() + 1
    )
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`;

    const handleDateChange = (_, selected) => {
        setShowDatePicker(false);
        if (selected) setDate(selected);
    };

    const formatDuration = totalSeconds => {
        const h = Math.floor(totalSeconds / 3600)
            .toString()
            .padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60)
            .toString()
            .padStart(2, '0');
        const s = (totalSeconds % 60).
            toString().
            padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const showAlert = (title, message, onOk = () => { }) => {
        setAlertTitle(title);
        setAlertMessage(message);
        okCallback.current = onOk;
        setAlertVisible(true);
    };

    const handleSave = async () => {
        try {
            if (itemType === 'run') {
                if (!name.trim()) {
                    showAlert('Missing Name', 'Please enter a name for the run.');
                    return;
                }
                if (!distance.trim()) {
                    showAlert('Missing Distance', 'Please enter the distance.');
                    return;
                }
                if (durationSecs === 0) {
                    showAlert('Missing Duration', 'Please set the duration.');
                    return;
                }

                await Storage.addRun({
                    name: name.trim() || `Run on ${formattedDate}`,
                    date: formattedDate,
                    distance,
                    duration: formatDuration(durationSecs),
                    durationSecs,
                    type: "run"
                });

                showAlert(
                    'Run Saved !',
                    `${name.trim() || `Run on ${formattedDate}`} saved successfully.`,
                    () => {
                        resetState();
                        onClose();
                    },
                );
            } else {
                if (!name.trim()) {
                    showAlert('Missing Name', 'Please enter a workout name.');
                    return;
                }

                const allValid = exercises.every(
                    ex => ex.name.trim() && ex.reps.trim() && ex.weight.trim(),
                );

                if (!allValid) {
                    showAlert(
                        'Incomplete Exercise',
                        'All exercises must have a name, reps, and weight.',
                    );
                    return;
                }

                await Storage.addWorkout({
                    name: name.trim() || `Workout on ${formattedDate}`,
                    date: formattedDate,
                    exercises,
                    type: "workout"
                });

                showAlert(
                    'Workout Saved !',
                    `${name.trim() || `Workout on ${formattedDate}`} saved successfully.`,
                    () => {
                        resetState();
                        onClose();
                    },
                );
            }
        } catch (err) {
            console.error('Failed to save item:', err);
            showAlert('Error Saving', 'Something went wrong. Try again.');
        }
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.title}>Add A New Item</Text>

                        {/* TYPE SELECTION */}
                        <View style={styles.typeRow}>
                            <Pressable
                                style={styles.checkboxRow}
                                onPress={() => setItemType('run')}>
                                <Checkbox
                                    value={itemType === 'run'}
                                    onValueChange={() => setItemType('run')}
                                />
                                <Text style={styles.checkboxLabel}>Run</Text>
                            </Pressable>

                            <Pressable
                                style={styles.checkboxRow}
                                onPress={() => setItemType('workout')}>
                                <Checkbox
                                    value={itemType === 'workout'}
                                    onValueChange={() => setItemType('workout')}
                                />
                                <Text style={styles.checkboxLabel}>Workout</Text>
                            </Pressable>
                        </View>

                        {/* COMMON FIELDS */}
                        <TextInput
                            style={styles.input}
                            placeholder={itemType === 'run' ? 'Enter Run Name' : 'Enter Workout Name'}
                            value={name}
                            onChangeText={setName}
                        />

                        {/* DATE */}
                        <Pressable onPress={() => setShowDatePicker(true)}>
                            <TextInput
                                style={styles.input}
                                editable={false}
                                value={formattedDate}
                                pointerEvents="none"
                            />
                        </Pressable>
                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                            />
                        )}

                        {/* RUN‑ONLY FIELDS */}
                        {itemType === 'run' && (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Distance (km)"
                                    keyboardType="numeric"
                                    value={distance}
                                    onChangeText={setDistance}
                                />

                                {/* DURATION (HH:MM:SS) */}
                                <Pressable onPress={() => setShowDurationPicker(true)}>
                                    <TextInput
                                        style={styles.input}
                                        editable={false}
                                        value={formatDuration(durationSecs)}
                                        pointerEvents="none"
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

                        {/* WORKOUT‑ONLY FIELDS */}
                        {itemType === 'workout' && (
                            <>
                                {exercises.map((ex, idx) => (
                                    <View key={idx} style={styles.exerciseRow}>
                                        <TextInput
                                            style={[styles.input, styles.flex1]}
                                            placeholder="Exercise Name"
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
                                            <TouchableOpacity onPress={() => deleteExercise(idx)} style={styles.trashButton}>
                                                <Icon name="trash-2" size={20} color="black" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                                <Button title="+ Add Exercise" onPress={addExercise} />
                            </>
                        )}

                        {/* ACTION BUTTONS */}
                        <View style={styles.buttonBar}>
                            <Button title="Save Item" onPress={handleSave} />
                            <Button
                                title="Cancel"
                                color="red"
                                onPress={() => {
                                    resetState();
                                    onClose();
                                }}
                            />
                        </View>
                    </ScrollView>

                    {/* Custom Alert */}
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
        marginBottom: 16,
        textAlign: 'center',
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
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    checkboxLabel: {
        fontSize: 18,
    },
    exerciseRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    flex1: {
        flex: 1,
    },
    smallInput: {
        flex: 0.6,
    },
    buttonBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    trashButton: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    }
});

export default NewItemPopup;
