import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type Level = 'beginner' | 'intermediate' | 'advanced';

type Workout = {
  id: string;
  name: string;
  description: string;
  duration: number;
  calories: number;
  exercises: string[];
  tips: string[];
};

const LEVELS: { id: Level; label: string; subtitle: string; color: string; bg: string }[] = [
  { id: 'beginner', label: 'Beginner', subtitle: 'Perfect for starting your fitness journey', color: '#16A34A', bg: '#DCFCE7' },
  { id: 'intermediate', label: 'Intermediate', subtitle: 'Build strength and endurance', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'advanced', label: 'Advanced', subtitle: 'Challenge yourself to the max', color: '#7C3AED', bg: '#EDE9FE' },
];

const WORKOUTS_BY_LEVEL: Record<Level, Workout[]> = {
  beginner: [
    {
      id: 'b1',
      name: 'Morning Walk',
      description: 'Light cardio to start your day',
      duration: 15,
      calories: 80,
      exercises: ['5 min warm-up', '10 min brisk walk', 'Cool down stretches'],
      tips: ['Stay hydrated during your workout', 'Focus on proper form over speed', 'Take breaks if you need to', 'Listen to your body'],
    },
    {
      id: 'b2',
      name: 'Basic Stretching',
      description: 'Improve flexibility and reduce tension',
      duration: 10,
      calories: 40,
      exercises: ['Neck rolls', 'Shoulder stretches', 'Hamstring stretches', 'Cat-cow pose'],
      tips: ['Breathe deeply during each stretch', 'Hold each stretch 15-30 seconds', 'Never bounce', 'Listen to your body'],
    },
    {
      id: 'b3',
      name: 'Chair Exercises',
      description: 'Low-impact strength training',
      duration: 12,
      calories: 60,
      exercises: ['Seated leg raises', 'Chair squats', 'Arm circles', 'Seated marches'],
      tips: ['Keep your back straight', 'Move slowly and controlled', 'Rest between sets', 'Listen to your body'],
    },
  ],
  intermediate: [
    {
      id: 'i1',
      name: 'Brisk Walk & Jog',
      description: 'Build cardio endurance',
      duration: 20,
      calories: 120,
      exercises: ['5 min warm-up walk', '8 min jog', '5 min cool-down', 'Stretches'],
      tips: ['Maintain a steady pace', 'Land softly when jogging', 'Stay hydrated', 'Listen to your body'],
    },
    {
      id: 'i2',
      name: 'Bodyweight Circuit',
      description: 'Strength and cardio mix',
      duration: 18,
      calories: 100,
      exercises: ['Jumping jacks', 'Push-ups', 'Squats', 'Plank hold', 'Cool down'],
      tips: ['Rest 30 sec between exercises', 'Focus on form', 'Breathe steadily', 'Listen to your body'],
    },
  ],
  advanced: [
    {
      id: 'a1',
      name: 'HIIT Session',
      description: 'High intensity interval training',
      duration: 25,
      calories: 200,
      exercises: ['Warm-up 5 min', 'Sprint 30s / rest 30s x 8', 'Cool down 5 min'],
      tips: ['Push hard in work intervals', 'Keep rest strict', 'Hydrate well', 'Listen to your body'],
    },
  ],
};

const PRO_TIPS = [
  'Stay hydrated during your workout',
  'Focus on proper form over speed',
  'Take breaks if you need to',
  'Listen to your body',
];

