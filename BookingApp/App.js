import React, { useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import MainScreen from './screens/MainScreen';
import BookingsScreen from './screens/BookingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  // Центральное состояние для забронированных дат (общее для экранов)
  const [bookedDates, setBookedDates] = useState([]);

  // Коллбэк, который MainScreen будет вызывать при загрузке/обновлении дат
  const handleDatesChange = useCallback((dates) => {
    setBookedDates(dates);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4A90E2', // под цвет твоих кнопок
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="Main"
          options={({ navigation }) => ({
            title: 'Бронирование',
            headerRight: () => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Bookings', { bookedDates })
                }
                style={styles.headerButton}
              >
                <Ionicons name="list-outline" size={24} color="#fff" />
              </TouchableOpacity>
            ),
          })}
        >
          {(props) => (
            <MainScreen
              {...props}
              route={{
                ...props.route,
                params: {
                  ...props.route.params,
                  bookedDates,
                  onDatesChange: handleDatesChange,
                },
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="Bookings"
          component={BookingsScreen}
          options={{
            title: 'Мои бронирования',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginRight: 10,
    padding: 5,
  },
});