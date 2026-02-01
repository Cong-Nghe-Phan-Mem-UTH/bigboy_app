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
import { reviewService } from '../../services/reviewService';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../constants/config';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ReviewsScreen({ route, navigation }) {
  const { restaurantId } = route.params || {};
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (restaurantId) {
      loadReviews();
    }
  }, [restaurantId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getRestaurantReviews(restaurantId);
      // Backend returns: { data: { items: [...] }, message: "..." } or { data: [...], message: "..." }
      const reviews = response?.data?.items || response?.data || response?.reviews || response || [];
      setReviews(Array.isArray(reviews) ? reviews : []);
    } catch (error) {
      if (__DEV__) {
        console.log('Error loading reviews:', error);
      }
      setReviews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadReviews();
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Icon
        key={index}
        name={index < rating ? 'star' : 'star-border'}
        size={16}
        color="#FFD700"
      />
    ));
  };

  const renderReview = ({ item }) => {
    const isOwnReview = isAuthenticated && user && item.customer_id === user.id;

    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.customer_name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View>
              <Text style={styles.reviewerName}>{item.customer_name || 'Khách'}</Text>
              <Text style={styles.reviewDate}>
                {new Date(item.created_at).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          </View>
          {isOwnReview && (
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateReview', { restaurantId, review: item })}
              >
                <Icon name="edit" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={styles.ratingContainer}>
          {renderStars(item.rating)}
        </View>
        {item.comment && (
          <Text style={styles.comment}>{item.comment}</Text>
        )}
        {item.dish_ratings && Object.keys(item.dish_ratings).length > 0 && (
          <View style={styles.dishRatings}>
            <Text style={styles.dishRatingsTitle}>Đánh giá món:</Text>
            {Object.entries(item.dish_ratings).map(([dishName, rating]) => (
              <View key={dishName} style={styles.dishRatingItem}>
                <Text style={styles.dishName}>{dishName}:</Text>
                <View style={styles.dishRatingStars}>
                  {renderStars(rating)}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isAuthenticated && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateReview', { restaurantId })}
        >
          <Icon name="add-circle" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Viết đánh giá</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="rate-review" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    margin: 16,
    borderRadius: 10,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  reviewCard: {
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
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  comment: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  dishRatings: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dishRatingsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  dishRatingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dishName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 8,
    flex: 1,
  },
  dishRatingStars: {
    flexDirection: 'row',
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

