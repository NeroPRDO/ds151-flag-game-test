import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { countries } from '../data/countries';
// @ts-ignore
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
        'Erro ao salvar',
        'Não foi possível salvar a pontuação. Confira se o json-server está rodando.'
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

  const nextQuestion = () => {
    if (finishedRef.current) return;

    setChosenOption(-1);
    setQuestions((q) => q + 1);
    setStatus('question');
  };

  const confirmTry = () => {
    if (finishedRef.current) return;

    const option = options[chosenOption];
    const isCorrect = selectedCountry && option && selectedCountry.name === option.name;

    if (isCorrect) {
      updatePoints(pointsRef.current + 1);
      setStatus('hit');
    }
    else {
      setStatus('miss');
    }
  };

  useEffect(() => {
    if (status === 'question' && !finishedRef.current) {
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      setSelectedCountry(randomCountry);
    }
  }, [status, questions]);

  useEffect(() => {
    if (selectedCountry) {
      const wrongOptions = countries.filter((country: Country) => country.code !== selectedCountry.code);
      const optionsArray = _.sample(wrongOptions, 3);
      optionsArray.push(selectedCountry);
      setOptions(_.shuffle(optionsArray));
    }
  }, [selectedCountry]);

  if (status === 'saving') {
    return (
      <SafeAreaView style={styles.savingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.savingText}>Tempo encerrado!</Text>
        <Text style={styles.savingText}>Salvando pontuação...</Text>
      </SafeAreaView>
    );
  }

  if (status === 'end') {
    return (
      <FeedbackScreen
        status="end"
        username={playerName}
        points={points}
        onRestart={() => {
          finishedRef.current = false;
          pointsRef.current = 0;
          setPoints(0);
          setQuestions(1);
          setChosenOption(-1);
          setRestartKey((key) => key + 1);
          setStatus('question');
        }}
        onQuit={() => router.replace('/')}
      />
    );
  }

  if (status === 'hit' || status === 'miss') {
    return (
      <FeedbackScreen
        status={status}
        onContinue={nextQuestion}
      />
    );
  }

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
