import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { guestService } from '../../services/guestService';
import { useAuthStore } from '../../store/authStore';
import { COLORS, ORDER_STATUS } from '../../constants/config';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isGuest } = useAuthStore();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      if (isGuest) {
        const data = await guestService.getOrders();
        setOrders(data.orders || data || []);
      } else {
        // For regular customers, you might need a different endpoint
        setOrders([]);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return COLORS.warning;
      case ORDER_STATUS.CONFIRMED:
        return COLORS.info;
      case ORDER_STATUS.PREPARING:
        return COLORS.primary;
      case ORDER_STATUS.READY:
        return COLORS.success;
      case ORDER_STATUS.SERVED:
        return COLORS.success;
      case ORDER_STATUS.CANCELLED:
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      [ORDER_STATUS.PENDING]: 'Chờ xác nhận',
      [ORDER_STATUS.CONFIRMED]: 'Đã xác nhận',
      [ORDER_STATUS.PREPARING]: 'Đang chuẩn bị',
      [ORDER_STATUS.READY]: 'Sẵn sàng',
      [ORDER_STATUS.SERVED]: 'Đã phục vụ',
      [ORDER_STATUS.CANCELLED]: 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Đơn #{item.id}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.created_at).toLocaleString('vi-VN')}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      <View style={styles.orderInfo}>
        <Text style={styles.orderItems}>
          {item.items?.length || 0} món
        </Text>
        <Text style={styles.orderTotal}>
          {item.total ? `${item.total.toLocaleString('vi-VN')} đ` : 'N/A'}
        </Text>
      </View>
      {item.table_number && (
        <View style={styles.tableInfo}>
          <Icon name="table-restaurant" size={16} color={COLORS.textSecondary} />
          <Text style={styles.tableText}>Bàn {item.table_number}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="receipt" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
          </View>
        }
      />
    </View>
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
  list: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderItems: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  tableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  tableText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

