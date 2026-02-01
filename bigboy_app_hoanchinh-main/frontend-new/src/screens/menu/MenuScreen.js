import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
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
  // BigBoy Riverside menu (ảnh theo món)
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
  if (item?.name && DISH_IMAGES[item.name]) {
    return DISH_IMAGES[item.name];
  }
  const uri = item?.image || item?.image_url;
  return uri ? { uri } : { uri: 'https://via.placeholder.com/150' };
};

export default function MenuScreen({ route, navigation }) {
  const { restaurantId, restaurantName, tableToken } = route.params || {};
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState(['all']);
  const { addItem, getTotalItems } = useCartStore();

  useEffect(() => {
    loadDishes();
  }, [restaurantId, selectedCategory]);

  const loadDishes = async () => {
    try {
      setLoading(true);
      const params = {
        restaurant_id: restaurantId,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        status: 'available',
      };
      const data = await dishService.getDishes(params);
      // Backend returns: { data: { items: [...], total, page, limit }, message }
      const dishesList = data?.data?.items || data?.dishes || data?.items || data || [];
      setDishes(Array.isArray(dishesList) ? dishesList : []);

      // Extract categories
      const uniqueCategories = ['all', ...new Set(dishesList.map(d => d.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading dishes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDishes();
  };

  const handleAddToCart = (dish) => {
    addItem(dish, 1);
    // Show feedback
    // You can add a toast notification here
  };

  const renderDish = ({ item }) => (
    <TouchableOpacity
      style={styles.dishCard}
      onPress={() => navigation.navigate('DishDetail', { dishId: item.id, restaurantId })}
    >
      <Image
        source={getDishImageSource(item)}
        style={styles.dishImage}
        resizeMode="cover"
      />
      <View style={styles.dishInfo}>
        <Text style={styles.dishName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.dishDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.dishFooter}>
          <Text style={styles.dishPrice}>
            {item.price ? `${item.price.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToCart(item)}
          >
            <Icon name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryChip,
        selectedCategory === category && styles.categoryChipActive,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category && styles.categoryTextActive,
        ]}
      >
        {category === 'all' ? 'Tất cả' : category}
      </Text>
    </TouchableOpacity>
  );

  const cartItemsCount = getTotalItems();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{restaurantName || 'Menu'}</Text>
        {cartItemsCount > 0 && (
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Icon name="shopping-cart" size={24} color="#fff" />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {categories.length > 1 && (
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            renderItem={({ item }) => renderCategory(item)}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
      )}

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={dishes}
          renderItem={renderDish}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="restaurant-menu" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>Không có món ăn</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoriesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.text,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  dishCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dishImage: {
    width: 120,
    height: 120,
  },
  dishInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  dishName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  dishDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  dishFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dishPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

