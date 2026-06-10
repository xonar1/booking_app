import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

const API_URL = 'http://192.168.137.1:8000';

export default function App() {
  const [bookedDates, setBookedDates] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  async function loadDates() {
    try {
      const response = await fetch(`${API_URL}/dates`);
      const data = await response.json();

      setBookedDates(data.bookedDates || []);
    } catch (error) {
      console.log(error);
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
      alert('Выберите диапазон дат');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);

        await loadDates();

        setStartDate(null);
        setEndDate(null);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert(`Ошибка: ${error.message}`);
    }
  }

  const markedDates = {};

  if (startDate && endDate) {
    const range = getDatesInRange(startDate, endDate);

    range.forEach((date, index) => {
      markedDates[date] = {
        startingDay: index === 0,
        endingDay: index === range.length - 1,
        color: '#2196F3',
        textColor: 'white',
      };
    });
  }

  if (startDate && !endDate) {
    markedDates[startDate] = {
      selected: true,
      selectedColor: '#2196F3',
    };
  }

  bookedDates.forEach((date) => {
    markedDates[date] = {
      disabled: true,
      disableTouchEvent: true,
      marked: true,
      dotColor: 'red',
    };
  });

  return (
    <View style={styles.container}>
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
      />

      <Text style={styles.selectedText}>
        {startDate && endDate
          ? `Выбран диапазон: ${startDate} - ${endDate}`
          : startDate
          ? `Начальная дата: ${startDate}`
          : 'Даты не выбраны'}
      </Text>

      <View style={styles.buttonsContainer}>
        <Button
          title="Забронировать"
          onPress={handleBooking}
        />
      </View>

      <View style={styles.buttonsContainer}>
        <Button
          title="Сбросить выбор"
          color="red"
          onPress={() => {
            setStartDate(null);
            setEndDate(null);
          }}
        />
      </View>

      <Text style={styles.title}>
        Мои бронирования
      </Text>

      <FlatList
        data={bookedDates}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Text style={styles.bookingItem}>
            {item}
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    paddingHorizontal: 10,
  },

  selectedText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },

  buttonsContainer: {
    marginTop: 10,
  },

  title: {
    marginTop: 25,
    marginBottom: 10,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  bookingItem: {
    fontSize: 16,
    paddingVertical: 8,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

// Запуск npx expo start --web 