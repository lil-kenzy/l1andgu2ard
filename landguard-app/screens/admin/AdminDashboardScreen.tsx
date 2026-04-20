import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { connectSocketFromStorage, onNewSubmission, onPropertyStatus, onAdminStatsUpdate, type NewSubmissionPayload, type PropertyStatusPayload } from '../../lib/socket';
import { adminAPI } from '../../lib/api';

type LiveEvent = {
  id:        string;
  message:   string;
  timestamp: Date;
  type:      'submitted' | 'verified' | 'rejected' | 'other';
};

const AdminDashboardScreen: React.FC = ({ navigation }: any) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [pendingCount, setPendingCount] = useState<number>(0);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [newEventBadge, setNewEventBadge] = useState<number>(0);

  const addEvent = useCallback((event: LiveEvent) => {
    setLiveEvents((prev) => [event, ...prev].slice(0, 30)); // keep last 30
    setNewEventBadge((n) => n + 1);
  }, []);

  useEffect(() => {
    // Fetch initial pending count from REST
    adminAPI.getPendingProperties()
      .then((res) => setPendingCount((res.data?.data || []).length))
      .catch(() => {});

    // Connect socket and subscribe to admin events
    let unsubStatus: (() => void) | null     = null;
    let unsubSubmit: (() => void) | null     = null;
    let unsubStats:  (() => void) | null     = null;

    connectSocketFromStorage().then(() => {
      unsubSubmit = onNewSubmission((payload: NewSubmissionPayload) => {
        addEvent({
          id:        payload.propertyId,
          message:   `📋 New submission: ${payload.title || payload.propertyId}`,
          timestamp: new Date(payload.submittedAt),
          type:      'submitted'
        });
        setPendingCount((n) => n + 1);
      });

      unsubStatus = onPropertyStatus((payload: PropertyStatusPayload) => {
        const emoji = payload.status === 'verified' ? '✅' : payload.status === 'rejected' ? '❌' : '🔄';
        addEvent({
          id:        payload.propertyId,
          message:   `${emoji} Property ${payload.status}: ${payload.title || payload.propertyId}`,
          timestamp: new Date(payload.updatedAt),
          type:      payload.status === 'verified' ? 'verified' : payload.status === 'rejected' ? 'rejected' : 'other'
        });
        if (payload.status === 'verified' || payload.status === 'rejected') {
          setPendingCount((n) => Math.max(0, n - 1));
        }
      });

      unsubStats = onAdminStatsUpdate((stats) => {
        if (typeof stats.pendingVerifications === 'number') {
          setPendingCount(stats.pendingVerifications as number);
        }
      });
    });

    return () => {
      unsubStatus?.();
      unsubSubmit?.();
      unsubStats?.();
    };
  }, [addEvent]);

  const clearBadge = () => setNewEventBadge(0);

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Admin Dashboard</Text>

        <StatCard label="Total Users" value="—" isDark={isDark} />
        <StatCard label="Pending Verifications" value={String(pendingCount)} isDark={isDark} />
        <StatCard label="Active Disputes" value="—" isDark={isDark} />
        <StatCard label="Total Transactions" value="—" isDark={isDark} />

        {/* ── Live Activity Feed ──────────────────────────────────────────── */}
        <View style={styles.feedHeader}>
          <Text style={[styles.feedTitle, isDark && styles.feedTitleDark]}>Live Activity</Text>
          {newEventBadge > 0 && (
            <TouchableOpacity style={styles.badge} onPress={clearBadge}>
              <Text style={styles.badgeText}>{newEventBadge} new</Text>
            </TouchableOpacity>
          )}
        </View>

        {liveEvents.length === 0 ? (
          <View style={styles.emptyFeed}>
            <Text style={[styles.emptyFeedText, isDark && styles.emptyFeedTextDark]}>
              🟢 Connected — waiting for events…
            </Text>
          </View>
        ) : (
          liveEvents.map((ev) => (
            <View
              key={`${ev.id}-${ev.timestamp.getTime()}`}
              style={[
                styles.eventRow,
                isDark && styles.eventRowDark,
                ev.type === 'submitted' && styles.eventSubmitted,
                ev.type === 'verified' && styles.eventVerified,
                ev.type === 'rejected' && styles.eventRejected
              ]}
            >
              <Text style={[styles.eventMsg, isDark && styles.eventMsgDark]}>{ev.message}</Text>
              <Text style={styles.eventTime}>
                {ev.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard: React.FC<{ label: string; value: string; isDark: boolean }> = ({
  label,
  value,
  isDark,
}) => (
  <Card>
    <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
    <Text style={[styles.value, isDark && styles.valueDark]}>{value}</Text>
  </Card>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#111827' },
  content: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 16 },
  titleDark: { color: '#f3f4f6' },
  label: { fontSize: 14, color: '#6b7280' },
  labelDark: { color: '#d1d5db' },
  value: { fontSize: 24, fontWeight: '700', color: '#3b82f6', marginTop: 4 },
  valueDark: { color: '#60a5fa' },
  // Feed
  feedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 8 },
  feedTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  feedTitleDark: { color: '#f3f4f6' },
  badge: { backgroundColor: '#ef4444', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  emptyFeed: { paddingVertical: 16, alignItems: 'center' },
  emptyFeedText: { color: '#6b7280', fontSize: 13 },
  emptyFeedTextDark: { color: '#9ca3af' },
  eventRow: { backgroundColor: '#f9fafb', borderRadius: 8, padding: 10, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eventRowDark: { backgroundColor: '#1f2937' },
  eventSubmitted: { borderLeftWidth: 3, borderLeftColor: '#f59e0b' },
  eventVerified:  { borderLeftWidth: 3, borderLeftColor: '#10b981' },
  eventRejected:  { borderLeftWidth: 3, borderLeftColor: '#ef4444' },
  eventMsg: { flex: 1, fontSize: 13, color: '#374151', marginRight: 8 },
  eventMsgDark: { color: '#d1d5db' },
  eventTime: { fontSize: 11, color: '#9ca3af', marginTop: 2 }
});

export default AdminDashboardScreen;
