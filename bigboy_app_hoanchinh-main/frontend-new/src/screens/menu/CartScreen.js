import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useCartStore } from '../../store/cartStore';
import { guestService } from '../../services/guestService';
import { COLORS } from '../../constants/config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/config';

// Ảnh món đúng theo tên (giống MenuScreen)
const DISH_IMAGES = {
  'Bò bít tết': require('../../../assets/dish-bo-bit-tet.png'),
  'Bún chả Hà Nội': require('../../../assets/dish-bun-cha.png'),
  'Phở bò đặc biệt': require('../../../assets/dish-pho-bo.png'),
  'Gỏi cuốn tôm thịt': require('../../../assets/dish-goicuon.png'),
  'Cơm chiên dương châu': require('../../../assets/dish-com-chien.png'),
  'Salad gà nướng': require('../../../assets/dish-salad-ga.png'),
  'Nước cam ép': require('../../../assets/dish-nuoc-cam.png'),
  'Trà đá': require('../../../assets/dish-trada.png'),
  'Bánh mì pate': require('../../../assets/dish-banh-mi.png'),
  'Kem dâu': require('../../../assets/dish-kem-dau.png'),
  'Bia Tiger': require('../../../assets/dish-bia-tiger.png'),
  'Pizza Hải Sản': require('../../../assets/dish-pizza-hai-san.png'),
  'Cá Hồi Sốt Chanh Dây': require('../../../assets/dish-ca-hoi-chanh-day.png'),
  'Rượu Vang Đỏ': require('../../../assets/dish-ruou-vang-do.png'),
  'Khoai Tây Đút Lò Hasselback': require('../../../assets/dish-khoai-tay-hasselback.png'),
  'Mì Ý Sốt Cà': require('../../../assets/dish-mi-y-sot-ca.png'),
  'Khoai Tây Nghiền': require('../../../assets/dish-khoai-tay-nghien.png'),
  'Bò Hầm Rau Củ': require('../../../assets/dish-bo-ham-rau-cu.png'),
  'Salad Caesar': require('../../../assets/dish-salad-caesar.png'),
  'Hamburger': require('../../../assets/dish-hamburger.png'),
};

const getDishImageSource = (item) => {
  if (item?.dish_name && DISH_IMAGES[item.dish_name]) {
    return DISH_IMAGES[item.dish_name];
  }
  const uri = item?.dish_image;
  return uri ? { uri } : { uri: 'https://via.placeholder.com/100' };
};

export default function CartScreen({ route, navigation }) {
  const { items, updateQuantity, removeItem, clearCart, getTotal, restaurantId } = useCartStore();
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng thêm món vào giỏ hàng');
      return;
    }

    // Check if guest order
    const tableToken = await AsyncStorage.getItem(STORAGE_KEYS.TABLE_TOKEN);
    const isGuest = !!tableToken;

    if (isGuest && !tableNumber) {
      Alert.alert('Lỗi', 'Vui lòng nhập số bàn');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        orders: items.map(item => ({
          dish_id: item.dish_id,
          quantity: item.quantity,
          notes: item.notes || '',
        })),
        ...(isGuest && { table_number: parseInt(tableNumber) }),
      };

      if (isGuest) {
        await guestService.createOrder(orderData);
      } else {
        // For regular customers, you might need a different endpoint
        // This is a placeholder - adjust based on your API
        Alert.alert('Thông báo', 'Tính năng đặt món cho khách hàng đang được phát triển');
        return;
      }

      Alert.alert('Thành công', 'Đơn hàng đã được đặt thành công', [
        {
          text: 'OK',
          onPress: () => {
            clearCart();
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể đặt món. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={getDishImageSource(item)}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.dish_name}</Text>
        {item.notes && (
          <Text style={styles.itemNotes}>Ghi chú: {item.notes}</Text>
        )}
        <View style={styles.itemFooter}>
          <Text style={styles.itemPrice}>
            {(item.dish_price * item.quantity).toLocaleString('vi-VN')} đ
          </Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.dish_id, item.quantity - 1, item.notes)}
            >
              <Icon name="remove" size={18} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.dish_id, item.quantity + 1, item.notes)}
            >
              <Icon name="add" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeItem(item.dish_id, item.notes)}
      >
        <Icon name="close" size={20} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  const total = getTotal();
  const tableToken = route.params?.tableToken;

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="shopping-cart" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>Giỏ hàng trống</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.browseButtonText}>Xem menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.dish_id}-${item.notes}-${index}`}
            contentContainerStyle={styles.list}
          />
          <View style={styles.footer}>
            {tableToken && (
              <View style={styles.tableInputContainer}>
                <Text style={styles.tableLabel}>Số bàn:</Text>
                <TextInput
                  style={styles.tableInput}
                  placeholder="Nhập số bàn"
                  placeholderTextColor={COLORS.textSecondary}
                  value={tableNumber}
                  onChangeText={setTableNumber}
                  keyboardType="number-pad"
                />
              </View>
            )}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalAmount}>
                {total.toLocaleString('vi-VN')} đ
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]}
              onPress={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="check-circle" size={24} color="#fff" />
                  <Text style={styles.checkoutButtonText}>Đặt món</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemNotes: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
    justifyContent: 'center',
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
  },
  tableInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  tableLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  tableInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    gap: 8,
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  browseButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

