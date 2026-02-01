import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { COLORS } from '../../constants/config';
import Icon from 'react-native-vector-icons/MaterialIcons';

const FAQ_ITEMS = [
  {
    id: '1',
    q: 'Làm sao để đặt bàn?',
    a: 'Vào tab Cá nhân → Đặt bàn của tôi → Đặt bàn mới. Chọn nhà hàng, ngày giờ và số người.',
  },
  {
    id: '2',
    q: 'Làm sao để gọi món qua QR?',
    a: 'Vào tab Quét QR, quét mã trên bàn. Màn hình Menu sẽ mở, bạn chọn món và thêm vào giỏ, rồi đặt hàng.',
  },
  {
    id: '3',
    q: 'Tôi quên mật khẩu thì làm sao?',
    a: 'Tính năng quên mật khẩu đang được phát triển. Bạn có thể liên hệ hỗ trợ qua email hoặc hotline bên dưới.',
  },
  {
    id: '4',
    q: 'Làm sao xem lịch sử đơn hàng?',
    a: 'Vào tab Cá nhân → Lịch sử (đã đăng nhập) hoặc tab Đơn hàng để xem đơn hiện tại.',
  },
];

function FaqItem({ item, expanded, onPress }) {
  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Icon
          name={expanded ? 'expand-less' : 'expand-more'}
          size={24}
          color={COLORS.primary}
        />
        <Text style={styles.faqQuestion}>{item.q}</Text>
      </View>
      {expanded && <Text style={styles.faqAnswer}>{item.a}</Text>}
    </TouchableOpacity>
  );
}

export default function HelpScreen({ navigation }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleFaq = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const openEmail = () => {
    Linking.openURL('mailto:support@bigboy.com');
  };

  const openPhone = () => {
    Linking.openURL('tel:19001234');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Câu hỏi thường gặp</Text>
        <View style={styles.card}>
          {FAQ_ITEMS.map((item) => (
            <FaqItem
              key={item.id}
              item={item}
              expanded={expandedId === item.id}
              onPress={() => toggleFaq(item.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Liên hệ hỗ trợ</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.contactRow} onPress={openEmail}>
            <Icon name="email" size={24} color={COLORS.primary} />
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>support@bigboy.com</Text>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactRow} onPress={openPhone}>
            <Icon name="phone" size={24} color={COLORS.primary} />
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Hotline</Text>
              <Text style={styles.contactValue}>1900 1234</Text>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hướng dẫn nhanh</Text>
        <View style={styles.card}>
          <View style={styles.step}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>1</Text>
            </View>
            <Text style={styles.stepText}>Quét mã QR trên bàn để mở menu và gọi món.</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>2</Text>
            </View>
            <Text style={styles.stepText}>Đặt bàn trước qua mục Đặt bàn của tôi (cần đăng nhập).</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>3</Text>
            </View>
            <Text style={styles.stepText}>Theo dõi đơn hàng và lịch sử trong tab Cá nhân.</Text>
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
  faqItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  faqAnswer: {
    marginTop: 12,
    marginLeft: 32,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
});
