import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../src/auth/AuthProvider';
export default function ResearcherLayout() {
  const { isResearcher, loading } = useAuth(); if (!loading && !isResearcher) return <Redirect href="/" />;
  return <Tabs screenOptions={{ tabBarActiveTintColor: '#1D4ED8', headerShown: false }}><Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} /><Tabs.Screen name="projects/index" options={{ title: 'Projects' }} /><Tabs.Screen name="reports/index" options={{ title: 'Reports' }} /><Tabs.Screen name="funds/index" options={{ title: 'Funds' }} /><Tabs.Screen name="profile" options={{ title: 'Profile' }} /></Tabs>;
}
