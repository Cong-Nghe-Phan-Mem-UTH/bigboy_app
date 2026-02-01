import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { restaurantService } from "../../services/restaurantService";
import { COLORS } from "../../constants/config";
import Icon from "react-native-vector-icons/MaterialIcons";

// Ảnh local cho 4 nhà hàng BigBoy
const RESTAURANT_IMAGES = {
  "BigBoy Central": require("../../../assets/bigboy-central.png"),
  "BigBoy Riverside": require("../../../assets/bigboy-riverside.png"),
  "BigBoy Hà Nội": require("../../../assets/bigboy-hanoi.png"),
  "BigBoy Đà Nẵng": require("../../../assets/bigboy-danang.png"),
};

export default function HomeScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const params = searchQuery ? { search: searchQuery } : {};
      const response = await restaurantService.getRestaurants(params);
      // Backend returns: { data: { items: [...], total: N }, message: "..." }
      const restaurants = response?.data?.items || response?.restaurants || response?.data || response || [];
      setRestaurants(restaurants);
    } catch (error) {
      console.error("Error loading restaurants:", error);
      setRestaurants([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRestaurants();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Debounce search
    setTimeout(() => {
      loadRestaurants();
    }, 500);
  };

  const getRestaurantImageSource = (item) => {
    if (RESTAURANT_IMAGES[item.name]) {
      return RESTAURANT_IMAGES[item.name];
    }
    return item.image_url
      ? { uri: item.image_url }
      : require("../../../assets/bigboy-central.png");
  };

  const renderRestaurant = ({ item }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() =>
        navigation.navigate("RestaurantDetail", { restaurantId: item.id })
      }
    >
      <Image
        source={getRestaurantImageSource(item)}
        style={styles.restaurantImage}
        resizeMode="cover"
      />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <View style={styles.restaurantMeta}>
          <Icon name="location-on" size={14} color={COLORS.textSecondary} />
          <Text style={styles.restaurantAddress} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
        <View style={styles.restaurantRating}>
          <Icon name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>
            {item.average_rating ? item.average_rating.toFixed(1) : "N/A"}
          </Text>
          <Text style={styles.reviewCount}>
            ({item.review_count || 0} đánh giá)
          </Text>
        </View>
        {item.cuisine_type && (
          <Text style={styles.cuisineType}>{item.cuisine_type}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nhà hàng</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Recommended")}
          style={styles.recommendedButton}
        >
          <Icon name="recommend" size={20} color={COLORS.primary} />
          <Text style={styles.recommendedText}>Đề xuất</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={20}
          color={COLORS.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm nhà hàng..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Icon name="clear" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={restaurants}
          renderItem={renderRestaurant}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="restaurant" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>Không tìm thấy nhà hàng</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  recommendedButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recommendedText: {
    marginLeft: 6,
    color: COLORS.primary,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    margin: 16,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: COLORS.text,
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  restaurantCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantImage: {
    width: "100%",
    height: 200,
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  restaurantMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  restaurantAddress: {
    marginLeft: 4,
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  restaurantRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  reviewCount: {
    marginLeft: 8,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cuisineType: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
