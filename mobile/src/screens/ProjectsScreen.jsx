import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState, useMemo } from 'react';
import { Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { projectsApi } from '../api/client';
import { EmptyState, ErrorState, Loading, ProjectCard, Screen, SectionTitle, styles } from '../components/common';
import { COLORS } from '../constants';
import { Field } from '../components/common';

export default function ProjectsScreen({ admin = false }) {
  const [search, setSearch] = useState('');
  const [funding, setFunding] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const query = useQuery({ queryKey: ['projects'], queryFn: async () => (await projectsApi.list()).data.projects || [] });
  if (query.isLoading) return <Loading />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  const filtered = query.data.filter((project) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || project.title?.toLowerCase().includes(q) || project.projectCode?.toLowerCase().includes(q);
    return matchesSearch && (funding === 'ALL' || project.fundingType === funding) && (status === 'ALL' || project.status === status);
  });
  return <Screen refreshing={query.isFetching} onRefresh={query.refetch}>
    <SectionTitle action={admin && <Button compact mode="contained" buttonColor={COLORS.amber} textColor="#0F172A" onPress={() => router.push('/(admin)/projects/new')}>New project</Button>}>Projects Directory</SectionTitle>
    <Text style={styles.muted}>Centrally monitor S&T and R&D projects.</Text>
    <Field label="Search title or project code" value={search} onChangeText={setSearch} autoCapitalize="none" />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {['ALL', 'ST', 'RD'].map((value) => <Button key={value} compact mode={funding === value ? 'contained' : 'outlined'} buttonColor={funding === value ? COLORS.amber : undefined} textColor={funding === value ? '#0F172A' : COLORS.muted} onPress={() => setFunding(value)}>{value === 'ALL' ? 'All funding' : value}</Button>)}
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].map((value) => <Button key={value} compact mode={status === value ? 'contained' : 'outlined'} buttonColor={status === value ? COLORS.amber : undefined} textColor={status === value ? '#0F172A' : COLORS.muted} onPress={() => setStatus(value)}>{value === 'ALL' ? 'All status' : value}</Button>)}
    </View>
    {filtered.length === 0 ? <EmptyState message="No projects match the current filters." /> : filtered.map((project) => <ProjectCard key={project.id} project={project} onPress={() => router.push(`${admin ? '/(admin)' : '/(researcher)'}/projects/${project.id}`)} />)}
  </Screen>;
}
