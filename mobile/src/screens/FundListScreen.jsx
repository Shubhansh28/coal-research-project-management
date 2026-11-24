import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { fundReportsApi } from '../api/client';
import { EmptyState, ErrorState, Loading, Screen, SectionTitle, styles } from '../components/common';
import { formatCurrency, quarterLabel } from '../utils/format';
import { COLORS } from '../constants';
import { Field } from '../components/common';
export default function FundListScreen({ admin = false }) {
  const [search, setSearch] = useState('');
  const [quarter, setQuarter] = useState('ALL');
  const query = useQuery({
    queryKey: ['fund-reports', quarter],
    queryFn: async () => (await fundReportsApi.list({ quarter })).data.fundReports || []
  });
  if (query.isLoading) return <Loading />; if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  const filtered = query.data.filter((report) => {
    const q = search.trim().toLowerCase();
    return !q || report.project?.title?.toLowerCase().includes(q) || report.project?.projectCode?.toLowerCase().includes(q);
  });
  const totalReceived = filtered.reduce((sum, report) => sum + (Number(report.amountReceived) || 0), 0);
  const totalSpent = filtered.reduce((sum, report) => sum + (Number(report.amountSpent) || 0), 0);
  return <Screen refreshing={query.isFetching} onRefresh={query.refetch}>
    <SectionTitle action={!admin && <Button compact mode="contained" buttonColor={COLORS.amber} textColor="#0F172A" onPress={() => router.push('/(researcher)/funds/new')}>Submit</Button>}>Fund Utilization & Expenditure</SectionTitle>
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Card style={{ flex: 1 }}><Card.Content><Text style={styles.muted}>Received</Text><Text style={[styles.title, { color: COLORS.amber, fontSize: 18 }]}>{formatCurrency(totalReceived)}</Text></Card.Content></Card>
      <Card style={{ flex: 1 }}><Card.Content><Text style={styles.muted}>Spent</Text><Text style={[styles.title, { color: COLORS.success, fontSize: 18 }]}>{formatCurrency(totalSpent)}</Text></Card.Content></Card>
    </View>
    <Field label="Search project or code" value={search} onChangeText={setSearch} />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {['ALL', '1', '2', '3', '4'].map((value) => <Button key={value} compact mode={quarter === value ? 'contained' : 'outlined'} buttonColor={quarter === value ? COLORS.amber : undefined} textColor={quarter === value ? '#0F172A' : COLORS.muted} onPress={() => setQuarter(value)}>{value === 'ALL' ? 'All quarters' : `Q${value}`}</Button>)}
    </View>
    {filtered.length ? filtered.map((report) => <Card key={report.id} style={styles.card} onPress={() => router.push(`${admin ? '/(admin)' : '/(researcher)'}/funds/${report.id}`)}><Card.Content><Text style={styles.cardTitle}>{report.project?.title || report.projectId}</Text><Text style={styles.muted}>{quarterLabel(report.quarter, report.year)}</Text><View style={{ marginTop: 8 }}><Text style={styles.value}>Received: {formatCurrency(report.amountReceived)}</Text><Text style={styles.value}>Spent: {formatCurrency(report.amountSpent)}</Text></View></Card.Content></Card>) : <EmptyState message="No fund reports match the current filters." />}
  </Screen>;
}
