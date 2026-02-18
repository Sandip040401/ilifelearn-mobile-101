import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface AnimatedSplashScreenProps {
    onAnimationFinish: () => void;
}

export default function AnimatedSplashScreen({ onAnimationFinish }: AnimatedSplashScreenProps) {
    const [mounted, setMounted] = useState(false);
    const scale = useSharedValue(0.3);
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    // Ensure we mark mounted after first render
    useEffect(() => {
        setMounted(true);
    }, []);

    // Start animations only after mounted
    useEffect(() => {
        if (!mounted) return;

        // Small delay to ensure Reanimated is ready
        const startDelay = setTimeout(() => {
            scale.value = withSequence(
                withTiming(1.2, { duration: 800, easing: Easing.out(Easing.exp) }),
                withSpring(1, { damping: 10, stiffness: 100 })
            );

            opacity.value = withTiming(1, { duration: 800 });
            translateY.value = withDelay(600, withSpring(0, { damping: 12 }));
        }, 50);

        // Signal finish after total duration
        const finishTimeout = setTimeout(() => {
            onAnimationFinish();
        }, 2800);

        return () => {
            clearTimeout(startDelay);
            clearTimeout(finishTimeout);
        };
    }, [mounted]);

    const animatedLogoStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    const animatedTextStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ translateY: translateY.value }]
        };
    });

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#6C4CFF', '#9B5CFF']}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.contentContainer}>
                <Animated.View style={[styles.iconContainer, animatedLogoStyle]}>
                    <Image
                        source={require('../assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Animated.View>

                <Animated.View style={[styles.textContainer, animatedTextStyle]}>
                    <Animated.Text style={styles.title}>iLifeLearn</Animated.Text>
                    <Animated.Text style={styles.subtitle}>Discover. Learn. Grow.</Animated.Text>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
        marginBottom: 24,
    },
    logo: {
        width: 80,
        height: 80,
    },
    iconText: {
        fontSize: 60,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        letterSpacing: 0.5,
    }
});
