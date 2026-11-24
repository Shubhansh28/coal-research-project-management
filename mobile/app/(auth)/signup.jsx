import { useState } from 'react';
import { Link, router } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { Field, styles } from '../../src/components/common';
import { getErrorMessage } from '../../src/utils/errors';
import { COLORS } from '../../src/constants';

export default function Signup() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit() {
    setError('');
    if (!name.trim() || !email.trim() || !password || !confirmPassword) return setError('Please fill in all required fields.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setBusy(true); setError('');
    try {
      await signup({ name: name.trim(), email: email.trim(), password });
      setSuccess(true);
      setTimeout(() => router.replace('/login'), 1200);
    } catch (e) {
      setError(getErrorMessage(e, 'Signup failed.'));
    } finally {
      setBusy(false);
    }
  }
  return <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[styles.screen, { paddingTop: 28 }]} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.title, { textAlign: 'center' }]}>Coal Research Portal</Text>
          <Text style={[styles.muted, { textAlign: 'center', marginTop: 4 }]}>Science & Technology Project Monitoring System</Text>
        </View>
        <View style={{ backgroundColor: COLORS.surface, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, padding: 18, gap: 12 }}>
          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700' }}>Create Researcher Account</Text>
          <Text style={{ color: COLORS.amber, fontSize: 12 }}>Newly registered accounts default to the RESEARCHER role.</Text>
          {error ? <View style={{ borderRadius: 10, borderWidth: 1, borderColor: '#7F1D1D', backgroundColor: '#450A0A', padding: 12 }}><Text style={{ color: '#FECACA', fontSize: 13 }}>{error}</Text></View> : null}
          {success ? <View style={{ borderRadius: 10, borderWidth: 1, borderColor: '#065F46', backgroundColor: '#064E3B', padding: 12 }}><Text style={{ color: '#A7F3D0', fontSize: 13 }}>Account created successfully. Redirecting to sign in...</Text></View> : null}
          <Field label="Full Name" value={name} onChangeText={setName} placeholder="Dr. Rajesh Kumar" />
          <Field label="Official Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="researcher@coal.gov.in" />
          <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholder="Minimum 6 characters" right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} color={COLORS.muted} onPress={() => setShowPassword((value) => !value)} accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} />} />
          <Field label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} placeholder="Repeat your password" right={<TextInput.Icon icon={showConfirmPassword ? 'eye-off' : 'eye'} color={COLORS.muted} onPress={() => setShowConfirmPassword((value) => !value)} accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} />} />
          {confirmPassword && password !== confirmPassword ? <Text style={{ color: COLORS.danger, fontSize: 12 }}>Passwords do not match.</Text> : null}
          <Button mode="contained" buttonColor={COLORS.amber} textColor="#0F172A" contentStyle={{ height: 48 }} loading={busy} disabled={busy || success} onPress={submit}>Register</Button>
          <View style={{ borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 14, alignItems: 'center' }}>
            <Text style={styles.muted}>Already registered? <Link href="/login" style={{ color: COLORS.amber, fontWeight: '700' }}>Sign in here</Link></Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
