import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import '../services/LocationTracking'; // Initialize global task manager
import { stopBackgroundLocation } from '../services/LocationTracking';
import { initOfflineDB, syncOfflineQueue } from '../services/OfflineSync';
import { registerForPushNotificationsAsync } from '../services/PushNotifications';
import NetInfo from '@react-native-community/netinfo';

function RootNavigationLayout() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Enforce background location isolation: never allow non-driver roles to run background tracking
  useEffect(() => {
    if (user && user.role !== 'driver' && Platform.OS !== 'web') {
      stopBackgroundLocation();
    }
  }, [user]);

  // Initialize features once on mount
  useEffect(() => {
    // 1. Init SQLite for Offline Queue
    if (Platform.OS !== 'web') {
      try {
        initOfflineDB();
      } catch (e) {
        console.warn('Failed to init SQLite offline db', e);
      }
      
      // 2. Request Push Notification permissions
      registerForPushNotificationsAsync();
      
      // 3. Listen to Network state changes to trigger Sync
      const unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected) {
          syncOfflineQueue();
        }
      });
      
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inLegalGroup = segments[0] === '(legal)';

    if (!user && !inAuthGroup && !inLegalGroup) {
      // TC-004: Route Guard (Unauthorized Access) -> Redirect to login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // User is already logged in, route to appropriate dashboard
      if (user.role === 'admin') {
        router.replace('/(admin)/dashboard');
      } else if (user.role === 'driver') {
        router.replace('/(driver)/dashboard');
      } else {
        router.replace('/(customer)/dashboard');
      }
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f141f', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#e86331" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f141f" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0f141f' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(legal)" options={{ headerShown: false }} />
        <Stack.Screen name="(customer)" options={{ headerShown: false }} />
        <Stack.Screen name="(driver)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigationLayout />
    </AuthProvider>
  );
}