const cardShadow = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 3 },
});

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const [level, setLevel] = useState<Level>('beginner');
  const [view, setView] = useState<'list' | 'detail' | 'active'>('list');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set());
  const [isPaused, setIsPaused] = useState(false);

  const workouts = WORKOUTS_BY_LEVEL[level];
  const levelConfig = LEVELS.find((l) => l.id === level)!;

  const handlePlayWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setCompletedPhases(new Set());
    setActivePhaseIndex(0);
    setIsPaused(false);
    setView('detail');
  };

  const handleStartWorkout = () => {
    setView('active');
    setActivePhaseIndex(0);
    setCompletedPhases(new Set());
    setIsPaused(false);
  };

  const handleBack = () => {
    if (view === 'active') {
      setView('detail');
      setCompletedPhases(new Set());
    } else {
      setView('list');
      setSelectedWorkout(null);
    }
  };

  const handleDonePhase = (phaseIndex: number) => {
    setCompletedPhases((prev) => new Set([...prev, phaseIndex]));
    if (selectedWorkout && phaseIndex < selectedWorkout.exercises.length - 1) {
      setActivePhaseIndex(phaseIndex + 1);
    }
  };

  const completedCount = completedPhases.size;
  const totalPhases = selectedWorkout?.exercises.length ?? 0;
  const allDone = totalPhases > 0 && completedCount === totalPhases;

  // ----- List View -----
  if (view === 'list') {
    return (
      <View style={styles.screen}>
        <LinearGradient colors={['#3B82F6', '#2563EB']} style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.headerSubtitle}>Stay Active</Text>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Recommended Workouts</Text>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons name="dumbbell" size={24} color="#FFFFFF" />
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Choose Your Level */}
          <View style={styles.levelCard}>
            <Text style={styles.levelCardTitle}>Choose Your Level</Text>
            {LEVELS.map((l) => (
              <Pressable
                key={l.id}
                onPress={() => setLevel(l.id)}
                style={[styles.levelOption, l.id === level && { backgroundColor: l.bg }]}
              >
                <View style={[styles.levelIcon, { backgroundColor: l.color }]}>
                  <MaterialCommunityIcons name="dumbbell" size={22} color="#FFFFFF" />
                </View>
                <View style={styles.levelTextWrap}>
                  <Text style={[styles.levelLabel, l.id === level && { color: l.color }]}>{l.label}</Text>
                  <Text style={styles.levelSubtitle}>{l.subtitle}</Text>
                </View>
                {l.id === level && (
                  <MaterialCommunityIcons name="check-circle" size={24} color={l.color} />
                )}
              </Pressable>
            ))}
          </View>

          {/* Stats */}
          <View style={styles.statRow}>
            <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#2563EB" />
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FFF7ED' }]}>
              <MaterialCommunityIcons name="fire" size={24} color="#EA580C" />
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#DCFCE7' }]}>
              <MaterialCommunityIcons name="trending-up" size={24} color="#16A34A" />
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
          </View>

          {/* Workout list */}
          <Text style={styles.sectionTitle}>{levelConfig.label} Workouts</Text>
          {workouts.map((workout) => (
            <View key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutCardMain}>
                <Text style={styles.workoutCardName}>{workout.name}</Text>
                <Text style={styles.workoutCardDesc}>{workout.description}</Text>
                <View style={styles.workoutMeta}>
                  <View style={styles.workoutMetaItem}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color="#2563EB" />
                    <Text style={styles.workoutMetaText}>{workout.duration} min</Text>
                  </View>
                  <View style={styles.workoutMetaItem}>
                    <MaterialCommunityIcons name="fire" size={16} color="#EA580C" />
                    <Text style={styles.workoutMetaText}>{workout.calories} kcal</Text>
                  </View>
                </View>
                <Text style={styles.exercisesHeading}>Exercises:</Text>
                <Text style={styles.exercisesList}>
                  {workout.exercises.map((e, i) => (i === 0 ? e : ` • ${e}`)).join('')}
                </Text>
              </View>
              <Pressable style={styles.playBtn} onPress={() => handlePlayWorkout(workout)}>
                <MaterialCommunityIcons name="play" size={28} color="#FFFFFF" />
              </Pressable>
            </View>
          ))}

          {/* Weekly Goal */}
          <View style={styles.weeklyGoalCard}>
            <View style={styles.weeklyGoalIcon}>
              <MaterialCommunityIcons name="trending-up" size={24} color="#2563EB" />
            </View>
            <View style={styles.weeklyGoalText}>
              <Text style={styles.weeklyGoalTitle}>Weekly Goal</Text>
              <Text style={styles.weeklyGoalSubtitle}>150 minutes of activity</Text>
              <Text style={styles.weeklyGoalLabel}>Progress</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '0%' }]} />
              </View>
              <Text style={styles.weeklyGoalCount}>0/150 min</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ----- Detail View (before start) -----
  if (view === 'detail' && selectedWorkout) {
    return (
      <View style={styles.screen}>
        <LinearGradient colors={['#3B82F6', '#2563EB']} style={[styles.detailHeader, { paddingTop: insets.top + 16 }]}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.detailTitle}>{selectedWorkout.name}</Text>
          <Text style={styles.detailSubtitle}>{selectedWorkout.description}</Text>
          <View style={styles.detailMeta}>
            <View style={styles.detailMetaItem}>
              <MaterialCommunityIcons name="clock-outline" size={18} color="#FFFFFF" />
              <Text style={styles.detailMetaText}>{selectedWorkout.duration} min</Text>
            </View>
            <View style={styles.detailMetaItem}>
              <MaterialCommunityIcons name="fire" size={18} color="#FFFFFF" />
              <Text style={styles.detailMetaText}>{selectedWorkout.calories} kcal</Text>
            </View>
            <View style={styles.detailMetaItem}>
              <MaterialCommunityIcons name="medal-outline" size={18} color="#FFFFFF" />
              <Text style={styles.detailMetaText}>{selectedWorkout.exercises.length} exercises</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.detailScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.exercisesCard}>
            <Text style={styles.exercisesCardTitle}>Exercises</Text>
            {selectedWorkout.exercises.map((ex, i) => (
              <View key={i} style={[styles.exerciseRow, i < selectedWorkout.exercises.length - 1 && styles.exerciseRowBorder]}>
                <View style={styles.exerciseNum}>
                  <Text style={styles.exerciseNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.exerciseName}>{ex}</Text>
              </View>
            ))}
          </View>

          <View style={styles.proTipsCard}>
            <MaterialCommunityIcons name="medal-outline" size={24} color="#2563EB" />
            <View style={styles.proTipsContent}>
              <Text style={styles.proTipsTitle}>Pro Tips</Text>
              {(selectedWorkout.tips || PRO_TIPS).map((tip, i) => (
                <Text key={i} style={styles.proTipsItem}>• {tip}</Text>
              ))}
            </View>
          </View>

          <Pressable style={styles.startWorkoutBtn} onPress={handleStartWorkout}>
            <MaterialCommunityIcons name="play" size={24} color="#FFFFFF" />
            <Text style={styles.startWorkoutBtnText}>Start Workout</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // ----- Active Workout View -----
  if (view === 'active' && selectedWorkout) {
    return (
      <View style={styles.screen}>
        <LinearGradient colors={['#3B82F6', '#2563EB']} style={[styles.detailHeader, { paddingTop: insets.top + 16 }]}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.detailTitle}>{selectedWorkout.name}</Text>
          <Text style={styles.detailSubtitle}>{selectedWorkout.description}</Text>
          <View style={styles.detailMeta}>
            <View style={styles.detailMetaItem}>
              <MaterialCommunityIcons name="clock-outline" size={18} color="#FFFFFF" />
              <Text style={styles.detailMetaText}>{selectedWorkout.duration} min</Text>
            </View>
            <View style={styles.detailMetaItem}>
              <MaterialCommunityIcons name="fire" size={18} color="#FFFFFF" />
              <Text style={styles.detailMetaText}>{selectedWorkout.calories} kcal</Text>
            </View>
            <View style={styles.detailMetaItem}>
              <MaterialCommunityIcons name="medal-outline" size={18} color="#FFFFFF" />
              <Text style={styles.detailMetaText}>{selectedWorkout.exercises.length} exercises</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.detailScrollContent} showsVerticalScrollIndicator={false}>
          {/* Workout Progress */}
          <View style={styles.exercisesCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.exercisesCardTitle}>Workout Progress</Text>
              <Text style={styles.progressCount}>{completedCount}/{totalPhases}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(completedCount / totalPhases) * 100}%` }]} />
            </View>
          </View>

          {/* Exercises with status */}
          <View style={styles.exercisesCard}>
            <Text style={styles.exercisesCardTitle}>Exercises</Text>
            {selectedWorkout.exercises.map((ex, i) => {
              const isCompleted = completedPhases.has(i);
              const isActive = activePhaseIndex === i && !allDone;
              return (
                <View key={i} style={[styles.exerciseRow, styles.exerciseRowActive]}>
                  <View style={[styles.exerciseNum, isCompleted && styles.exerciseNumDone]}>
                    {isCompleted ? (
                      <MaterialCommunityIcons name="check" size={22} color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.exerciseNumText, isActive && styles.exerciseNumTextActive]}>{i + 1}</Text>
                    )}
                  </View>
                  <View style={styles.exerciseBody}>
                    <Text style={[styles.exerciseName, isActive && styles.exerciseNameActive]}>{ex}</Text>
                    {isActive && (
                      <Text style={isPaused ? styles.statusPaused : styles.statusInProgress}>
                        {isPaused ? 'Paused' : 'In progress...'}
                      </Text>
                    )}
                    {isCompleted && (
                      <Text style={styles.statusCompleted}>Completed ✓</Text>
                    )}
                  </View>
                  {!isCompleted && (
                    <Pressable style={styles.doneBtn} onPress={() => handleDonePhase(i)}>
                      <Text style={styles.doneBtnText}>Done</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.proTipsCard}>
            <MaterialCommunityIcons name="medal-outline" size={24} color="#2563EB" />
            <View style={styles.proTipsContent}>
              <Text style={styles.proTipsTitle}>Pro Tips</Text>
              {(selectedWorkout.tips || PRO_TIPS).map((tip, i) => (
                <Text key={i} style={styles.proTipsItem}>• {tip}</Text>
              ))}
            </View>
          </View>

          {/* Pause / Resume */}
          {!allDone && (
            <Pressable
              style={[styles.pauseBtn, isPaused && styles.resumeBtn]}
              onPress={() => setIsPaused(!isPaused)}
            >
              <MaterialCommunityIcons name={isPaused ? 'play' : 'pause'} size={24} color="#FFFFFF" />
              <Text style={styles.pauseBtnText}>{isPaused ? 'Resume' : 'Pause'}</Text>
            </Pressable>
          )}

          {allDone && (
            <View style={styles.allDoneWrap}>
              <MaterialCommunityIcons name="check-circle" size={48} color="#16A34A" />
              <Text style={styles.allDoneText}>Workout completed!</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  detailScrollContent: { padding: 20, paddingBottom: 100 },

  levelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...cardShadow,
  },
  levelCardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  levelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  levelIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  levelTextWrap: { flex: 1 },
  levelLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  levelSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  statRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...cardShadow,
  },
  statValue: { fontSize: 24, fontWeight: '700', color: '#111827', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...cardShadow,
  },
  workoutCardMain: { flex: 1 },
  workoutCardName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  workoutCardDesc: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  workoutMeta: { flexDirection: 'row', gap: 16, marginTop: 8 },
  workoutMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  workoutMetaText: { fontSize: 13, color: '#374151' },
  exercisesHeading: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginTop: 8 },
  exercisesList: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  weeklyGoalCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    ...cardShadow,
  },
  weeklyGoalIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  weeklyGoalText: { flex: 1 },
  weeklyGoalTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  weeklyGoalSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  weeklyGoalLabel: { fontSize: 13, color: '#6B7280', marginTop: 10 },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  weeklyGoalCount: { fontSize: 12, color: '#6B7280', marginTop: 6 },

  detailHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  detailTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  detailSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  detailMeta: { flexDirection: 'row', gap: 20, marginTop: 12 },
  detailMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailMetaText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },

  exercisesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...cardShadow,
  },
  exercisesCardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressCount: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  exerciseRowBorder: { borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  exerciseRowActive: { paddingVertical: 14 },
  exerciseNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  exerciseNumDone: { backgroundColor: '#16A34A' },
  exerciseNumText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  exerciseNumTextActive: { color: '#FFFFFF' },
  exerciseBody: { flex: 1 },
  exerciseName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  exerciseNameActive: { color: '#2563EB' },
  statusInProgress: { fontSize: 13, color: '#2563EB', marginTop: 2 },
  statusPaused: { fontSize: 13, color: '#EA580C', marginTop: 2 },
  statusCompleted: { fontSize: 13, color: '#16A34A', marginTop: 2 },
  doneBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  doneBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },

  proTipsCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...cardShadow,
  },
  proTipsContent: { flex: 1, marginLeft: 12 },
  proTipsTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  proTipsItem: { fontSize: 14, color: '#2563EB', marginBottom: 4 },

  startWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  startWorkoutBtnText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },

  pauseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  resumeBtn: { backgroundColor: '#16A34A' },
  pauseBtnText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },

  allDoneWrap: { alignItems: 'center', paddingVertical: 24 },
  allDoneText: { fontSize: 18, fontWeight: '700', color: '#16A34A', marginTop: 12 },
});
