import { useMutation, useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { Button, Menu } from 'react-native-paper';
import { projectsApi, reportsApi } from '../api/client';
import { Field, Screen, SectionTitle, styles } from '../components/common';
import { getErrorMessage } from '../utils/errors';

export default function ReportFormScreen() {
  const { projectId: initialProjectId } = useLocalSearchParams(); const projects = useQuery({ queryKey: ['projects'], queryFn: async () => (await projectsApi.list()).data.projects || [] });
  const [projectId, setProjectId] = useState(initialProjectId || ''); const [title, setTitle] = useState(''); const [quarter, setQuarter] = useState('1'); const [year, setYear] = useState(String(new Date().getFullYear())); const [progress, setProgress] = useState('0'); const [completedWork, setCompletedWork] = useState(''); const [menu, setMenu] = useState(false);
  const mutation = useMutation({ mutationFn: () => reportsApi.create({ projectId, title: title.trim(), quarter: Number(quarter), year: Number(year), progress: Number(progress), completedWork: completedWork.trim() }), onSuccess: () => router.replace('/(researcher)/reports') });
  const valid = projectId && title.trim() && completedWork.trim() && Number(quarter) >= 1 && Number(quarter) <= 4 && Number(year) > 0 && Number(progress) >= 0 && Number(progress) <= 100;
  return <Screen><SectionTitle>Submit progress report</SectionTitle><Menu visible={menu} onDismiss={() => setMenu(false)} anchor={<Button mode="outlined" onPress={() => setMenu(true)}>{projects.data?.find((p) => p.id === projectId)?.title || 'Select project'}</Button>}>{projects.data?.map((project) => <Menu.Item key={project.id} title={project.title} onPress={() => { setProjectId(project.id); setMenu(false); }} />)}</Menu><Field label="Report title" value={title} onChangeText={setTitle} /><Field label="Quarter (1-4)" value={quarter} onChangeText={setQuarter} keyboardType="number-pad" /><Field label="Year" value={year} onChangeText={setYear} keyboardType="number-pad" /><Field label="Progress (0-100)" value={progress} onChangeText={setProgress} keyboardType="number-pad" /><Field label="Completed work" value={completedWork} onChangeText={setCompletedWork} multiline numberOfLines={5} /><Button mode="contained" disabled={!valid || mutation.isPending} loading={mutation.isPending} onPress={() => mutation.mutate()}>Submit report</Button>{mutation.isError && <Text style={styles.error}>{getErrorMessage(mutation.error, 'Report submission failed.')}</Text>}</Screen>;
}
