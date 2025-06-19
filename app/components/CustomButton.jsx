import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ title, onPress, backgroundColor = 'black', color = 'white', style }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.button, { backgroundColor }, style]}
        >
            <Text style={[styles.buttonText, { color }]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 8,
        alignItems: 'center',
        padding: 20
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default CustomButton;
