import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Button, Card, Chip, TextInput } from 'react-native-paper';
import { COLORS } from '../constants';
import { getErrorMessage } from '../utils/errors';

export function Screen({ children, refreshing, onRefresh }) {
  const { width } = useWindowDimensions();
  const horizontal = width >= 900 ? 32 : width >= 600 ? 24 : 16;
  return <ScrollView
    contentContainerStyle={[styles.screen, { paddingHorizontal: horizontal }]}
    keyboardShouldPersistTaps="handled"
    refreshControl={onRefresh ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} tintColor={COLORS.amber} /> : undefined}
  >{children}</ScrollView>;
}
export function Loading() { return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.amber} /></View>; }
export function ErrorState({ error, onRetry }) {
  return <View style={styles.center}><Text style={styles.error}>{getErrorMessage(error)}</Text>{onRetry && <Button mode="contained" onPress={onRetry}>Retry</Button>}</View>;
}
export function EmptyState({ message = 'No records found.' }) { return <View style={styles.empty}><Text style={styles.muted}>{message}</Text></View>; }
export function StatusChip({ status }) {
  const color = status === 'APPROVED' || status === 'COMPLETED' ? COLORS.success : status === 'REJECTED' ? COLORS.danger : COLORS.warning;
  return <Chip compact style={{ backgroundColor: `${color}18` }} textStyle={{ color, fontSize: 11 }}>{status}</Chip>;
}
export function Field({ label, ...props }) {
  return <TextInput
    label={label}
    mode="outlined"
    outlineColor={COLORS.border}
    activeOutlineColor={COLORS.amber}
    textColor={COLORS.inputText}
    placeholderTextColor={COLORS.muted}
    style={styles.field}
    contentStyle={{ minHeight: 48 }}
    {...props}
  />;
}
export function SectionTitle({ children, action }) { return <View style={styles.sectionRow}><Text style={styles.sectionTitle}>{children}</Text>{action}</View>; }
export function ProjectCard({ project, onPress }) {
  return <Pressable onPress={onPress}><Card style={styles.card}><Card.Content><View style={styles.sectionRow}><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{project.title}</Text><Text style={styles.muted}>{project.projectCode}</Text></View><StatusChip status={project.status} /></View>{project.description ? <Text style={styles.body} numberOfLines={2}>{project.description}</Text> : null}</Card.Content></Card></Pressable>;
}
export const styles = StyleSheet.create({
  screen: { paddingTop: 18, paddingBottom: 36, backgroundColor: COLORS.background, flexGrow: 1, gap: 14 },
  center: { flex: 1, minHeight: 240, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  empty: { padding: 30, alignItems: 'center' },
  error: { color: COLORS.danger, textAlign: 'center' },
  muted: { color: COLORS.muted, fontSize: 13, lineHeight: 19 },
  title: { color: COLORS.text, fontSize: 24, lineHeight: 30, fontWeight: '800', letterSpacing: -0.3 },
  sectionTitle: { color: COLORS.text, fontSize: 18, lineHeight: 24, fontWeight: '700' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  card: { backgroundColor: COLORS.surface, marginBottom: 10, borderColor: COLORS.border, borderWidth: 1 },
  cardTitle: { color: COLORS.text, fontWeight: '700', fontSize: 16, lineHeight: 22 },
  body: { color: COLORS.text, lineHeight: 21, marginTop: 10 },
  field: { backgroundColor: COLORS.white },
  label: { color: COLORS.muted, fontSize: 12, marginBottom: 3 },
  value: { color: COLORS.text, fontSize: 15, marginBottom: 10 }
});
