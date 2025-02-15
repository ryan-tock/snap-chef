import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';

const ApiTest = () => {
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const API_URL = 'http://127.0.0.1:5000'; // for Android emulator
  // const API_URL = 'http://localhost:5000'; // for iOS simulator

  const fetchHello = async () => {
    try {
      const response = await fetch(`${API_URL}/api/hello`);
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch message');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Logged in successfully');
        console.log('Token:', data.token);
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to login');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>{message}</Text>
      <Button title="Fetch Message" onPress={fetchHello} />
      
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, marginTop: 20, padding: 10 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginTop: 10, padding: 10 }}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

export default ApiTest;