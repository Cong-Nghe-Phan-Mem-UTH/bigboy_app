import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { dishService } from '../../services/dishService';
import { useCartStore } from '../../store/cartStore';
import { COLORS } from '../../constants/config';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Ảnh món đúng theo tên (ảnh bạn cung cấp)
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

const getDishImageSource = (dish) => {
  if (dish?.name && DISH_IMAGES[dish.name]) {
    return DISH_IMAGES[dish.name];
  }
  const uri = dish?.image || dish?.image_url;
  return uri ? { uri } : { uri: 'https://via.placeholder.com/400' };
};

export default function DishDetailScreen({ route, navigation }) {
  const { dishId, restaurantId } = route.params;
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const { addItem } = useCartStore();

  useEffect(() => {
    loadDish();
  }, [dishId]);

  const loadDish = async () => {
    try {
      setLoading(true);
      const response = await dishService.getDishById(dishId);
      // Backend returns: { data: { id, name, price, image, ... }, message }
      const dishData = response?.data || response;
      setDish(dishData);
    } catch (error) {
      console.error('Error loading dish:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (dish) {
      for (let i = 0; i < quantity; i++) {
        addItem(dish, 1, notes);
      }
      navigation.goBack();
      // You can add a toast notification here
    }
  };

  const adjustQuantity = (delta) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!dish) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy món ăn</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={getDishImageSource(dish)}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.name}>{dish.name}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {dish.price ? `${dish.price.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
          </Text>
        </View>

        {dish.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.description}>{dish.description}</Text>
          </View>
        )}

        {dish.ingredients && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nguyên liệu</Text>
            <Text style={styles.description}>{dish.ingredients}</Text>
          </View>
        )}

        {dish.allergens && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dị ứng</Text>
            <Text style={styles.description}>{dish.allergens}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Thêm ghi chú cho món này..."
            placeholderTextColor={COLORS.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.quantitySection}>
          <Text style={styles.sectionTitle}>Số lượng</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => adjustQuantity(-1)}
            >
              <Icon name="remove" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => adjustQuantity(1)}
            >
              <Icon name="add" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Icon name="shopping-cart" size={24} color="#fff" />
          <Text style={styles.addToCartText}>
            Thêm vào giỏ - {dish.price ? (dish.price * quantity).toLocaleString('vi-VN') : ''} đ
          </Text>
        </TouchableOpacity>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  priceContainer: {
    marginBottom: 20,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  notesInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  quantitySection: {
    marginBottom: 24,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    minWidth: 40,
    textAlign: 'center',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    gap: 8,
    marginBottom: 20,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

