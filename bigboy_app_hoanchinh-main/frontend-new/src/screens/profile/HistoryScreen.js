import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { historyService } from '../../services/historyService';
import { COLORS } from '../../constants/config';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const [historyResponse, restaurantsResponse] = await Promise.all([
        historyService.getHistory(),
        historyService.getRestaurantHistory(),
      ]);
      
      // Backend /history returns: { data: { summary: {...}, history: [...] }, message: "..." }
      const historyPayload = historyResponse?.data || historyResponse;
      if (historyPayload?.summary) {
        setHistory({
          total_dishes: historyPayload.summary.unique_dishes_tried || 0,
          total_spent: historyPayload.summary.total_spending || 0,
        });
      }
      
      // Backend /history/restaurants returns: { data: [...], message: "..." }
      const restaurants = restaurantsResponse?.data || restaurantsResponse?.restaurants || restaurantsResponse || [];
      setRestaurants(Array.isArray(restaurants) ? restaurants : []);
    } catch (error) {
      if (__DEV__) {
        console.log('Error loading history:', error);
      }
      setHistory(null);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {history && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thống kê</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Icon name="restaurant" size={32} color={COLORS.primary} />
                <Text style={styles.statValue}>
                  {restaurants.length}
                </Text>
                <Text style={styles.statLabel}>Nhà hàng đã ghé</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="restaurant-menu" size={32} color={COLORS.primary} />
                <Text style={styles.statValue}>
                  {history.total_dishes || 0}
                </Text>
                <Text style={styles.statLabel}>Món đã ăn</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="attach-money" size={32} color={COLORS.primary} />
                <Text style={styles.statValue}>
                  {history.total_spent ? `${(history.total_spent / 1000000).toFixed(1)}M` : '0'}
                </Text>
                <Text style={styles.statLabel}>Tổng chi tiêu</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nhà hàng đã ghé</Text>
          {restaurants.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="restaurant" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>Chưa có nhà hàng nào</Text>
            </View>
          ) : (
            restaurants.map((restaurant) => (
              <TouchableOpacity
                key={restaurant.id}
                style={styles.restaurantItem}
                onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: restaurant.id })}
              >
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <Text style={styles.restaurantAddress}>{restaurant.address}</Text>
                  <Text style={styles.visitCount}>
                    Đã ghé {restaurant.visit_count || 0} lần
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  restaurantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  visitCount: {
    fontSize: 12,
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

