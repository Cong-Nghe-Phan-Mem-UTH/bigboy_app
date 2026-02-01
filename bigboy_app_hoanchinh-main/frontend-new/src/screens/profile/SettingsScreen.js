import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { COLORS } from '../../constants/config';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function SettingsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông báo</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Icon name="notifications" size={24} color={COLORS.primary} />
            <Text style={styles.rowLabel}>Thông báo đẩy</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.row}>
            <Icon name="local-shipping" size={24} color={COLORS.primary} />
            <Text style={styles.rowLabel}>Cập nhật đơn hàng</Text>
            <Switch
              value={orderUpdates}
              onValueChange={setOrderUpdates}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.row}>
            <Icon name="local-offer" size={24} color={COLORS.primary} />
            <Text style={styles.rowLabel}>Khuyến mãi & ưu đãi</Text>
            <Switch
              value={promotions}
              onValueChange={setPromotions}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ứng dụng</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Icon name="info-outline" size={24} color={COLORS.primary} />
            <Text style={styles.rowLabel}>Giới thiệu ứng dụng</Text>
            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.row}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Icon name="description" size={24} color={COLORS.primary} />
            <Text style={styles.rowLabel}>Điều khoản sử dụng</Text>
            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.row}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Icon name="privacy-tip" size={24} color={COLORS.primary} />
            <Text style={styles.rowLabel}>Chính sách bảo mật</Text>
            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phiên bản</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Icon name="android" size={24} color={COLORS.primary} />
            <Text style={styles.rowLabel}>Phiên bản ứng dụng</Text>
            <Text style={styles.version}>1.0.0</Text>
          </View>
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
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  version: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
