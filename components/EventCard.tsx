import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { GameEvent } from '@/types';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface EventCardProps {
  event: GameEvent;
  onChoice: (choiceId: string) => void;
}

export default function EventCard({ event, onChoice }: EventCardProps) {
  const getTypeColor = () => {
    switch (event.type) {
      case 'epic': return Colors.epic;
      case 'rare': return Colors.rare;
      default: return Colors.normal;
    }
  };

  return (
    <View style={[styles.card, { borderColor: getTypeColor() }]}>
      <View style={[styles.typeIndicator, { backgroundColor: getTypeColor() }]} />
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.description}>{event.description}</Text>
      
      <ScrollView style={styles.choicesContainer}>
        {event.choices.map((choice) => (
          <TouchableOpacity
            key={choice.id}
            style={styles.choiceButton}
            onPress={() => onChoice(choice.id)}
          >
            <Text style={styles.choiceText}>{choice.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    padding: 20,
    marginVertical: 10,
    borderWidth: 2,
    ...Layout.shadow,
  },
  typeIndicator: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  title: {
    color: Colors.accent,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    color: Colors.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  choicesContainer: {
    maxHeight: 200,
  },
  choiceButton: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: Layout.borderRadius,
    marginVertical: 6,
    alignItems: 'center',
  },
  choiceText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
