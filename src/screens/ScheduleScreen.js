import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, Title, Paragraph } from 'react-native-paper';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ScheduleScreen = ({ scheduleData, loading, onRefresh, refreshing }) => {
  const today = format(new Date(), "EEEE, 'ngày' dd/MM/yyyy", { locale: vi });

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Đang tải lịch công tác...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Title style={styles.title}>LỊCH CÔNG TÁC</Title>
        <Text style={styles.dateText}>Hôm nay: {today}</Text>
      </View>

      {scheduleData && scheduleData.length > 0 ? (
        <View style={styles.eventsContainer}>
          {scheduleData.map((event, index) => (
            <Card key={event.id || index} style={styles.eventCard}>
              <Card.Content>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTime}>{event.time}</Text>
                </View>
                <Paragraph style={styles.eventContent}>
                  {event.content}
                </Paragraph>
              </Card.Content>
            </Card>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Không có lịch công tác cho hôm nay
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1976d2',
  },
  dateText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  eventsContainer: {
    padding: 16,
  },
  eventCard: {
    marginBottom: 12,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  eventContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default ScheduleScreen;
