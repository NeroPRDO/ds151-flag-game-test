import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';

const HomeScreen = () => {
  const [username, setUsername] = useState<string>('');
  const router = useRouter();
  const nomeValido = username.trim().length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Bem-vindo</Text>
      <View style={styles.container_name}>
        <Text style={styles.labelName}>Digite seu nome</Text>
        <TextInput
          style={styles.textInput}
          value={username}
          onChangeText={(t) => setUsername(t)}
        />

        <View style={styles.buttonContainer}>
          <Button
            title="Iniciar Modo Normal"
            color="#0a0"
            disabled={!nomeValido}
            onPress={() => {
              router.push({
                pathname: '/game',
                params: { username: username.trim() }
              });
            }}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Iniciar Modo Temporizado"
            color="#06c"
            disabled={!nomeValido}
            onPress={() => {
              router.push({
                pathname: '/game-timed',
                params: { username: username.trim() }
              });
            }}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Ver Placar"
            color="#555"
            onPress={() => router.push('/placar')}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  welcome: {
    fontSize: 50,
    color: '#004',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  container_name: {
    justifyContent: 'center',
    width: '80%',
  },
  labelName: {
    fontSize: 30,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 2,
    margin: 20,
    borderColor: '#008',
    borderRadius: 20,
    padding: 20,
    fontSize: 20,
    fontFamily: 'monospace'
  },
  buttonContainer: {
    marginVertical: 6,
  },
});

export default HomeScreen;
