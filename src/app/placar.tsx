import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { API_BASE_URL, getScores, ScoreRecord, ScoreType } from '../services/api';

const PlacarScreen = () => {
  const [selectedType, setSelectedType] = useState<ScoreType>('scores');
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const loadScores = async (type: ScoreType) => {
    setLoading(true);

    try {
      const data = await getScores(type);
      setScores(data);
    }
    catch (error) {
      console.log(error);
      setScores([]);
      Alert.alert(
        'Erro ao carregar placar',
        'Confira se o json-server está rodando na porta 3000.'
      );
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScores(selectedType);
  }, [selectedType]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Placar</Text>
      <Text style={styles.apiText}>API: {API_BASE_URL}</Text>

      <View style={styles.buttonsContainer}>
        <View style={styles.buttonWrapper}>
          <Button
            title="Placar Normal"
            color={selectedType === 'scores' ? '#0a0' : '#555'}
            onPress={() => setSelectedType('scores')}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            title="Placar Temporizado"
            color={selectedType === 'timedscores' ? '#06c' : '#555'}
            onPress={() => setSelectedType('timedscores')}
          />
        </View>
      </View>

      <View style={styles.refreshButton}>
        <Button title="Atualizar" onPress={() => loadScores(selectedType)} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text>Carregando placar...</Text>
        </View>
      ) : (
        <FlatList
          data={scores}
          keyExtractor={(item, index) => String(item.id ?? index)}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma pontuação encontrada.</Text>
          }
          renderItem={({ item, index }) => (
            <View style={styles.scoreItem}>
              <Text style={styles.position}>{index + 1}º</Text>
              <View style={styles.scoreInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.date}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</Text>
              </View>
              <Text style={styles.points}>{item.score}</Text>
            </View>
          )}
        />
      )}

      <View style={styles.backButton}>
        <Button title="Voltar" color="red" onPress={() => router.replace('/')} />
      </View>
    </SafeAreaView>
  );
};

// sem styles, dividido para focar na lógica do placar

export default PlacarScreen;
