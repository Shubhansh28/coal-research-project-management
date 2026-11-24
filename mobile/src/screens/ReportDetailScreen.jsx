import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, Card, TextInput } from 'react-native-paper';
import { reportsApi } from '../api/client';
import { Detail } from '../components/Detail';
import { ErrorState, Loading, Screen, SectionTitle, StatusChip, styles } from '../components/common';
import { quarterLabel } from '../utils/format';
import { getErrorMessage } from '../utils/errors';
import { useState } from 'react';
export default function ReportDetailScreen({ admin = false }) {
  const { id } = useLocalSearchParams(); const client = useQueryClient(); const [remarks, setRemarks] = useState(''); const query = useQuery({ queryKey: ['report', id], queryFn: async () => (await reportsApi.get(id)).data.report }); const review = useMutation({ mutationFn: (status) => reportsApi.review(id, { status, remarks }), onSuccess: () => { client.invalidateQueries({ queryKey: ['report', id] }); client.invalidateQueries({ queryKey: ['reports'] }); } });
  if (query.isLoading) return <Loading />; if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />; const report = query.data;
  return <Screen><SectionTitle action={<Button compact onPress={() => router.back()}>Back</Button>}>{report.title}</SectionTitle><View style={styles.sectionRow}><Text style={styles.muted}>{quarterLabel(report.quarter, report.year)}</Text><StatusChip status={report.status} /></View><Card><Card.Content><Detail label="Project" value={report.project?.title || report.projectId} /><Detail label="Progress" value={`${report.progress}%`} /><Detail label="Completed work" value={report.completedWork} /><Detail label="Remarks" value={report.remarks || 'No remarks'} /></Card.Content></Card>{admin && report.status === 'PENDING' && <><SectionTitle>Review report</SectionTitle><TextInput label="Remarks (optional)" value={remarks} onChangeText={setRemarks} mode="outlined" textColor={COLORS.inputText} placeholderTextColor={COLORS.muted} /><View style={{ flexDirection: 'row', gap: 10 }}><Button mode="contained" onPress={() => review.mutate('APPROVED')}>Approve</Button><Button mode="outlined" textColor="#B42318" onPress={() => review.mutate('REJECTED')}>Reject</Button></View>{review.isError && <Text style={styles.error}>{getErrorMessage(review.error)}</Text>}</>}</Screen>;
}
