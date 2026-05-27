import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { countries } from '../data/countries';
import underscore from '../../underscore-esm-min';
const _: any = underscore;

import { FlagQuestion } from '../components/FlagQuestion';
import { OptionButton } from '../components/OptionButton';
import { FeedbackScreen } from '../components/FeedbackScreen';
import { useCronometro } from '../hooks/useCronometro';
import { saveScore } from '../services/api';

interface Country {
  name: string;
  code: string;
}

type GameStatus = 'question' | 'hit' | 'miss' | 'saving' | 'end';

// Componente principal do jogo temporizado

const GameTimedScreen = () => {
  const [points, setPoints] = useState<number>(0);
  const [questions, setQuestions] = useState<number>(1);
  const [status, setStatus] = useState<GameStatus>('question');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [options, setOptions] = useState<Country[]>([]);
  const [chosenOption, setChosenOption] = useState<number>(-1);
  const [restartKey, setRestartKey] = useState<number>(0);

  const pointsRef = useRef(0);
  const finishedRef = useRef(false);

  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const playerName = username?.trim() || 'Jogador';

  const finishGame = useCallback(async () => {
    if (finishedRef.current) return;

    finishedRef.current = true;
    setStatus('saving');

    try {
      await saveScore('timedscores', playerName, pointsRef.current);
    }
    catch (error) {
      console.log(error);
      Alert.alert(
        'Erro ao salvar pontos',
        'Não foi possível salvar sua pontuação. Confira se o json-server está rodando na porta 3000.'
      );
    }
    finally {
      setStatus('end');
    }
  }, [playerName]);

  const tempoRestante = useCronometro(30, finishGame, restartKey);

  const updatePoints = (newPoints: number) => {
    pointsRef.current = newPoints;
    setPoints(newPoints);
  };

  // fuc next question and status, futuramente implementada.

  if (!selectedCountry) return (<Text>Carregando ...</Text>);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <AntDesign style={styles.buttonClose} name="close" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.timer}>Tempo: {tempoRestante}s</Text>
        <Text style={styles.score}>Pontos: {points}</Text>
      </View>

      <FlagQuestion
        username={playerName}
        countryCode={selectedCountry.code}
      />

      <View style={styles.optionsContainer}>
        {options.map((option, idx) => (
          <OptionButton
            key={`${option.code}-${idx}`}
            label={option.name}
            isSelected={idx === chosenOption}
            onPress={() => setChosenOption(idx)}
          />
        ))}
      </View>

      <View style={styles.confirmContainer}>
        <Button
          title="Confirmar"
          color="green"
          disabled={chosenOption === -1}
          onPress={confirmTry}
        />
      </View>
    </SafeAreaView>
  );
};

// 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
    justifyContent: 'center',
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  buttonClose: {
    flex: 2,
  },
  timer: {
    flex: 4,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  score: {
    flex: 3,
    fontSize: 20,
  },
  optionsContainer: {
    flex: 4,
    justifyContent: 'space-evenly',
  },
  confirmContainer: {
    flex: 1,
    margin: 50,
  },
  savingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
  },
  savingText: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default GameTimedScreen;
