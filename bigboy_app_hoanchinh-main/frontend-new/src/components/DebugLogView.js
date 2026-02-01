import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

// Simple in-app logger for development on real devices
export function useScreenLogger() {
  const [logs, setLogs] = useState([]);

  const log = (message) => {
    try {
      const time = new Date().toISOString().split("T")[1].slice(0, 8);
      const line = `[${time}] ${String(message)}`;
      setLogs((prev) => [...prev.slice(-80), line]); // keep last 80 lines
      // Still log to normal console so Expo/Simulator can see it
      // eslint-disable-next-line no-console
      console.log(line);
    } catch (e) {
      // Fallback to plain console if something goes wrong
      // eslint-disable-next-line no-console
      console.log("Logger error", e);
    }
  };

  const LogView = () => {
    if (!__DEV__) {
      return null;
    }

    return (
      <View style={styles.container} pointerEvents="box-none">
        <ScrollView>
          {logs.map((line, index) => (
            <Text key={index} style={styles.line}>
              {line}
            </Text>
          ))}
        </ScrollView>
      </View>
    );
  };

  return { log, LogView };
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: 160,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  line: {
    color: "#ffffff",
    fontSize: 11,
  },
});

