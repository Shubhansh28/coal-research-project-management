import { useMutation, useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { Button, Menu } from 'react-native-paper';
import { fundReportsApi, projectsApi } from '../api/client';
import { Field, Screen, SectionTitle, styles } from '../components/common';
import { getErrorMessage } from '../utils/errors';
export default function FundFormScreen() {
  const { projectId: initialProjectId } = useLocalSearchParams(); const projects = useQuery({ queryKey: ['projects'], queryFn: async () => (await projectsApi.list()).data.projects || [] }); const [projectId, setProjectId] = useState(initialProjectId || ''); const [amountSpent, setAmountSpent] = useState(''); const [amountReceived, setAmountReceived] = useState(''); const [quarter, setQuarter] = useState('1'); const [year, setYear] = useState(String(new Date().getFullYear())); const [menu, setMenu] = useState(false);
  const mutation = useMutation({ mutationFn: () => fundReportsApi.create({ projectId, amountSpent: Number(amountSpent), amountReceived: Number(amountReceived), quarter: Number(quarter), year: Number(year) }), onSuccess: () => router.replace('/(researcher)/funds') }); const valid = projectId && amountSpent !== '' && amountReceived !== '' && Number(amountSpent) >= 0 && Number(amountReceived) >= 0 && Number(quarter) >= 1 && Number(quarter) <= 4 && Number(year) > 0;
  return <Screen><SectionTitle>Submit fund report</SectionTitle><Menu visible={menu} onDismiss={() => setMenu(false)} anchor={<Button mode="outlined" onPress={() => setMenu(true)}>{projects.data?.find((p) => p.id === projectId)?.title || 'Select project'}</Button>}>{projects.data?.map((project) => <Menu.Item key={project.id} title={project.title} onPress={() => { setProjectId(project.id); setMenu(false); }} />)}</Menu><Field label="Amount received" value={amountReceived} onChangeText={setAmountReceived} keyboardType="decimal-pad" /><Field label="Amount spent" value={amountSpent} onChangeText={setAmountSpent} keyboardType="decimal-pad" /><Field label="Quarter (1-4)" value={quarter} onChangeText={setQuarter} keyboardType="number-pad" /><Field label="Year" value={year} onChangeText={setYear} keyboardType="number-pad" /><Button mode="contained" disabled={!valid || mutation.isPending} loading={mutation.isPending} onPress={() => mutation.mutate()}>Submit fund report</Button>{mutation.isError && <Text style={styles.error}>{getErrorMessage(mutation.error, 'Fund report submission failed.')}</Text>}</Screen>;
}
