import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { Alert, Text, View } from 'react-native';
import { Button, Card, Dialog, Portal, TextInput } from 'react-native-paper';
import { documentsApi, projectsApi } from '../api/client';
import { Detail } from '../components/Detail';
import { EmptyState, ErrorState, Loading, Screen, SectionTitle, StatusChip, styles } from '../components/common';
import { formatCurrency, formatDate } from '../utils/format';
import { getErrorMessage } from '../utils/errors';
import { useState } from 'react';
import { COLORS } from '../constants';

export default function ProjectDetailScreen({ admin = false }) {
  const { id } = useLocalSearchParams(); const client = useQueryClient(); const [showDoc, setShowDoc] = useState(false); const [docName, setDocName] = useState(''); const [docUrl, setDocUrl] = useState('');
  const project = useQuery({ queryKey: ['project', id], queryFn: async () => (await projectsApi.get(id)).data.project });
  const docs = useQuery({ queryKey: ['documents', id], queryFn: async () => (await documentsApi.list(id)).data.documents || [] });
  const status = useMutation({ mutationFn: (next) => projectsApi.status(id, next), onSuccess: () => { client.invalidateQueries({ queryKey: ['project', id] }); client.invalidateQueries({ queryKey: ['projects'] }); } });
  const addDocument = useMutation({ mutationFn: () => documentsApi.create(id, { name: docName.trim(), fileUrl: docUrl.trim() }), onSuccess: () => { setShowDoc(false); setDocName(''); setDocUrl(''); client.invalidateQueries({ queryKey: ['documents', id] }); } });
  const removeDocument = useMutation({ mutationFn: documentsApi.remove, onSuccess: () => client.invalidateQueries({ queryKey: ['documents', id] }) });
  if (project.isLoading) return <Loading />; if (project.isError) return <ErrorState error={project.error} onRetry={project.refetch} />; const item = project.data;
  const transitions = {
    PENDING: ['APPROVED', 'REJECTED'],
    APPROVED: ['COMPLETED'],
    REJECTED: ['PENDING'],
    COMPLETED: []
  };
  const nextStatuses = transitions[item.status] || [];
  return <Screen refreshing={project.isFetching || docs.isFetching} onRefresh={() => { project.refetch(); docs.refetch(); }}>
    <SectionTitle action={<Button compact onPress={() => router.back()}>Back</Button>}>{item.title}</SectionTitle>
    <View style={styles.sectionRow}><Text style={styles.muted}>{item.projectCode}</Text><StatusChip status={item.status} /></View>
    <Card style={styles.card}><Card.Content>
      <Detail label="Description" value={item.description || 'No description'} />
      <Detail label="Funding" value={`${item.fundingType === 'ST' ? 'S&T (Science & Technology)' : 'R&D (Research & Development)'} · ${formatCurrency(item.budget)}`} />
      <Detail label="Timeline" value={`${formatDate(item.startDate)} - ${formatDate(item.endDate)}`} />
    </Card.Content></Card>
    {admin && <>
      <SectionTitle>Project status</SectionTitle>
      {nextStatuses.length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{nextStatuses.map((value) => <Button key={value} mode="outlined" compact loading={status.isPending && status.variables === value} onPress={() => status.mutate(value)}>Mark {value}</Button>)}</View> : <Text style={styles.muted}>No status transitions available.</Text>}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Button mode="outlined" onPress={() => router.push(`/(admin)/projects/${id}/edit`)}>Edit project details</Button>
        <Button mode="outlined" textColor={COLORS.cyan} onPress={() => router.push(`/(admin)/projects/${id}/assign`)}>Manage researchers</Button>
      </View>
    </>}
    {!admin && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><Button mode="contained" buttonColor={COLORS.amber} textColor="#0F172A" onPress={() => router.push(`/(researcher)/reports/new?projectId=${id}`)}>Progress report</Button><Button mode="outlined" onPress={() => router.push(`/(researcher)/funds/new?projectId=${id}`)}>Fund report</Button></View>}
    <SectionTitle action={admin && <Button compact mode="contained" buttonColor={COLORS.amber} textColor="#0F172A" onPress={() => setShowDoc(true)}>Add link</Button>}>Documents</SectionTitle>
    {docs.isLoading ? <Loading /> : docs.data?.length ? docs.data.map((doc) => <Card key={doc.id} style={styles.card}><Card.Content><View style={styles.sectionRow}><View style={{ flex: 1, paddingRight: 8 }}><Text style={styles.cardTitle}>{doc.name}</Text><Text style={styles.muted} numberOfLines={1}>{doc.fileUrl}</Text></View><View style={{ alignItems: 'flex-end' }}><Button compact onPress={() => Linking.openURL(doc.fileUrl).catch(() => Alert.alert('Unable to open', 'This document URL could not be opened.'))}>Open</Button>{admin && <Button compact textColor={COLORS.danger} onPress={() => Alert.alert('Delete document?', 'This cannot be undone.', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => removeDocument.mutate(doc.id) }])}>Delete</Button>}</View></View></Card.Content></Card>) : <EmptyState message="No documents linked to this project." />}
    <Portal><Dialog visible={showDoc} onDismiss={() => setShowDoc(false)}><Dialog.Title>Add document link</Dialog.Title><Dialog.Content><TextInput label="Name" value={docName} onChangeText={setDocName} mode="outlined" textColor={COLORS.inputText} placeholderTextColor={COLORS.muted} style={{ marginBottom: 10 }} /><TextInput label="Hosted URL" value={docUrl} onChangeText={setDocUrl} mode="outlined" textColor={COLORS.inputText} placeholderTextColor={COLORS.muted} autoCapitalize="none" /></Dialog.Content><Dialog.Actions><Button onPress={() => setShowDoc(false)}>Cancel</Button><Button disabled={!docName.trim() || !docUrl.trim() || addDocument.isPending} onPress={() => addDocument.mutate()}>Add</Button></Dialog.Actions></Dialog></Portal>
    {addDocument.isError && <Text style={styles.error}>{getErrorMessage(addDocument.error)}</Text>}
  </Screen>;
}
