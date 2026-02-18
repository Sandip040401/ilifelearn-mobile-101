import SafeAreaView from '@/components/SafeAreaView';
import useAuthStore from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useResolveClassNames } from 'uniwind';

export default function LoginSignup() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const { login } = useAuthStore();
    const styles = useResolveClassNames('flex-1');

    const handleAuth = async () => {
        if (!email || !password || (!isLogin && !name)) {
            alert('Please fill in all fields');
            return;
        }

        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            const mockUser = {
                id: '123',
                name: isLogin ? 'Test User' : name,
                email: email,
            };

            login(mockUser, 'mock-token-123');
            setIsLoading(false);

            // Navigation is handled by the layout redirect, but we can also push just in case
            // router.replace('/home-screen'); 
        }, 1500);
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F4F7FF]">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 2}
            >
                <ScrollView
                    contentContainerStyle={{ flex: 1, height: "100%", padding: 24, paddingBottom: 2 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="items-center mb-10">
                        <View className="w-20 h-20 bg-[#6C4CFF] rounded-3xl items-center justify-center mb-4 shadow-lg shadow-[#6C4CFF]/30">
                            <Image
                                source={require('../../assets/images/logo.png')}
                                className="w-14 h-14"
                                resizeMode="contain"
                            />
                        </View>
                        <Text className="text-3xl font-bold text-[#121826] text-center">
                            {isLogin ? 'Welcome Back!' : 'Create Account'}
                        </Text>
                        <Text className="text-[#6B7280] text-base mt-2 text-center">
                            {isLogin ? 'Sign in to continue your learning journey' : 'Start your adventure with us today'}
                        </Text>
                    </View>

                    {/* Toggle */}
                    <View className="bg-white rounded-2xl p-1 flex-row mb-8 shadow-sm border border-gray-100">
                        <TouchableOpacity
                            className={`flex-1 py-3 rounded-xl ${isLogin ? 'bg-[#F4F7FF]' : 'bg-transparent'}`}
                            onPress={() => setIsLogin(true)}
                        >
                            <Text className={`text-center font-semibold ${isLogin ? 'text-[#6C4CFF]' : 'text-[#6B7280]'}`}>
                                Login
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 py-3 rounded-xl ${!isLogin ? 'bg-[#F4F7FF]' : 'bg-transparent'}`}
                            onPress={() => setIsLogin(false)}
                        >
                            <Text className={`text-center font-semibold ${!isLogin ? 'text-[#6C4CFF]' : 'text-[#6B7280]'}`}>
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <View className="gap-4">
                        {!isLogin && (
                            <View>
                                <Text className="text-[#121826] font-medium mb-1.5 ml-1">Full Name</Text>
                                <TextInput
                                    className="bg-white px-4 py-3.5 rounded-xl border border-gray-200 text-[#121826]"
                                    placeholder="Enter your full name"
                                    placeholderTextColor="#9CA3AF"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        )}

                        <View>
                            <Text className="text-[#121826] font-medium mb-1.5 ml-1">Email Address</Text>
                            <TextInput
                                className="bg-white px-4 py-3.5 rounded-xl border border-gray-200 text-[#121826]"
                                placeholder="hello@example.com"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <View>
                            <Text className="text-[#121826] font-medium mb-1.5 ml-1">Password</Text>
                            <View className="flex-row items-center bg-white rounded-xl border border-gray-200 pr-3">
                                <TextInput
                                    className="flex-1 px-4 py-3.5 text-[#121826]"
                                    placeholder="Enter your password"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={22}
                                        color="#9CA3AF"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {isLogin && (
                            <TouchableOpacity className="self-end mt-1">
                                <Text className="text-[#6C4CFF] text-sm font-medium">Forgot Password?</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            className="mt-6"
                            onPress={handleAuth}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={['#6C4CFF', '#9B5CFF']}
                                start={{ x: 0, y: 0 }}
                                end={{ y: 0, x: 1 }}
                                className="py-4 rounded-xl overflow-hidden items-center shadow-lg shadow-[#6C4CFF]/30"
                            >
                                <Text className="text-white font-bold text-lg">
                                    {isLoading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    {/* <View className="flex-row justify-center mt-8">
                        <Text className="text-[#6B7280]">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                        </Text>
                        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                            <Text className="text-[#6C4CFF] font-semibold">
                                {isLogin ? 'Sign Up' : 'Log In'}
                            </Text>
                        </TouchableOpacity>
                    </View> */}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}