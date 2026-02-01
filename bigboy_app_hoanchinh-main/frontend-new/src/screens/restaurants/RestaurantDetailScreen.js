import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { restaurantService } from '../../services/restaurantService';
import { COLORS } from '../../constants/config';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Ảnh local cho 4 nhà hàng BigBoy
const RESTAURANT_IMAGES = {
  'BigBoy Central': require('../../../assets/bigboy-central.png'),
  'BigBoy Riverside': require('../../../assets/bigboy-riverside.png'),
  'BigBoy Hà Nội': require('../../../assets/bigboy-hanoi.png'),
  'BigBoy Đà Nẵng': require('../../../assets/bigboy-danang.png'),
};

export default function RestaurantDetailScreen({ route, navigation }) {
  const { restaurantId } = route.params;
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurant();
  }, [restaurantId]);

  const loadRestaurant = async () => {
    try {
      setLoading(true);
      const response = await restaurantService.getRestaurantById(restaurantId);
      // Backend returns: { data: {...}, message: "..." }
      const restaurant = response?.data || response;
      setRestaurant(restaurant);
    } catch (error) {
      if (__DEV__) {
        console.log('Error loading restaurant:', error);
      }
      setRestaurant(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDirections = async () => {
    try {
      const response = await restaurantService.getRestaurantDirections(restaurantId);
      // Backend returns: { data: { directions_url: "...", google_maps_url: "..." }, message: "..." }
      const directions = response?.data || response;
      const url = directions?.google_maps_url || directions?.directions_url || directions?.url;
      if (url) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Lỗi', 'Không thể lấy chỉ đường');
      }
    } catch (error) {
      if (__DEV__) {
        console.log('Error getting directions:', error);
      }
      Alert.alert('Lỗi', 'Không thể mở chỉ đường');
    }
  };

  const handleViewMenu = () => {
    navigation.navigate('Menu', { restaurantId, restaurantName: restaurant?.name });
  };

  const handleViewReviews = () => {
    navigation.navigate('Reviews', { restaurantId });
  };

  const handleReserve = () => {
    navigation.navigate('CreateReservation', { restaurantId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy nhà hàng</Text>
      </View>
    );
  }

  const getRestaurantImageSource = () => {
    if (RESTAURANT_IMAGES[restaurant.name]) {
      return RESTAURANT_IMAGES[restaurant.name];
    }
    return restaurant.image_url
      ? { uri: restaurant.image_url }
      : require('../../../assets/bigboy-central.png');
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={getRestaurantImageSource()}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.name}>{restaurant.name}</Text>

        <View style={styles.ratingContainer}>
          <Icon name="star" size={20} color="#FFD700" />
          <Text style={styles.rating}>
            {restaurant.average_rating ? restaurant.average_rating.toFixed(1) : 'N/A'}
          </Text>
          <Text style={styles.reviewCount}>
            ({restaurant.review_count || 0} đánh giá)
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="location-on" size={20} color={COLORS.primary} />
          <Text style={styles.address}>{restaurant.address}</Text>
        </View>

        {restaurant.phone && (
          <View style={styles.infoRow}>
            <Icon name="phone" size={20} color={COLORS.primary} />
            <Text style={styles.phone}>{restaurant.phone}</Text>
          </View>
        )}

        {restaurant.cuisine_type && (
          <View style={styles.infoRow}>
            <Icon name="restaurant-menu" size={20} color={COLORS.primary} />
            <Text style={styles.cuisine}>{restaurant.cuisine_type}</Text>
          </View>
        )}

        {restaurant.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.description}>{restaurant.description}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleViewMenu}>
            <Icon name="restaurant-menu" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Xem Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleViewReviews}>
            <Icon name="rate-review" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Đánh giá</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleReserve}>
            <Icon name="event" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Đặt bàn</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButtonSecondary} onPress={handleDirections}>
            <Icon name="directions" size={24} color={COLORS.primary} />
            <Text style={styles.actionButtonTextSecondary}>Chỉ đường</Text>
          </TouchableOpacity>
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
    height: 250,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewCount: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  address: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  phone: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.text,
  },
  cuisine: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.text,
  },
  section: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonTextSecondary: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

