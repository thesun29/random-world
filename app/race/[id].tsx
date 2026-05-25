import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { getRaceById, RACES } from '@/utils/races';

export default function RaceDetailScreen() {
  const { id } = useLocalSearchParams();
  const raceId = Array.isArray(id) ? id[0] : id;
  const race = getRaceById(raceId);

  if (!race) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>种族不存在</Text>
      </SafeAreaView>
    );
  }

  const calculateEquipmentStrength = () => {
    let total = 0;
    race.equipmentSlots.forEach(slot => {
      if (slot.unlocked) {
        total += slot.strengthBonus;
      }
    });
    return total;
  };

  const equipmentStrength = calculateEquipmentStrength();
  const totalPerPerson = (race.baseStrength + equipmentStrength) * race.strengthMultiplier;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{race.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* 基本信息 */}
        <View style={styles.basicInfoSection}>
          <View style={styles.raceIcon}>
            <Ionicons name="people" size={50} color={Colors.accent} />
          </View>
          <View style={styles.raceInfo}>
            <Text style={styles.raceName}>{race.name}</Text>
            <Text style={styles.raceDesc}>{race.description}</Text>
            <View style={styles.raceTier}>
              <Ionicons name="trophy" size={14} color={Colors.accent} />
              <Text style={styles.tierText}>等级 {race.tier}</Text>
            </View>
          </View>
        </View>

        {/* 战力详情 */}
        <View style={styles.strengthSection}>
          <Text style={styles.sectionTitle}>战力详情</Text>
          
          <View style={styles.strengthCard}>
            <View style={styles.strengthItem}>
              <View style={styles.strengthItemLeft}>
                <Ionicons name="body" size={20} color={Colors.accent} />
                <Text style={styles.strengthLabel}>基础战力</Text>
              </View>
              <Text style={styles.strengthValue}>{race.baseStrength}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.strengthItem}>
              <View style={styles.strengthItemLeft}>
                <Ionicons name="shield" size={20} color={Colors.accent} />
                <Text style={styles.strengthLabel}>装备加成</Text>
              </View>
              <Text style={styles.strengthValue}>+{equipmentStrength}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.strengthItem}>
              <View style={styles.strengthItemLeft}>
                <Ionicons name="trending-up" size={20} color={Colors.accent} />
                <Text style={styles.strengthLabel}>种族倍率</Text>
              </View>
              <Text style={styles.strengthValue}>×{race.strengthMultiplier.toFixed(1)}</Text>
            </View>

            <View style={styles.totalStrengthContainer}>
              <Text style={styles.totalStrengthLabel}>单个人战力</Text>
              <Text style={styles.totalStrengthValue}>{Math.floor(totalPerPerson)}</Text>
            </View>
          </View>
        </View>

        {/* 装备槽 */}
        <View style={styles.equipmentSection}>
          <Text style={styles.sectionTitle}>装备槽</Text>
          <View style={styles.equipmentList}>
            {race.equipmentSlots.map((slot, index) => (
              <View key={index} style={[styles.equipmentSlot, !slot.unlocked && styles.equipmentSlotLocked]}>
                <View style={styles.equipmentSlotLeft}>
                  <Ionicons 
                    name={slot.unlocked ? "checkmark-circle" : "lock-closed"} 
                    size={20} 
                    color={slot.unlocked ? Colors.success : Colors.textMuted} 
                  />
                  <Text style={[styles.equipmentName, !slot.unlocked && styles.equipmentNameLocked]}>
                    {slot.name}
                  </Text>
                </View>
                <Text style={[styles.equipmentBonus, !slot.unlocked && styles.equipmentBonusLocked]}>
                  +{slot.strengthBonus}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 进化路径 */}
        {race.evolutions && race.evolutions.length > 0 && (
          <View style={styles.evolutionSection}>
            <Text style={styles.sectionTitle}>进化方向</Text>
            <View style={styles.evolutionList}>
              {race.evolutions.map((evolutionId, index) => {
                const evolution = RACES[evolutionId];
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.evolutionItem}
                    onPress={() => router.push(`/race/${evolutionId}`)}
                  >
                    <Ionicons name="arrow-forward" size={16} color={Colors.accent} />
                    <Text style={styles.evolutionName}>{evolution?.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.padding,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: Colors.accent,
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: Layout.padding,
  },
  errorText: {
    color: Colors.text,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  basicInfoSection: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: Layout.borderRadius,
    marginBottom: 20,
    ...Layout.shadow,
  },
  raceIcon: {
    width: 80,
    height: 80,
    backgroundColor: Colors.primaryLight,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  raceInfo: {
    flex: 1,
  },
  raceName: {
    color: Colors.accent,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  raceDesc: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  raceTier: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  tierText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  strengthSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  strengthCard: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: Layout.borderRadius,
    ...Layout.shadow,
  },
  strengthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  strengthItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  strengthLabel: {
    color: Colors.text,
    fontSize: 16,
  },
  strengthValue: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.primaryLight,
    marginVertical: 8,
  },
  totalStrengthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: Colors.accent,
  },
  totalStrengthLabel: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  totalStrengthValue: {
    color: Colors.accent,
    fontSize: 28,
    fontWeight: 'bold',
  },
  equipmentSection: {
    marginBottom: 20,
  },
  equipmentList: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    ...Layout.shadow,
  },
  equipmentSlot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLight,
  },
  equipmentSlotLocked: {
    opacity: 0.5,
  },
  equipmentSlotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  equipmentName: {
    color: Colors.text,
    fontSize: 16,
  },
  equipmentNameLocked: {
    color: Colors.textMuted,
  },
  equipmentBonus: {
    color: Colors.success,
    fontSize: 18,
    fontWeight: 'bold',
  },
  equipmentBonusLocked: {
    color: Colors.textMuted,
  },
  evolutionSection: {
    marginBottom: 40,
  },
  evolutionList: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    ...Layout.shadow,
  },
  evolutionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLight,
  },
  evolutionName: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
});
