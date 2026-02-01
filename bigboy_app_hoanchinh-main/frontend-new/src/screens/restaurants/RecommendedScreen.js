import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { restaurantService } from "../../services/restaurantService";
import { COLORS, RECOMMENDATION_PREFERENCES } from "../../constants/config";
import Icon from "react-native-vector-icons/MaterialIcons";

const RESTAURANT_IMAGES = {
  "BigBoy Central": require("../../../assets/bigboy-central.png"),
  "BigBoy Riverside": require("../../../assets/bigboy-riverside.png"),
  "BigBoy Hà Nội": require("../../../assets/bigboy-hanoi.png"),
  "BigBoy Đà Nẵng": require("../../../assets/bigboy-danang.png"),
};

// Build flat list of all options with category ref for scoring
function collectKeywords(selectedOptionIds) {
  const set = new Set(selectedOptionIds);
  const keywords = [];
  RECOMMENDATION_PREFERENCES.forEach((cat) => {
    cat.options.forEach((opt) => {
      if (set.has(opt.id)) opt.keywords.forEach((k) => keywords.push(k.toLowerCase()));
    });
  });
  return keywords;
}

function scoreRestaurant(restaurant, keywords) {
  if (!keywords.length) return { score: 0, matched: [] };
  const text = [
    restaurant.name || "",
    restaurant.description || "",
    restaurant.address || "",
  ]
    .join(" ")
    .toLowerCase();
  const matched = [];
  keywords.forEach((kw) => {
    if (text.includes(kw)) matched.push(kw);
  });
  return { score: matched.length, matched };
}

function getRecommendations(restaurants, selectedOptionIds) {
  const keywords = collectKeywords(selectedOptionIds);
  const scored = restaurants.map((r) => {
    const { score, matched } = scoreRestaurant(r, keywords);
    return { ...r, _score: score, _matched: matched };
  });
  scored.sort((a, b) => {
    if (b._score !== a._score) return b._score - a._score;
    return (b.average_rating || 0) - (a.average_rating || 0);
  });
  const withMatch = scored.filter((r) => r._score > 0);
  if (withMatch.length > 0) return withMatch;
  return scored.slice(0, 10);
}

export default function RecommendedScreen({ navigation }) {
  const [step, setStep] = useState("preferences");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [restaurants, setRestaurants] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleOption = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSeeRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const list = await restaurantService.getAllRestaurants();
      setRestaurants(list);
      const recs = getRecommendations(list, Array.from(selectedIds));
      setResults(recs);
      setStep("results");
    } catch (e) {
      if (__DEV__) console.log("Recommendation error:", e);
      setResults([]);
      setStep("results");
    } finally {
      setLoading(false);
    }
  }, [selectedIds]);

  const handleBackToPreferences = useCallback(() => {
    setStep("preferences");
    setResults([]);
  }, []);

  const getRestaurantImageSource = (item) => {
    if (RESTAURANT_IMAGES[item.name]) return RESTAURANT_IMAGES[item.name];
    return item.image_url
      ? { uri: item.image_url }
      : require("../../../assets/bigboy-central.png");
  };

  const renderPreferenceSection = ({ item: category }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{category.title}</Text>
      <View style={styles.chipRow}>
        {category.options.map((opt) => {
          const isSelected = selectedIds.has(opt.id);
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => toggleOption(opt.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderResultCard = ({ item }) => {
    const reason =
      item._matched && item._matched.length
        ? `Phù hợp: ${item._matched.slice(0, 3).join(", ")}`
        : "Đề xuất theo đánh giá";
    return (
      <TouchableOpacity
        style={styles.restaurantCard}
        onPress={() => navigation.navigate("RestaurantDetail", { restaurantId: item.id })}
        activeOpacity={0.8}
      >
        <Image
          source={getRestaurantImageSource(item)}
          style={styles.restaurantImage}
          resizeMode="cover"
        />
        <View style={styles.badge}>
          <Icon name="auto-awesome" size={16} color="#fff" />
          <Text style={styles.badgeText}>Phù hợp với bạn</Text>
        </View>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          <Text style={styles.matchReason} numberOfLines={2}>
            {reason}
          </Text>
          <View style={styles.restaurantMeta}>
            <Icon name="location-on" size={14} color={COLORS.textSecondary} />
            <Text style={styles.restaurantAddress} numberOfLines={1}>
              {item.address}
            </Text>
          </View>
          <View style={styles.restaurantRating}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>
              {item.average_rating != null ? Number(item.average_rating).toFixed(1) : "N/A"}
            </Text>
            <Text style={styles.reviewCount}>({item.review_count || 0} đánh giá)</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (step === "preferences") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Icon name="psychology" size={48} color={COLORS.primary} />
            <Text style={styles.heroTitle}>Đề xuất theo sở thích</Text>
            <Text style={styles.heroSubtitle}>
              Chọn những gì bạn thích, chúng tôi sẽ gợi ý nhà hàng phù hợp nhất.
            </Text>
          </View>
          <FlatList
            data={RECOMMENDATION_PREFERENCES}
            renderItem={renderPreferenceSection}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
          <TouchableOpacity
            style={[
              styles.ctaButton,
              selectedIds.size === 0 && styles.ctaButtonDisabled,
            ]}
            onPress={handleSeeRecommendations}
            disabled={loading || selectedIds.size === 0}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="recommend" size={22} color="#fff" />
                <Text style={styles.ctaText}>Xem đề xuất</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.resultHeader}>
        <TouchableOpacity onPress={handleBackToPreferences} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Chọn lại</Text>
        </TouchableOpacity>
        <Text style={styles.resultTitle}>Gợi ý cho bạn</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="restaurant" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>Chưa có nhà hàng phù hợp</Text>
          <Text style={styles.emptySubtitle}>
            Thử chọn thêm hoặc bớt sở thích rồi xem lại đề xuất.
          </Text>
          <TouchableOpacity style={styles.ctaButton} onPress={handleBackToPreferences}>
            <Text style={styles.ctaText}>Chọn lại sở thích</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderResultCard}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
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
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  hero: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 12,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.text,
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    padding: 4,
  },
  backText: {
    fontSize: 15,
    color: COLORS.primary,
    marginLeft: 4,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    position: "relative",
  },
  restaurantImage: {
    width: "100%",
    height: 200,
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 6,
  },
  matchReason: {
    fontSize: 13,
    color: COLORS.primary,
    marginBottom: 8,
    fontStyle: "italic",
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
});
