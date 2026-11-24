import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card } from 'react-native-paper';
import { fundReportsApi } from '../api/client';
import { Detail } from '../components/Detail';
import { ErrorState, Loading, Screen, SectionTitle } from '../components/common';
import { formatCurrency, quarterLabel } from '../utils/format';
export default function FundDetailScreen() {
  const { id } = useLocalSearchParams(); const query = useQuery({ queryKey: ['fund-report', id], queryFn: async () => (await fundReportsApi.get(id)).data.fundReport });
  if (query.isLoading) return <Loading />; if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />; const report = query.data;
  return <Screen><SectionTitle action={<Button compact onPress={() => router.back()}>Back</Button>}>Fund report</SectionTitle><Card><Card.Content><Detail label="Project" value={report.project?.title || report.projectId} /><Detail label="Period" value={quarterLabel(report.quarter, report.year)} /><Detail label="Amount received" value={formatCurrency(report.amountReceived)} /><Detail label="Amount spent" value={formatCurrency(report.amountSpent)} /></Card.Content></Card></Screen>;
}
