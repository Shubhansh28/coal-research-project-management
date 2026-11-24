import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { Button, Card, Checkbox } from 'react-native-paper';
import { projectsApi } from '../api/client';
import { ErrorState, Loading, Screen, SectionTitle, styles } from '../components/common';
import { getErrorMessage } from '../utils/errors';
import { useState } from 'react';
import { Field } from '../components/common';
import { COLORS } from '../constants';
export default function AssignmentScreen() {
  const { id } = useLocalSearchParams();
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const available = useQuery({ queryKey: ['available-researchers', id], queryFn: async () => (await projectsApi.availableResearchers(id)).data.data || [] });
  const project = useQuery({ queryKey: ['project', id], queryFn: async () => (await projectsApi.get(id)).data.project });
  const assign = useMutation({ mutationFn: () => projectsApi.assign(id, selected), onSuccess: () => {
    setSelected([]);
    client.invalidateQueries({ queryKey: ['available-researchers', id] });
    client.invalidateQueries({ queryKey: ['project', id] });
  } });
  const remove = useMutation({ mutationFn: (userId) => projectsApi.removeResearcher(id, userId), onSuccess: () => {
    client.invalidateQueries({ queryKey: ['available-researchers', id] });
    client.invalidateQueries({ queryKey: ['project', id] });
  } });
  if (available.isLoading || project.isLoading) return <Loading />;
  if (available.isError) return <ErrorState error={available.error} onRetry={available.refetch} />;
  const q = search.trim().toLowerCase();
  const filtered = available.data.filter((researcher) => !q || researcher.name?.toLowerCase().includes(q) || researcher.email?.toLowerCase().includes(q));
  const assigned = project.data?.researchers || [];
  return <Screen refreshing={available.isFetching || project.isFetching} onRefresh={() => { available.refetch(); project.refetch(); }}>
    <SectionTitle>Manage Project Researchers</SectionTitle>
    <Text style={styles.muted}>Allocation for <Text style={{ color: '#F59E0B', fontFamily: 'monospace' }}>{project.data?.projectCode}</Text></Text>
    <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 8 }}>Assigned Researchers ({assigned.length})</Text>
    {assigned.length === 0 ? <Text style={styles.muted}>No researchers are currently assigned.</Text> : assigned.map((researcher) => <Card key={researcher.id} style={styles.card}><Card.Content><View style={styles.sectionRow}><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{researcher.name}</Text><Text style={styles.muted}>{researcher.email}</Text></View><Button compact textColor={COLORS.danger} loading={remove.isPending && remove.variables === researcher.id} onPress={() => Alert.alert('Remove researcher?', `Remove ${researcher.name} from this project?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => remove.mutate(researcher.id) }])}>Remove</Button></View></Card.Content></Card>)}
    <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 8 }}>Allocate New Researchers</Text>
    <Field label="Search eligible researchers" value={search} onChangeText={setSearch} autoCapitalize="none" />
    {filtered.length ? filtered.map((researcher) => <Card key={researcher.id} style={[styles.card, selected.includes(researcher.id) ? { borderColor: COLORS.amber } : null]} onPress={() => setSelected((current) => current.includes(researcher.id) ? current.filter((value) => value !== researcher.id) : [...current, researcher.id])}><Card.Content><View style={styles.sectionRow}><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{researcher.name}</Text><Text style={styles.muted}>{researcher.email}</Text></View><Checkbox status={selected.includes(researcher.id) ? 'checked' : 'unchecked'} /></View></Card.Content></Card>) : <Text style={styles.muted}>{search ? 'No matching researchers found.' : 'All registered researchers are already assigned.'}</Text>}
    <Button mode="contained" buttonColor={COLORS.amber} textColor="#0F172A" disabled={!selected.length || assign.isPending} loading={assign.isPending} onPress={() => assign.mutate()}>{selected.length} researcher(s) selected — Assign</Button>
    {(assign.isError || remove.isError) && <Text style={styles.error}>{getErrorMessage(assign.error || remove.error)}</Text>}
  </Screen>;
}
