import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, useWindowDimensions } from 'react-native';
import { Text, Card, ActivityIndicator, Title, Paragraph } from 'react-native-paper';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const BREAKPOINT_MOBILE = 768;

const ScheduleScreen = ({ scheduleData, loading, onRefresh, refreshing }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < BREAKPOINT_MOBILE;
  const today = format(new Date(), "EEEE, 'ngày' dd/MM/yyyy", { locale: vi });

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={[styles.loadingText, isMobile && styles.loadingTextMobile]}>Đang tải lịch công tác...</Text>
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
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <Title style={[styles.title, isMobile && styles.titleMobile]}>LỊCH CÔNG TÁC</Title>
        <Text style={[styles.dateText, isMobile && styles.dateTextMobile]}>Hôm nay: {today}</Text>
      </View>

      {scheduleData && scheduleData.length > 0 ? (
        <View style={[styles.eventsContainer, isMobile && styles.eventsContainerMobile]}>
          {scheduleData.map((event, index) => (
            <Card key={event.id || index} style={[styles.eventCard, isMobile && styles.eventCardMobile]}>
              <Card.Content>
                <View style={styles.eventHeader}>
                  <Text style={[styles.eventTime, isMobile && styles.eventTimeMobile]}>{event.time}</Text>
                </View>
                <Paragraph style={[styles.eventContent, isMobile && styles.eventContentMobile]}>
                  {event.content}
                </Paragraph>
              </Card.Content>
            </Card>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyContainer, isMobile && styles.emptyContainerMobile]}>
          <Text style={[styles.emptyText, isMobile && styles.emptyTextMobile]}>
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
  loadingTextMobile: {
    fontSize: 14,
    marginTop: 12,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerMobile: {
    padding: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1976d2',
  },
  titleMobile: {
    fontSize: 20,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  dateTextMobile: {
    fontSize: 14,
  },
  eventsContainer: {
    padding: 16,
  },
  eventsContainerMobile: {
    padding: 12,
  },
  eventCard: {
    marginBottom: 12,
    elevation: 2,
  },
  eventCardMobile: {
    marginBottom: 8,
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
  eventTimeMobile: {
    fontSize: 16,
  },
  eventContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  eventContentMobile: {
    fontSize: 13,
    lineHeight: 19,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainerMobile: {
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  emptyTextMobile: {
    fontSize: 14,
  },
});

export default ScheduleScreen;
