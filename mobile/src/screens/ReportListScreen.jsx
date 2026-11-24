import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { reportsApi } from '../api/client';
import { EmptyState, ErrorState, Loading, Screen, SectionTitle, StatusChip, styles } from '../components/common';
import { quarterLabel } from '../utils/format';
import { COLORS } from '../constants';
import { Field } from '../components/common';
export default function ReportListScreen({ admin = false }) {
  const [search, setSearch] = useState('');
  const [quarter, setQuarter] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const year = 'ALL';
  const query = useQuery({
    queryKey: ['reports', quarter, year],
    queryFn: async () => (await reportsApi.list({ quarter, year })).data.reports || []
  });
  if (query.isLoading) return <Loading />; if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  const filtered = query.data.filter((report) => {
    const matchesStatus = status === 'ALL' || report.status === status;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || report.title?.toLowerCase().includes(q) || report.project?.title?.toLowerCase().includes(q) || report.project?.projectCode?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });
  return <Screen refreshing={query.isFetching} onRefresh={query.refetch}>
    <SectionTitle action={!admin && <Button compact mode="contained" buttonColor={COLORS.amber} textColor="#0F172A" onPress={() => router.push('/(researcher)/reports/new')}>Submit</Button>}>Quarterly Progress Reports</SectionTitle>
    <Field label="Search title or project" value={search} onChangeText={setSearch} />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {['ALL', '1', '2', '3', '4'].map((value) => <Button key={value} compact mode={quarter === value ? 'contained' : 'outlined'} buttonColor={quarter === value ? COLORS.amber : undefined} textColor={quarter === value ? '#0F172A' : COLORS.muted} onPress={() => setQuarter(value)}>{value === 'ALL' ? 'All quarters' : `Q${value}`}</Button>)}
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((value) => <Button key={value} compact mode={status === value ? 'contained' : 'outlined'} buttonColor={status === value ? COLORS.amber : undefined} textColor={status === value ? '#0F172A' : COLORS.muted} onPress={() => setStatus(value)}>{value === 'ALL' ? 'All status' : value}</Button>)}
    </View>
    {filtered.length ? filtered.map((report) => <Card key={report.id} style={styles.card} onPress={() => router.push(`${admin ? '/(admin)' : '/(researcher)'}/reports/${report.id}`)}><Card.Content><View style={styles.sectionRow}><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{report.title}</Text><Text style={styles.muted}>{quarterLabel(report.quarter, report.year)} · {report.project?.title || 'Project'}</Text></View><StatusChip status={report.status} /></View><Text style={styles.value}>Progress: {report.progress}%</Text></Card.Content></Card>) : <EmptyState message="No progress reports match the current filters." />}
  </Screen>;
}
