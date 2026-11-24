import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Text, useWindowDimensions, View } from 'react-native';
import { Card, ProgressBar } from 'react-native-paper';
import { dashboardApi } from '../api/client';
import { ProjectCard, Screen, SectionTitle, StatusChip, Loading, ErrorState, styles } from '../components/common';
import { formatCurrency, formatDate } from '../utils/format';
import { COLORS } from '../constants';

export default function DashboardScreen({ admin = false }) {
  const { width } = useWindowDimensions();
  const compact = width < 520;
  const cardWidth = width >= 900 ? '23%' : width >= 520 ? '48%' : '48%';
  const query = useQuery({ queryKey: ['dashboard', admin ? 'admin' : 'researcher'], queryFn: async () => (await (admin ? dashboardApi.admin() : dashboardApi.researcher())).data.dashboard });
  if (query.isLoading) return <Loading />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  const data = query.data || {};
  const projects = data.projects || [];
  const latestProgress = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + (project.latestReport?.progress || 0), 0) / projects.length)
    : 0;
  return <Screen refreshing={query.isFetching} onRefresh={query.refetch}>
    <View style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 12 }}>
      <Text style={{ color: COLORS.amber, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4 }}>MINISTRY OF COAL • S&T WING</Text>
      <Text style={styles.title}>{admin ? 'Administrative Cockpit' : 'Researcher Portal & Workspace'}</Text>
      <Text style={styles.muted}>{admin ? 'Real-time R&D surveillance and fiscal monitoring.' : 'Monitor assigned initiatives and quarterly deliverables.'}</Text>
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {[
        { label: admin ? 'Total portfolio' : 'Assigned projects', value: data.totalProjects ?? projects.length, accent: COLORS.cyan },
        ...(admin ? [{ label: 'Pending reviews', value: data.pendingReportReviews ?? 0, accent: COLORS.amber }] : [
          { label: 'Progress average', value: `${latestProgress}%`, accent: COLORS.success },
          { label: 'Active status', value: projects.filter((p) => p.status === 'APPROVED').length, accent: COLORS.amber }
        ])
      ].map((metric) => <Card key={metric.label} style={{ width: cardWidth, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }}><Card.Content style={{ paddingHorizontal: compact ? 10 : 14, paddingVertical: 12 }}>
        <Text numberOfLines={1} style={{ color: COLORS.muted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>{metric.label}</Text>
        <Text style={{ color: metric.accent, fontSize: compact ? 24 : 28, fontWeight: '800', marginTop: 6 }}>{metric.value}</Text>
      </Card.Content></Card>)}
    </View>
    {admin && <Card style={styles.card}><Card.Content>
      <SectionTitle>Financial overview</SectionTitle>
      <Text style={styles.value}>Sanctioned budget  <Text style={{ color: COLORS.success, fontWeight: '700' }}>{formatCurrency(data.financialSummary?.totalBudget)}</Text></Text>
      <Text style={styles.value}>Received grants  <Text style={{ color: COLORS.amber, fontWeight: '700' }}>{formatCurrency(data.financialSummary?.totalAmountReceived)}</Text></Text>
      <Text style={styles.value}>Amount utilized  <Text style={{ color: COLORS.cyan, fontWeight: '700' }}>{formatCurrency(data.financialSummary?.totalAmountSpent)}</Text></Text>
    </Card.Content></Card>}
    <SectionTitle action={<Text style={{ color: COLORS.amber, fontWeight: '700' }} onPress={() => router.push(admin ? '/(admin)/projects' : '/(researcher)/projects')}>View directory</Text>}>Projects</SectionTitle>
    {projects.length === 0 ? <Text style={styles.muted}>No projects are available.</Text> : projects.map((project) => <Card key={project.id} style={styles.card}><Card.Content>
      <View style={styles.sectionRow}><View style={{ flex: 1, paddingRight: 8 }}><Text style={styles.cardTitle}>{project.title}</Text><Text style={styles.muted}>{project.projectCode}</Text></View><StatusChip status={project.status} /></View>
      {admin && <Text style={styles.value}>Budget: {formatCurrency(project.budget)}</Text>}
      {!admin && <Text style={styles.muted}>Duration: {formatDate(project.startDate)} — {formatDate(project.endDate)}</Text>}
      {project.latestReport && <><Text style={[styles.muted, { marginTop: 10 }]}>Latest report · Q{project.latestReport.quarter} {project.latestReport.year}</Text><ProgressBar progress={(project.latestReport.progress || 0) / 100} color={COLORS.success} style={{ marginTop: 8, height: 7, borderRadius: 4 }} /></>}
      <Text style={{ color: COLORS.amber, marginTop: 12, fontWeight: '700', textAlign: 'right' }} onPress={() => router.push(`${admin ? '/(admin)' : '/(researcher)'}/projects/${project.id}`)}>Open details →</Text>
    </Card.Content></Card>)}
  </Screen>;
}
