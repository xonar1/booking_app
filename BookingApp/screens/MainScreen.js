import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function MainScreen({ navigation, route }) {
  // Передаём bookedDates через параметры или получаем из глобального состояния
  const { bookedDates: initialBooked = [], onDatesChange } = route.params || {};
  const [bookedDates, setBookedDates] = useState(initialBooked);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Загружаем даты при монтировании, если они не переданы
  async function loadDates() {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/dates`, {
        headers: { 'ngrok-skip-browser-warning': '69420' },
      });
      const data = await response.json();
      const dates = data.bookedDates || [];
      setBookedDates(dates);
      if (onDatesChange) onDatesChange(dates);
    } catch (error) {
      setMessage({ text: 'Не удалось загрузить даты', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDates();
  }, []);

  function getDatesInRange(start, end) {
    const dates = [];
    let current = new Date(start);
    const last = new Date(end);
    while (current <= last) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  async function handleBooking() {
    if (!startDate || !endDate) {
      setMessage({ text: 'Выберите диапазон дат', type: 'error' });
      return;
    }
    try {
      const response = await fetch(`${API_URL}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420',
        },
        body: JSON.stringify({ startDate, endDate }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ text: data.message, type: 'success' });
        await loadDates(); // обновит и вызовет onDatesChange
        setStartDate(null);
        setEndDate(null);
      } else {
        setMessage({ text: data.message, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: `Ошибка: ${error.message}`, type: 'error' });
    }
  }

  const markedDates = {};
  if (startDate && endDate) {
    const range = getDatesInRange(startDate, endDate);
    range.forEach((date, index) => {
      markedDates[date] = {
        startingDay: index === 0,
        endingDay: index === range.length - 1,
        color: '#4A90E2',
        textColor: 'white',
      };
    });
  }
  if (startDate && !endDate) {
    markedDates[startDate] = {
      selected: true,
      selectedColor: '#4A90E2',
    };
  }
  bookedDates.forEach((date) => {
    markedDates[date] = {
      disabled: true,
      disableTouchEvent: true,
      marked: true,
      dotColor: '#E74C3C',
    };
  });

  return (
    <View style={styles.screen}>
      <Calendar
        markingType="period"
        markedDates={markedDates}
        onDayPress={(day) => {
          const selectedDate = day.dateString;
          if (!startDate) {
            setStartDate(selectedDate);
            return;
          }
          if (!endDate) {
            if (selectedDate < startDate) {
              setEndDate(startDate);
              setStartDate(selectedDate);
            } else {
              setEndDate(selectedDate);
            }
            return;
          }
          setStartDate(selectedDate);
          setEndDate(null);
        }}
        theme={{
          todayTextColor: '#FF6B6B',
          selectedDayBackgroundColor: '#4A90E2',
          arrowColor: '#4A90E2',
          monthTextColor: '#2C3E50',
          textMonthFontWeight: 'bold',
          textDayFontSize: 16,
          textMonthFontSize: 18,
        }}
      />

      <Text style={styles.selectedText}>
        {startDate && endDate
          ? `📅 ${startDate} – ${endDate}`
          : startDate
          ? `Начало: ${startDate}`
          : 'Выберите даты'}
      </Text>

      {message && (
        <View
          style={[
            styles.messageBanner,
            message.type === 'error' ? styles.errorBanner : styles.successBanner,
          ]}
        >
          <Text style={styles.messageText}>{message.text}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#4A90E2' }]}
        onPress={handleBooking}
        activeOpacity={0.8}
      >
        <Ionicons name="calendar" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Забронировать</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#E74C3C' }]}
        onPress={() => {
          setStartDate(null);
          setEndDate(null);
          setMessage(null);
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Сбросить</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  selectedText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    color: '#2C3E50',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  messageBanner: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  successBanner: {
    backgroundColor: '#D4EDDA',
  },
  errorBanner: {
    backgroundColor: '#F8D7DA',
  },
  messageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#155724',
  },
});