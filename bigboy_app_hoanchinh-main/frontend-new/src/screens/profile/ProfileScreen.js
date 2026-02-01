import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { membershipService } from '../../services/membershipService';
import {
  COLORS,
  MEMBERSHIP_TIERS_ORDER,
  TIER_COLORS,
} from '../../constants/config';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MAX_TIER_SPENDING = 10000000; // Diamond threshold (VND)

export default function ProfileScreen({ navigation }) {
  const { user, logout, isGuest } = useAuthStore();
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTierModal, setShowTierModal] = useState(false);

  useEffect(() => {
    if (!isGuest) {
      loadMembership();
    } else {
      setLoading(false);
    }
  }, []);

  const loadMembership = async () => {
    try {
      const response = await membershipService.getMyTier();
      // Backend returns: { data: { current_tier: "...", ... }, message: "..." }
      const membershipData = response?.data || response;
      if (membershipData) {
        setMembership({
          tier: membershipData.current_tier || membershipData.tier,
          total_spending: membershipData.total_spending || 0,
          points: membershipData.points || 0,
          next_tier: membershipData.next_tier,
          spending_to_next: membershipData.spending_to_next || 0,
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.log('Error loading membership:', error);
      }
      // Don't set membership on error, just show profile without tier
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const getTierColor = (tierKey) => {
    return TIER_COLORS[tierKey] || '#8B7355';
  };

  const getTierDisplayName = (tierKey) => {
    return MEMBERSHIP_TIERS_ORDER.find((t) => t.key === tierKey)?.name || tierKey;
  };

  const formatVnd = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return String(n);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Khách'}</Text>
        {user?.email && (
          <Text style={styles.email}>{user.email}</Text>
        )}
        {membership && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.tierBadge, { backgroundColor: getTierColor(membership.tier) }]}
            onPress={() => setShowTierModal(true)}
          >
            <Icon name="workspace-premium" size={20} color="#fff" />
            <Text style={styles.tierText}>{getTierDisplayName(membership.tier)}</Text>
            <Icon name="expand-more" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.menu}>
        {!isGuest && (
          <>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('History')}
            >
              <Icon name="history" size={24} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Lịch sử</Text>
              <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Reservations')}
            >
              <Icon name="event" size={24} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Đặt bàn của tôi</Text>
              <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon name="settings" size={24} color={COLORS.primary} />
          <Text style={styles.menuItemText}>Cài đặt</Text>
          <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Help')}
        >
          <Icon name="help" size={24} color={COLORS.primary} />
          <Text style={styles.menuItemText}>Trợ giúp</Text>
          <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Icon name="logout" size={24} color={COLORS.error} />
          <Text style={[styles.menuItemText, { color: COLORS.error }]}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showTierModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTierModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowTierModal(false)}
        >
          <Pressable style={styles.tierModalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.tierModalHeader}>
              <Text style={styles.tierModalTitle}>Hạng thành viên</Text>
              <TouchableOpacity
                onPress={() => setShowTierModal(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Icon name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {membership && (
              <>
                <View style={styles.tierProgressWrap}>
                  <View style={styles.tierProgressBg}>
                    <View
                      style={[
                        styles.tierProgressFill,
                        {
                          width: `${Math.min(
                            100,
                            (membership.total_spending / MAX_TIER_SPENDING) * 100
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.tierMarkers}>
                    {MEMBERSHIP_TIERS_ORDER.map((tier) => (
                      <View
                        key={tier.key}
                        style={[
                          styles.tierMarker,
                          {
                            left: `${(tier.minSpending / MAX_TIER_SPENDING) * 100}%`,
                            marginLeft: -12,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.tierMarkerDot,
                            {
                              backgroundColor:
                                membership.tier === tier.key
                                  ? getTierColor(tier.key)
                                  : COLORS.border,
                              borderWidth: membership.tier === tier.key ? 3 : 0,
                              borderColor: COLORS.primary,
                            },
                          ]}
                        />
                        <Text
                          style={[
                            styles.tierMarkerLabel,
                            membership.tier === tier.key && styles.tierMarkerLabelActive,
                          ]}
                          numberOfLines={1}
                        >
                          {tier.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.tierSummary}>
                  <Text style={styles.tierSummaryText}>
                    Bạn đang ở hạng{' '}
                    <Text style={{ fontWeight: 'bold', color: getTierColor(membership.tier) }}>
                      {getTierDisplayName(membership.tier)}
                    </Text>
                    . Tổng chi tiêu: {formatVnd(membership.total_spending)} VND.
                  </Text>
                  {membership.next_tier && membership.spending_to_next > 0 && (
                    <Text style={styles.tierNextText}>
                      Còn {formatVnd(membership.spending_to_next)} VND để lên hạng{' '}
                      {MEMBERSHIP_TIERS_ORDER.find((t) => t.key === membership.next_tier)?.name ||
                        membership.next_tier}
                      .
                    </Text>
                  )}
                  {membership.tier === 'Diamond' && (
                    <Text style={styles.tierVipNote}>Bạn đã đạt hạng cao nhất (VIP).</Text>
                  )}
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
  header: {
    backgroundColor: COLORS.primary,
    padding: 32,
    alignItems: 'center',
    paddingBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  tierText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  menu: {
    marginTop: -20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  tierModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  tierModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tierModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tierProgressWrap: {
    marginBottom: 24,
  },
  tierProgressBg: {
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  tierProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  tierMarkers: {
    position: 'relative',
    height: 48,
    marginTop: 8,
  },
  tierMarker: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    width: 24,
  },
  tierMarkerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 4,
  },
  tierMarkerLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tierMarkerLabelActive: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  tierSummary: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  tierSummaryText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  tierNextText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  tierVipNote: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '500',
    marginTop: 4,
  },
});

