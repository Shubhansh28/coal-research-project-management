import { Text, View } from 'react-native';
import { styles } from './common';
export function Detail({ label, value }) {
  return <View><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value ?? 'Not specified'}</Text></View>;
}
