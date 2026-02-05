import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { useTheme } from '../provider/ThemeContext';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label: string;
}

export default function DatePicker({ value, onChange, label }: DatePickerProps) {
  const { theme, scheme } = useTheme();
  const C = theme.colors;
  const [modalVisible, setModalVisible] = useState(false);

  const yyyymmdd = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

  const getQuickDates = () => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    return [
      { label: '1일', date: yyyymmdd(oneDayAgo) },
      { label: '1주', date: yyyymmdd(oneWeekAgo) },
      { label: '1달', date: yyyymmdd(oneMonthAgo) },
      { label: '1년', date: yyyymmdd(oneYearAgo) },
      { label: '오늘', date: yyyymmdd(now) },
    ];
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    inputContainer: {
      flex: 1,
    },
    label: {
      fontSize: 13,
      marginBottom: 8,
      color: C.text,
      fontWeight: "700",
      letterSpacing: -0.2,
    },
    dateInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: C.border,
      borderRadius: 12,
      backgroundColor: scheme === "dark" ? "rgba(255,255,255,0.08)" : "#ffffff",
    },
    input: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: C.text,
      fontWeight: "700",
    },
    calendarButton: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      justifyContent: 'center',
    },
    calendarIcon: {
      fontSize: 16,
      color: C.textMuted,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: scheme === "dark" ? C.card : C.background,
      borderRadius: 16,
      padding: 20,
      minWidth: 300,
      maxWidth: '80%',
      borderWidth: 1,
      borderColor: C.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: C.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    quickDateContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    quickDateButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: C.primary,
      borderWidth: 1,
      borderColor: C.border,
    },
    quickDateButtonText: {
      color: C.primaryText,
      fontWeight: '600',
      fontSize: 14,
    },
    currentDisplay: {
      fontSize: 16,
      color: C.text,
      textAlign: 'center',
      marginBottom: 16,
      padding: 12,
      backgroundColor: scheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      borderRadius: 8,
    },
    closeButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: C.primary,
      alignSelf: 'center',
    },
    closeButtonText: {
      color: C.primaryText,
      fontWeight: '700',
    },
  });

  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.dateInputWrapper}>
        <Text style={styles.input}>{value}</Text>
        <Pressable
          style={styles.calendarButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.calendarIcon}>📅</Text>
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>날짜 선택</Text>
            <Text style={styles.currentDisplay}>
              현재 선택: {value.slice(0,4)}-{value.slice(4,6)}-{value.slice(6,8)}
            </Text>
            
            <View style={styles.quickDateContainer}>
              {getQuickDates().map((item) => (
                <Pressable
                  key={item.label}
                  style={styles.quickDateButton}
                  onPress={() => {
                    onChange(item.date);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.quickDateButtonText}>{item.label}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}