import { useState } from 'react';
import { Link, Redirect, router } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { Field, styles } from '../../src/components/common';
import { getErrorMessage } from '../../src/utils/errors';
import { COLORS } from '../../src/constants';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (isAuthenticated) return <Redirect href="/" />;
  async function submit() {
    if (!email.trim() || !password) return setError('Email and password are required.');
    setBusy(true); setError('');
    try { await login({ email: email.trim(), password }); router.replace('/'); } catch (e) { setError(getErrorMessage(e, 'Invalid email or password.')); } finally { setBusy(false); }
  }
  return <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[styles.screen, { justifyContent: 'center', minHeight: '100%' }]} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <View style={{ width: 64, height: 64, borderRadius: 16, borderWidth: 1, borderColor: '#78350F', backgroundColor: '#451A03', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: COLORS.amber, fontSize: 30 }}>C</Text>
          </View>
        </View>
        <View style={{ alignItems: 'center', marginBottom: 14 }}>
          <Text style={[styles.title, { textAlign: 'center' }]}>Coal Research Portal</Text>
          <Text style={[styles.muted, { textAlign: 'center', marginTop: 4 }]}>Science & Technology Project Monitoring System</Text>
        </View>
        <View style={{ backgroundColor: COLORS.surface, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, padding: 18, gap: 12 }}>
          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700' }}>Sign in to your account</Text>
          {error ? <View style={{ borderRadius: 10, borderWidth: 1, borderColor: '#7F1D1D', backgroundColor: '#450A0A', padding: 12 }}><Text style={{ color: '#FECACA', fontSize: 13 }}>{error}</Text></View> : null}
          <Field label="Official Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="researcher@coal.gov.in" />
          <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholder="••••••••" right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} color={COLORS.muted} onPress={() => setShowPassword((value) => !value)} accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} />} />
          <Button mode="contained" buttonColor={COLORS.amber} textColor="#0F172A" contentStyle={{ height: 48 }} loading={busy} disabled={busy} onPress={submit}>Sign in</Button>
          <View style={{ borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 14, alignItems: 'center' }}>
            <Text style={styles.muted}>Need a project researcher account? <Link href="/signup" style={{ color: COLORS.amber, fontWeight: '700' }}>Register here</Link></Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
