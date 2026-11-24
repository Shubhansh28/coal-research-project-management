import { router } from 'expo-router';
import { Text } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { useAuth } from '../auth/AuthProvider';
import { Detail } from '../components/Detail';
import { Screen, SectionTitle, styles } from '../components/common';
export default function ProfileScreen() {
  const { user, logout } = useAuth();
  return <Screen><SectionTitle>Profile</SectionTitle><Card><Card.Content><Detail label="Name" value={user?.name} /><Detail label="Email" value={user?.email} /><Detail label="Role" value={user?.role} /></Card.Content></Card><Button mode="outlined" textColor="#B42318" onPress={async () => { await logout(); router.replace('/login'); }}>Log out</Button></Screen>;
}
