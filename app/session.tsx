import { useEffect, useState, useRef } from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Notifications from 'expo-notifications';

import BackgroundTimer from 'react-native-background-timer';

export default function SessionScreen() {
    const { total, work, rest, mode, cycles } = useLocalSearchParams();

    const workSeconds = Number(work);
    const restSeconds = Number(rest);
    const totalSeconds = Number(total || 0);
    const maxCycles = Number(cycles || 0);

    const [phase, setPhase] = useState<'Work' | 'Rest'>('Work');
    const [timeLeft, setTimeLeft] = useState(workSeconds);
    const [elapsed, setElapsed] = useState(0);
    const [running, setRunning] = useState(true);
    const [cycleCount, setCycleCount] = useState(0);

    const timerRef = useRef<number | null>(null);
    const phaseRef = useRef<'Work' | 'Rest'>(phase);
    const timeLeftRef = useRef(timeLeft);
    const elapsedRef = useRef(elapsed);
    const cycleRef = useRef(cycleCount);

    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);

    useEffect(() => {
        timeLeftRef.current = timeLeft;
    }, [timeLeft]);

    useEffect(() => {
        elapsedRef.current = elapsed;
    }, [elapsed]);

    useEffect(() => {
        cycleRef.current = cycleCount;
    }, [cycleCount]);

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const sendNotification = async (nextPhase: 'Work' | 'Rest') => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '⏰ Time to switch!',
                body: nextPhase === 'Work' ? 'Start working 🏃‍♂️' : 'Take a break 🛋️',
                sound: 'default',
            },
            trigger: null,
            android: {
                channelId: 'alarm',
            },
        });
    };

    const sendCompletionNotification = async () => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🎉 Session Complete!',
                body:
                    mode === 'cycles'
                        ? `You've completed all ${maxCycles} cycle(s)! Great work! 💪\n\nTime to relax or reflect on your session.`
                        : `Your ${Math.floor(totalSeconds / 60)} minute timer is finished! 🎯\n\nTake a breath or stretch now.`,
                sound: 'default',
            },
            trigger: null,
            android: {
                channelId: 'complete',
            },
        });
    };


    const startTimer = () => {
        if (timerRef.current) return;
    
        timerRef.current = BackgroundTimer.setInterval(() => {
            const updatedElapsed = elapsedRef.current + 1;
            elapsedRef.current = updatedElapsed;
            setElapsed(updatedElapsed);
    
            if (
                (mode === 'duration' && updatedElapsed >= totalSeconds) ||
                (mode === 'cycles' && cycleRef.current >= maxCycles)
            ) {
                stopTimer();
                sendCompletionNotification();
                router.back();
                return;
            }
    
            const currentTimeLeft = timeLeftRef.current;
    
            if (currentTimeLeft <= 1) {
                if (phaseRef.current === 'Work') {
                    setPhase('Rest');
                    phaseRef.current = 'Rest';
                    setTimeLeft(restSeconds);
                    timeLeftRef.current = restSeconds;
                } else {
                    const nextCycle = cycleRef.current + 1;
                    setCycleCount(nextCycle);
                    cycleRef.current = nextCycle;
    
                    setPhase('Work');
                    phaseRef.current = 'Work';
                    setTimeLeft(workSeconds);
                    timeLeftRef.current = workSeconds;
                }
    
                sendNotification(phaseRef.current === 'Work' ? 'Rest' : 'Work');
            } else {
                const updatedTimeLeft = currentTimeLeft - 1;
                setTimeLeft(updatedTimeLeft);
                timeLeftRef.current = updatedTimeLeft;
            }
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            BackgroundTimer.clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    useEffect(() => {
        if (running && !timerRef.current) {
            startTimer();
        }
        return stopTimer;
    }, [running]);

    return (
        <View style={styles.container}>
            <Text style={[styles.phaseText, phase === 'Work' ? styles.workColor : styles.restColor]}>
                {phase} Time
            </Text>

            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>

            {mode === 'cycles' ? (
                <Text style={styles.subText}>Cycle: {cycleCount} / {maxCycles}</Text>
            ) : (
                <Text style={styles.subText}>
                    Elapsed: {formatTime(elapsed)} / {formatTime(totalSeconds)}
                </Text>
            )}

            <View style={styles.buttonRow}>
                <Pressable
                    onPress={() => setRunning(!running)}
                    style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                >
                    <Text style={styles.buttonText}>{running ? 'Pause' : 'Resume'}</Text>
                </Pressable>
                <Pressable
                    onPress={() => {
                        stopTimer();
                        router.back();
                    }}
                    style={({ pressed }) => [styles.button, styles.stopButton, pressed && styles.buttonPressed]}
                >
                    <Text style={styles.buttonText}>Stop</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212', // deep dark background
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    phaseText: {
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#f1f1f1', // light text for dark mode
    },
    workColor: {
        color: '#ff6b6b', // softer red for dark mode
    },
    restColor: {
        color: '#81c784', // mint green for rest
    },
    timerText: {
        fontSize: 72,
        fontWeight: 'bold',
        color: '#e0e0e0', // very light gray
        marginBottom: 8,
    },
    subText: {
        fontSize: 16,
        color: '#aaa', // medium gray for less emphasis
        marginBottom: 32,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 16,
    },
    button: {
        backgroundColor: '#1e88e5', // vibrant blue for main action
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 12,
        elevation: 3,
    },
    stopButton: {
        backgroundColor: '#424242', // dark gray for stop button
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
