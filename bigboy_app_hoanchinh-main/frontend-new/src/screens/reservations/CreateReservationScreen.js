import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { reservationService } from '../../services/reservationService';
import { restaurantService } from '../../services/restaurantService';
import { COLORS } from '../../constants/config';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function CreateReservationScreen({ route, navigation }) {
  const { restaurantId: initialRestaurantId, reservation } = route.params || {};
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(initialRestaurantId || reservation?.restaurant_id || null);
  const [restaurants, setRestaurants] = useState([]);
  const [showRestaurantPicker, setShowRestaurantPicker] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [date, setDate] = useState(reservation ? new Date(reservation.date) : new Date());
  const [time, setTime] = useState(reservation?.time || '19:00');
  const [guests, setGuests] = useState(reservation?.guests?.toString() || '2');
  const [tableNumber, setTableNumber] = useState(reservation?.table_number?.toString() || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load restaurants if not provided via route params
    if (!initialRestaurantId && !reservation?.restaurant_id) {
      loadRestaurants();
    }
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoadingRestaurants(true);
      const response = await restaurantService.getRestaurants();
      const items = response?.data?.items || response?.restaurants || response?.data || response || [];
      setRestaurants(items);
    } catch (error) {
      console.error('Error loading restaurants:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách nhà hàng');
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const selectedRestaurant = restaurants.find(r => r.id === selectedRestaurantId);

  const handleSubmit = async () => {
    const finalRestaurantId = selectedRestaurantId || initialRestaurantId || reservation?.restaurant_id;
    
    if (!finalRestaurantId) {
      Alert.alert('Lỗi', 'Vui lòng chọn nhà hàng');
      return;
    }

    if (!guests || parseInt(guests) < 1) {
      Alert.alert('Lỗi', 'Vui lòng nhập số người');
      return;
    }

    setLoading(true);
    try {
      // Format date as YYYY-MM-DD
      const dateStr = date.toISOString().split('T')[0];
      
      const data = {
        date: dateStr,
        time,
        guests: parseInt(guests),
        ...(tableNumber && { table_number: parseInt(tableNumber) }),
      };
      
      if (__DEV__) {
        console.log('[CreateReservation] Submitting:', { restaurantId: finalRestaurantId, data });
      }

      if (reservation) {
        await reservationService.updateReservation(reservation.id, data);
        Alert.alert('Thành công', 'Đặt bàn đã được cập nhật', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const result = await reservationService.createReservation(finalRestaurantId, data);
        Alert.alert('Thành công', result?.message || 'Đặt bàn đã được tạo', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      if (__DEV__) {
        console.log('Error creating reservation:', error);
      }
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.detail 
        || error.message 
        || 'Không thể đặt bàn';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const adjustGuests = (delta) => {
    const newValue = Math.max(1, parseInt(guests || 1) + delta);
    setGuests(newValue.toString());
  };

  const renderRestaurantItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.restaurantItem,
        selectedRestaurantId === item.id && styles.restaurantItemSelected,
      ]}
      onPress={() => {
        setSelectedRestaurantId(item.id);
        setShowRestaurantPicker(false);
      }}
    >
      <View style={styles.restaurantItemContent}>
        <Text style={styles.restaurantItemName}>{item.name}</Text>
        {item.address && (
          <Text style={styles.restaurantItemAddress} numberOfLines={1}>
            {item.address}
          </Text>
        )}
      </View>
      {selectedRestaurantId === item.id && (
        <Icon name="check-circle" size={24} color={COLORS.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Restaurant Selection - Only show if not provided via route */}
        {(!initialRestaurantId && !reservation?.restaurant_id) && (
          <View style={styles.section}>
            <Text style={styles.label}>Chọn nhà hàng *</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowRestaurantPicker(true)}
              disabled={loadingRestaurants}
            >
              <Icon name="restaurant" size={20} color={COLORS.primary} />
              <Text style={[styles.inputText, !selectedRestaurantId && styles.placeholderText]}>
                {selectedRestaurant
                  ? selectedRestaurant.name
                  : loadingRestaurants
                  ? 'Đang tải...'
                  : 'Chọn nhà hàng'}
              </Text>
              <Icon name="arrow-drop-down" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Ngày</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar-today" size={20} color={COLORS.primary} />
            <Text style={styles.inputText}>
              {date.toLocaleDateString('vi-VN')}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Giờ</Text>
          <TextInput
            style={styles.input}
            placeholder="HH:MM (ví dụ: 19:00)"
            placeholderTextColor={COLORS.textSecondary}
            value={time}
            onChangeText={setTime}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Số người</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => adjustGuests(-1)}
            >
              <Icon name="remove" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              value={guests}
              onChangeText={setGuests}
              keyboardType="number-pad"
              textAlign="center"
            />
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => adjustGuests(1)}
            >
              <Icon name="add" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Số bàn (tùy chọn)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số bàn mong muốn"
            placeholderTextColor={COLORS.textSecondary}
            value={tableNumber}
            onChangeText={setTableNumber}
            keyboardType="number-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {reservation ? 'Cập nhật đặt bàn' : 'Đặt bàn'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Restaurant Picker Modal */}
      <Modal
        visible={showRestaurantPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRestaurantPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn nhà hàng</Text>
              <TouchableOpacity
                onPress={() => setShowRestaurantPicker(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            {loadingRestaurants ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.modalLoadingText}>Đang tải danh sách nhà hàng...</Text>
              </View>
            ) : restaurants.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Icon name="restaurant" size={64} color={COLORS.textSecondary} />
                <Text style={styles.modalEmptyText}>Không có nhà hàng nào</Text>
              </View>
            ) : (
              <FlatList
                data={restaurants}
                renderItem={renderRestaurantItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.restaurantList}
              />
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  inputText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    minWidth: 60,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  // Restaurant Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalLoading: {
    padding: 40,
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
  },
  modalEmpty: {
    padding: 40,
    alignItems: 'center',
  },
  modalEmptyText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  restaurantList: {
    maxHeight: 400,
  },
  restaurantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  restaurantItemSelected: {
    backgroundColor: COLORS.surface,
  },
  restaurantItemContent: {
    flex: 1,
    marginRight: 12,
  },
  restaurantItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  restaurantItemAddress: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

