import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  const [mode, setMode] = useState<'duration' | 'cycles'>('duration');
  const [timeUnit, setTimeUnit] = useState<'minutes' | 'seconds'>('minutes');

  const [totalMinutes, setTotalMinutes] = useState('30');
  const [cycleCount, setCycleCount] = useState('4');
  const [workMinutes, setWorkMinutes] = useState('1');
  const [restMinutes, setRestMinutes] = useState('2');

  const [errors, setErrors] = useState({ total: false, work: false, rest: false });

  const convert = (value: string) =>
    timeUnit === 'minutes' ? Number(value) * 60 : Number(value);

  const validate = () => {
    const workValid = Number(workMinutes) > 0;
    const restValid = Number(restMinutes) > 0;
    const totalValid =
      mode === 'duration' ? Number(totalMinutes) > 0 : Number(cycleCount) > 0;

    setErrors({
      total: !totalValid,
      work: !workValid,
      rest: !restValid,
    });

    return workValid && restValid && totalValid;
  };

  const handleStart = () => {
    if (!validate()) return;

    if (mode === 'duration') {
      router.push({
        pathname: '/session',
        params: {
          total: convert(totalMinutes).toString(),
          work: convert(workMinutes).toString(),
          rest: convert(restMinutes).toString(),
          mode: 'duration',
        },
      });
    } else {
      router.push({
        pathname: '/session',
        params: {
          cycles: cycleCount,
          work: convert(workMinutes).toString(),
          rest: convert(restMinutes).toString(),
          mode: 'cycles',
        },
      });
    }
  };

  const isDisabled =
    (mode === 'duration' && Number(totalMinutes) <= 0) ||
    Number(workMinutes) <= 0 ||
    Number(restMinutes) <= 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>⏱️ Setup Your Timer</Text>

      {/* Mode Toggle */}
      <View style={styles.modeToggle}>
        <Pressable
          onPress={() => setMode('duration')}
          style={[styles.tabButton, mode === 'duration' && styles.activeTab]}
        >
          <Text style={styles.tabText}>Duration</Text>
        </Pressable>
        <Pressable
          onPress={() => setMode('cycles')}
          style={[styles.tabButton, mode === 'cycles' && styles.activeTab]}
        >
          <Text style={styles.tabText}>Cycles</Text>
        </Pressable>
      </View>

      {/* Time Unit Toggle */}
      <View style={styles.unitToggleContainer}>
        <Pressable
          onPress={() => setTimeUnit('minutes')}
          style={[styles.unitButton, timeUnit === 'minutes' && styles.unitButtonActive]}
        >
          <Text style={styles.unitText}>Minutes</Text>
        </Pressable>
        <Pressable
          onPress={() => setTimeUnit('seconds')}
          style={[styles.unitButton, timeUnit === 'seconds' && styles.unitButtonActive]}
        >
          <Text style={styles.unitText}>Seconds</Text>
        </Pressable>
      </View>

      {/* Total Duration OR Cycles */}
      {mode === 'duration' ? (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Total Duration ({timeUnit})</Text>
          <TextInput
            style={[styles.input, errors.total && styles.errorInput]}
            keyboardType="numeric"
            value={totalMinutes}
            onChangeText={(text) => {
              setTotalMinutes(text);
              setErrors((e) => ({ ...e, total: false }));
            }}
            placeholder="e.g. 30"
          />
          {errors.total && <Text style={styles.errorText}>Must be greater than 0</Text>}
        </View>
      ) : (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Number of Cycles</Text>
          <TextInput
            style={[styles.input, errors.total && styles.errorInput]}
            keyboardType="numeric"
            value={cycleCount}
            onChangeText={(text) => {
              setCycleCount(text);
              setErrors((e) => ({ ...e, total: false }));
            }}
            placeholder="e.g. 4"
          />
          {errors.total && <Text style={styles.errorText}>Must be greater than 0</Text>}
        </View>
      )}

      {/* Work and Rest */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Work Interval ({timeUnit})</Text>
        <TextInput
          style={[styles.input, errors.work && styles.errorInput]}
          keyboardType="numeric"
          value={workMinutes}
          onChangeText={(text) => {
            setWorkMinutes(text);
            setErrors((e) => ({ ...e, work: false }));
          }}
          placeholder="e.g. 1"
        />
        {errors.work && <Text style={styles.errorText}>Must be greater than 0</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Rest Interval ({timeUnit})</Text>
        <TextInput
          style={[styles.input, errors.rest && styles.errorInput]}
          keyboardType="numeric"
          value={restMinutes}
          onChangeText={(text) => {
            setRestMinutes(text);
            setErrors((e) => ({ ...e, rest: false }));
          }}
          placeholder="e.g. 2"
        />
        {errors.rest && <Text style={styles.errorText}>Must be greater than 0</Text>}
      </View>

      {/* Start Button */}
      <Pressable
        onPress={handleStart}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          isDisabled && styles.buttonDisabled,
        ]}
        disabled={isDisabled}
      >
        <Text style={styles.buttonText}>Start Timer</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 28,
    color: '#2d3436',
  },

  // Toggles
  modeToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#dfe6e9',
    elevation: 1,
  },
  activeTab: {
    backgroundColor: '#0984e3',
  },
  tabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  unitToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
  },
  unitButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#dfe6e9',
  },
  unitButtonActive: {
    backgroundColor: '#00b894',
  },
  unitText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Input blocks
  inputGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  label: {
    fontSize: 15,
    color: '#636e72',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  errorInput: {
    borderColor: '#d63031',
  },
  errorText: {
    color: '#d63031',
    fontSize: 13,
    marginTop: 4,
  },

  // Button
  button: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#b2bec3',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
