import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { countries } from '../data/countries';
// @ts-ignore
import underscore from '../../underscore-esm-min';
const _: any = underscore;

import { GameHeader } from '../components/GameHeader';
import { FlagQuestion } from '../components/FlagQuestion';
import { OptionButton } from '../components/OptionButton';
import { FeedbackScreen } from '../components/FeedbackScreen';
import { saveScore } from '../services/api';

interface Country {
  name: string;
  code: string;
}

type GameStatus = 'question' | 'hit' | 'miss' | 'saving' | 'end';

const TOTAL_ROUNDS = 10;

const GameScreen = () => {
  const [points, setPoints] = useState<number>(0);
  const [step, setStep] = useState<number>(1);
  const [status, setStatus] = useState<GameStatus>('question');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [options, setOptions] = useState<Country[]>([]);
  const [chosenOption, setChosenOption] = useState<number>(-1);

  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const playerName = username?.trim() || 'Jogador';

  const finishGame = async () => {
    setStatus('saving');

    try {
      await saveScore('scores', playerName, points);
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
  };

  const nextStep = () => {
    setChosenOption(-1);

    if (step > TOTAL_ROUNDS) {
      finishGame();
      return;
    }

    setStatus('question');
  };

  const confirmTry = () => {
    const option = options[chosenOption];
    const isCorrect = selectedCountry && option && selectedCountry.name === option.name;

    if (isCorrect) {
      setPoints((p) => p + 1);
      setStatus('hit');
    }
    else {
      setStatus('miss');
    }

    setStep((s) => s + 1);
  };

  useEffect(() => {
    if (status === 'question') {
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      setSelectedCountry(randomCountry);
    }
  }, [status]);

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
        <Text style={styles.savingText}>Salvando pontuação...</Text>
      </SafeAreaView>
    );
  }

  if (status !== 'question') {
    return (
      <FeedbackScreen
        status={status}
        username={playerName}
        points={points}
        onContinue={nextStep}
        onRestart={() => {
          setPoints(0);
          setStep(1);
          setChosenOption(-1);
          setStatus('question');
        }}
        onQuit={() => router.replace('/')}
      />
    );
  }

  if (!selectedCountry) return (<Text>Carregando ...</Text>);

  return (
    <SafeAreaView style={styles.container}>
      <GameHeader
        onClose={() => router.replace('/')}
        step={step}
        points={points}
      />

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
  },
});

export default GameScreen;
