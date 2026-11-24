import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../src/auth/AuthProvider';

export default function Index() {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>;
  return <Redirect href={isAuthenticated ? (isAdmin ? '/(admin)/dashboard' : '/(researcher)/dashboard') : '/(auth)/login'} />;
}
