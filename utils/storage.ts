import AsyncStorage from '@react-native-async-storage/async-storage';
import { Player } from '@/types';

const PLAYER_KEY = '@random_world_player';

export const savePlayer = async (player: Player): Promise<void> => {
  try {
    await AsyncStorage.setItem(PLAYER_KEY, JSON.stringify(player));
  } catch (error) {
    console.error('Error saving player:', error);
  }
};

export const loadPlayer = async (): Promise<Player | null> => {
  try {
    const data = await AsyncStorage.getItem(PLAYER_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error loading player:', error);
    return null;
  }
};

export const clearPlayer = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PLAYER_KEY);
  } catch (error) {
    console.error('Error clearing player:', error);
  }
};
