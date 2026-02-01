import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { reviewService } from '../../services/reviewService';
import { COLORS } from '../../constants/config';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function CreateReviewScreen({ route, navigation }) {
  const { restaurantId, review } = route.params || {};
  const [rating, setRating] = useState(review?.rating || 0);
  const [comment, setComment] = useState(review?.comment || '');
  const [dishRatings, setDishRatings] = useState(review?.dish_ratings || {});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn điểm đánh giá');
      return;
    }

    setLoading(true);
    try {
      const data = {
        rating,
        comment: comment || undefined,
        dish_ratings: Object.keys(dishRatings).length > 0 ? dishRatings : undefined,
      };

      if (review) {
        await reviewService.updateReview(review.id, data);
        Alert.alert('Thành công', 'Đánh giá đã được cập nhật', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await reviewService.createReview(restaurantId, data);
        Alert.alert('Thành công', 'Đánh giá đã được gửi', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!review) return;

    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa đánh giá này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await reviewService.deleteReview(review.id);
            Alert.alert('Thành công', 'Đánh giá đã được xóa', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa đánh giá');
          }
        },
      },
    ]);
  };

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => setRating(index + 1)}
        style={styles.starButton}
      >
        <Icon
          name={index < rating ? 'star' : 'star-border'}
          size={40}
          color="#FFD700"
        />
      </TouchableOpacity>
    ));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá tổng thể</Text>
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
          <Text style={styles.ratingText}>
            {rating > 0 ? `${rating} / 5 sao` : 'Chọn số sao'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nhận xét</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Chia sẻ trải nghiệm của bạn..."
            placeholderTextColor={COLORS.textSecondary}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {review ? 'Cập nhật' : 'Gửi đánh giá'}
              </Text>
            )}
          </TouchableOpacity>

          {review && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Icon name="delete" size={20} color={COLORS.error} />
              <Text style={styles.deleteButtonText}>Xóa đánh giá</Text>
            </TouchableOpacity>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  starButton: {
    marginHorizontal: 4,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  commentInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 120,
  },
  actions: {
    gap: 12,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: COLORS.error,
    padding: 16,
    borderRadius: 10,
    gap: 8,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

