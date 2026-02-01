import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { qrService } from "../../services/qrService";
import { useAuthStore } from "../../store/authStore";
import { COLORS } from "../../constants/config";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function QRScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const { guestLogin } = useAuthStore();

  const handleBarCodeScanned = async ({ data, type }) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);

    try {
      // Scan QR code to get restaurant info
      const qrData = await qrService.scanQR(data);

      if (qrData.restaurant_id) {
        // Auto guest login if needed
        if (qrData.table_token) {
          const guestName = `Guest_${Date.now()}`;
          const loginResult = await guestLogin(guestName, qrData.table_token);

          if (loginResult.success) {
            // Navigate to menu
            navigation.navigate("Menu", {
              restaurantId: qrData.restaurant_id,
              restaurantName: qrData.restaurant_name,
              tableToken: qrData.table_token,
            });
          } else {
            Alert.alert("Lỗi", "Không thể đăng nhập. Vui lòng thử lại.");
            setScanned(false);
          }
        } else {
          // Regular customer - just navigate to menu
          navigation.navigate("Menu", {
            restaurantId: qrData.restaurant_id,
            restaurantName: qrData.restaurant_name,
          });
        }
      } else {
        Alert.alert("Lỗi", "Mã QR không hợp lệ");
        setScanned(false);
      }
    } catch (error) {
      console.error("QR scan error:", error);
      Alert.alert("Lỗi", "Không thể quét mã QR. Vui lòng thử lại.");
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Đang yêu cầu quyền truy cập camera...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Icon name="camera-alt" size={64} color={COLORS.textSecondary} />
        <Text style={styles.message}>Không có quyền truy cập camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.instruction}>Đưa mã QR vào khung để quét</Text>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Đang xử lý...</Text>
            </View>
          )}
        </View>
      </CameraView>
      {scanned && !loading && (
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.scanAgainText}>Quét lại</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 250,
    height: 250,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instruction: {
    color: "#fff",
    fontSize: 16,
    marginTop: 30,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  scanAgainButton: {
    position: "absolute",
    bottom: 50,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  scanAgainText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
