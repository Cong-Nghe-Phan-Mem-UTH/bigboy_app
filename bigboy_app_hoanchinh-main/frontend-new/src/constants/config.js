// API Configuration
// Development modes:
// - Local mode (web/simulator/emulator): Automatically uses 'http://localhost:4000'
//   Run: npm run web, npm run ios, or npm run android
// - LAN mode (npm start): Use your computer's local IP (e.g., 'http://192.168.100.209:4000')
//   Find your IP: macOS: `ipconfig getifaddr en0` or `ifconfig | grep "inet "`
// - Tunnel mode (npm run start:tunnel): Backend must also be exposed via ngrok
//   Steps:
//   1. Run: ./scripts/setup-ngrok.sh (or manually: ngrok http 4000)
//   2. Copy the ngrok URL (e.g., https://abc123.ngrok.io)
//   3. Update API_BASE_URL below with that ngrok URL

// Current IP detected: 192.168.100.209
// To update IP, run: node scripts/get-ip.js

// IMPORTANT: When using tunnel mode, replace the IP below with ngrok URL!
// Example: 'https://abc123.ngrok.io' (from ngrok)
import { Platform } from "react-native";

//const LOCAL_IP = "192.168.100.209";
// ⚠️ Khi dùng ngrok, cập nhật biến này với URL thật, ví dụ:
// const NGROK_URL = "https://abcd-1234.ngrok.io";
// Mặc định để null để tránh lỗi nếu bạn chưa chạy ngrok.
//const NGROK_URL = null; // TODO: set this to your ngrok https URL when using tunnel mode
const LOCAL_IP = "192.168.100.209";
const NGROK_URL = "https://robotlike-thiago-nongranulated.ngrok-free.dev";

// Determine the base URL
// Automatically detects platform and uses appropriate URL:
// - Web: localhost:4000
// - iOS Simulator: localhost:4000
// - Android Emulator: 10.0.2.2:4000 (special emulator IP)
// - Physical devices: Uses LAN IP (192.168.x.x:4000)
const getBaseURL = () => {
  if (!__DEV__) {
    return "https://api.bigboy.com"; // Production
  }

  if (NGROK_URL) {
    return NGROK_URL; // Tunnel mode
  }

  // Use localhost for web, iOS simulator, or Android emulator
  if (Platform.OS === "web") {
    return "http://localhost:4000";
  }

  // For Android emulator, use special IP
  if (Platform.OS === "android") {
    // Check if running on emulator (common emulator host)
    // You can also use 'localhost' with recent Android emulators
    return "http://10.0.2.2:4000"; // Android emulator special IP
  }

  // For iOS simulator, use localhost
  if (Platform.OS === "ios") {
    return "http://localhost:4000";
  }

  // Fallback to LAN IP for physical devices
  return `http://${LOCAL_IP}:4000`;
};

export const API_BASE_URL = getBaseURL();

export const API_VERSION = "/api/v1";

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  USER_DATA: "user_data",
  GUEST_TOKEN: "guest_token",
  TABLE_TOKEN: "table_token",
};

// Membership Tiers (backend returns: Iron, Silver, Gold, Diamond)
export const MEMBERSHIP_TIERS = {
  IRON: "Sắt",
  SILVER: "Bạc",
  GOLD: "Vàng",
  DIAMOND: "Kim cương",
};

// Ordered tiers for progress bar: Sắt → Bạc → Vàng → Kim cương (top = VIP)
export const MEMBERSHIP_TIERS_ORDER = [
  { key: "Iron", name: "Sắt", minSpending: 0 },
  { key: "Silver", name: "Bạc", minSpending: 1000000 },
  { key: "Gold", name: "Vàng", minSpending: 5000000 },
  { key: "Diamond", name: "Kim cương", minSpending: 10000000 },
];

export const TIER_COLORS = {
  Iron: "#8B7355",
  Silver: "#C0C0C0",
  Gold: "#FFD700",
  Diamond: "#B9F2FF",
};

// AI-style restaurant recommendation: user preferences → keywords for matching
export const RECOMMENDATION_PREFERENCES = [
  {
    id: "cuisine",
    title: "Loại ẩm thực",
    options: [
      { id: "vietnam", label: "Việt Nam", keywords: ["việt", "vietnam"] },
      { id: "euro_asian", label: "Âu - Á", keywords: ["âu", "á", "âu - á"] },
      { id: "seafood", label: "Hải sản", keywords: ["hải sản", "hải sản tươi", "seafood"] },
      { id: "bbq", label: "BBQ / Nướng", keywords: ["bbq", "nướng", "grill"] },
      { id: "cafe", label: "Cafe / Tráng miệng", keywords: ["cafe", "cà phê", "tráng miệng"] },
    ],
  },
  {
    id: "vibe",
    title: "Không khí / Dịp",
    options: [
      { id: "family", label: "Gia đình", keywords: ["gia đình", "gia dinh"] },
      { id: "date", label: "Hẹn hò", keywords: ["hẹn hò", "hen ho", "lãng mạn"] },
      { id: "friends", label: "Nhóm bạn", keywords: ["nhóm", "nhom", "bạn bè"] },
      { id: "luxury", label: "Sang trọng", keywords: ["sang", "trọng", "cao cấp"] },
      { id: "casual", label: "Bình dân", keywords: ["bình dân", "binh dan"] },
      { id: "view", label: "View đẹp", keywords: ["view", "sông", "biển", "ven biển", "lãng mạn", "bến"] },
    ],
  },
  {
    id: "area",
    title: "Khu vực",
    options: [
      { id: "hcm", label: "TP.HCM", keywords: ["TP.HCM", "Lê Lợi", "Bến Bạch Đằng", "Quận 1", "HCM"] },
      { id: "hanoi", label: "Hà Nội", keywords: ["Hà Nội", "Ha Noi", "Yên Lãng", "Yen Lang"] },
      { id: "danang", label: "Đà Nẵng", keywords: ["Đà Nẵng", "Da Nang", "Võ Nguyên Giáp", "Sơn Trà", "Son Tra"] },
    ],
  },
];

// Order Status
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY: "ready",
  SERVED: "served",
  CANCELLED: "cancelled",
};

// Colors
export const COLORS = {
  primary: "#FF6B35",
  secondary: "#F7931E",
  background: "#FFFFFF",
  surface: "#F5F5F5",
  text: "#212121",
  textSecondary: "#757575",
  error: "#D32F2F",
  success: "#388E3C",
  warning: "#F57C00",
  info: "#1976D2",
  border: "#E0E0E0",
};
