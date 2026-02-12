import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Switch,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAYS_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface Task {
  id: string;
  name: string;
  time: string;
  type: 'meal' | 'medication';
  enabled: boolean;
  days: boolean[]; // Array of 7 booleans for each day
}

const initialTasks: Task[] = [
  {
    id: '1',
    name: 'Breakfast',
    time: '8:00 AM',
    type: 'meal',
    enabled: true,
    days: [true, true, true, true, true, true, true],
  },
  {
    id: '2',
    name: 'Metformin 500mg',
    time: '8:30 AM',
    type: 'medication',
    enabled: true,
    days: [true, true, true, true, true, true, true],
  },
  {
    id: '3',
    name: 'Mid-Morning Snack',
    time: '10:30 AM',
    type: 'meal',
    enabled: false,
    days: [true, true, true, true, true, false, false],
  },
  {
    id: '4',
    name: 'Lunch',
    time: '12:30 PM',
    type: 'meal',
    enabled: true,
    days: [true, true, true, true, true, true, true],
  },
  {
    id: '5',
    name: 'Insulin',
    time: '12:45 PM',
    type: 'medication',
    enabled: true,
    days: [true, true, true, true, true, true, true],
  },
  {
    id: '6',
    name: 'Afternoon Snack',
    time: '3:00 PM',
    type: 'meal',
    enabled: false,
    days: [true, true, true, true, true, false, false],
  },
  {
    id: '7',
    name: 'Dinner',
    time: '6:30 PM',
    type: 'meal',
    enabled: true,
    days: [true, true, true, true, true, true, true],
  },
  {
    id: '8',
    name: 'Metformin 500mg',
    time: '7:00 PM',
    type: 'medication',
    enabled: true,
    days: [true, true, true, true, true, true, true],
  },
];

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('monthly');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 6)); // February 2026, day 6
  const [selectedDay, setSelectedDay] = useState(6);

  // Create task modal state
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskDays, setNewTaskDays] = useState<boolean[]>(Array(7).fill(false));
  const [newTaskType, setNewTaskType] = useState<'meal' | 'medication'>('meal');

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, enabled: !task.enabled } : task
      )
    );
  };

  const toggleDay = (taskId: string, dayIndex: number) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const newDays = [...task.days];
          newDays[dayIndex] = !newDays[dayIndex];
          return { ...task, days: newDays };
        }
        return task;
      })
    );
  };

  const toggleNewTaskDay = (dayIndex: number) => {
    const newDays = [...newTaskDays];
    newDays[dayIndex] = !newDays[dayIndex];
    setNewTaskDays(newDays);
  };

  const handleCreateTask = () => {
    if (newTaskName.trim() && newTaskTime.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        name: newTaskName,
        time: newTaskTime,
        type: newTaskType,
        enabled: true,
        days: newTaskDays,
      };
      setTasks([...tasks, newTask]);
      setShowCreateModal(false);
      setNewTaskName('');
      setNewTaskTime('');
      setNewTaskDays(Array(7).fill(false));
      setNewTaskType('meal');
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTasksForDay = (day: number) => {
    // Count enabled tasks that occur on this day of week
    const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
    return tasks.filter((task) => task.enabled && task.days[dayOfWeek === 0 ? 6 : dayOfWeek - 1]).length;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const days = [];
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return (
      <View style={styles.calendarCard}>
        {/* Month navigation */}
        <View className="flex-row items-center justify-between mb-4">
          <Pressable onPress={() => navigateMonth('prev')}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#374151" />
          </Pressable>
          <Text className="text-lg font-bold text-gray-900">
            {MONTHS[month]} {year}
          </Text>
          <Pressable onPress={() => navigateMonth('next')}>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#374151" />
          </Pressable>
        </View>

        {/* Days of week header */}
        <View className="flex-row mb-2">
          {DAYS_FULL.map((day) => (
            <View key={day} style={styles.calendarDayHeader}>
              <Text className="text-xs font-semibold text-gray-600">{day[0]}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {days.map((day, index) => {
            if (day === null) {
              return <View key={index} style={styles.calendarDay} />;
            }
            const taskCount = getTasksForDay(day);
            const isSelected = day === selectedDay;
            return (
              <Pressable
                key={day}
                onPress={() => setSelectedDay(day)}
                style={[styles.calendarDay, isSelected && styles.calendarDaySelected]}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    isSelected && styles.calendarDayTextSelected,
                  ]}
                >
                  {day}
                </Text>
                {taskCount > 0 && (
                  <View className="flex-row gap-0.5 mt-1">
                    {[...Array(Math.min(taskCount, 3))].map((_, i) => (
                      <View key={i} style={styles.taskDot} />
                    ))}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Blue gradient header - extends to top, status bar visible on top */}
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-sm text-white/90">Task Schedule</Text>
            <Text className="text-2xl font-bold text-white mt-1">Manage Your Tasks</Text>
          </View>
          <MaterialCommunityIcons name="calendar-outline" size={28} color="#FFFFFF" />
        </View>

        {/* Segmented control */}
        <View style={styles.segmentedControl}>
          <Pressable
            onPress={() => setViewMode('daily')}
            style={[
              styles.segment,
              viewMode === 'daily' && styles.segmentActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                viewMode === 'daily' && styles.segmentTextActive,
              ]}
            >
              Daily View
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode('monthly')}
            style={[
              styles.segment,
              viewMode === 'monthly' && styles.segmentActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                viewMode === 'monthly' && styles.segmentTextActive,
              ]}
            >
              Monthly View
            </Text>
          </Pressable>
        </View>

        {/* Add Task button */}
        <Pressable style={styles.addButton} onPress={() => setShowCreateModal(true)}>
          <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          <Text className="text-white font-semibold text-base ml-2">Add Task</Text>
        </Pressable>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === 'monthly' ? (
          <>
            {renderCalendar()}
            {/* Task Legend */}
            <View style={styles.legendCard}>
              <Text className="text-base font-bold text-gray-900 mb-2">Task Legend</Text>
              <View className="flex-row items-center">
                <View style={styles.legendDot} />
                <Text className="text-sm text-gray-600 ml-2">
                  Tasks scheduled for this day
                </Text>
              </View>
            </View>
          </>
        ) : (
          /* Daily View - Task list */
          tasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              {/* Icon */}
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor:
                      task.type === 'meal' ? '#FFF4E6' : '#EFF6FF',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={task.type === 'meal' ? 'silverware-fork-knife' : 'pill'}
                  size={24}
                  color={task.type === 'meal' ? '#EA580C' : '#3B82F6'}
                />
              </View>

              {/* Task info */}
              <View className="flex-1 ml-4">
                <Text className="text-base font-bold text-gray-900">{task.name}</Text>
                <View className="flex-row items-center mt-1">
                  <MaterialCommunityIcons name="clock-outline" size={14} color="#6B7280" />
                  <Text className="text-sm text-gray-600 ml-1">{task.time}</Text>
                </View>

                {/* Day buttons */}
                <View className="flex-row gap-2 mt-3">
                  {DAYS_SHORT.map((day, dayIndex) => (
                    <Pressable
                      key={dayIndex}
                      onPress={() => toggleDay(task.id, dayIndex)}
                      style={[
                        styles.dayButton,
                        task.days[dayIndex] && styles.dayButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayButtonText,
                          task.days[dayIndex] && styles.dayButtonTextActive,
                        ]}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Toggle switch */}
              <Switch
                value={task.enabled}
                onValueChange={() => toggleTask(task.id)}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#D1D5DB"
              />
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Custom Task Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowCreateModal(false)}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              {/* Header */}
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.modalHeader}
              >
                <View>
                  <Text className="text-2xl font-bold text-white">Create Custom Task</Text>
                  <Text className="text-sm text-white/90 mt-1">Set up your task details</Text>
                </View>
                <Pressable onPress={() => setShowCreateModal(false)} hitSlop={12}>
                  <MaterialCommunityIcons name="close" size={28} color="#FFFFFF" />
                </Pressable>
              </LinearGradient>

              {/* Form */}
              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                {/* Task Name */}
                <Text className="text-sm font-semibold text-gray-900 mb-2">Task Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Take Vitamins"
                  placeholderTextColor="#9CA3AF"
                  value={newTaskName}
                  onChangeText={setNewTaskName}
                />

                {/* Time */}
                <Text className="text-sm font-semibold text-gray-900 mb-2 mt-4">Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 8:00 AM"
                  placeholderTextColor="#9CA3AF"
                  value={newTaskTime}
                  onChangeText={setNewTaskTime}
                />

                {/* Repeat on Days */}
                <Text className="text-sm font-semibold text-gray-900 mb-2 mt-4">
                  Repeat on Days
                </Text>
                <View className="flex-row gap-2 mb-2">
                  {DAYS_SHORT.map((day, dayIndex) => (
                    <Pressable
                      key={dayIndex}
                      onPress={() => toggleNewTaskDay(dayIndex)}
                      style={[
                        styles.modalDayButton,
                        newTaskDays[dayIndex] && styles.modalDayButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalDayButtonText,
                          newTaskDays[dayIndex] && styles.modalDayButtonTextActive,
                        ]}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text className="text-xs text-gray-500 mb-4">Tap to select multiple days</Text>

                {/* Task Type */}
                <Text className="text-sm font-semibold text-gray-900 mb-2">Task Type</Text>
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => setNewTaskType('meal')}
                    style={[
                      styles.typeButton,
                      newTaskType === 'meal' && styles.typeButtonActive,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="silverware-fork-knife"
                      size={32}
                      color={newTaskType === 'meal' ? '#EA580C' : '#6B7280'}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        newTaskType === 'meal' && styles.typeButtonTextActive,
                      ]}
                    >
                      Meal
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setNewTaskType('medication')}
                    style={[
                      styles.typeButton,
                      newTaskType === 'medication' && styles.typeButtonActiveMed,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="pill"
                      size={32}
                      color={newTaskType === 'medication' ? '#3B82F6' : '#6B7280'}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        newTaskType === 'medication' && styles.typeButtonTextActiveMed,
                      ]}
                    >
                      Medication
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>

              {/* Action buttons */}
              <View className="flex-row gap-3 px-6 pb-6 pt-4 border-t border-gray-200">
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text className="text-base font-semibold text-gray-700">Cancel</Text>
                </Pressable>
                <Pressable style={styles.createButton} onPress={handleCreateTask}>
                  <Text className="text-base font-semibold text-white">Create Task</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#3B82F6',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#DBEAFE',
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  dayButtonTextActive: {
    color: '#2563EB',
  },
  // Calendar styles
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  calendarDayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  calendarDaySelected: {
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  calendarDayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  calendarDayTextSelected: {
    color: '#2563EB',
  },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3B82F6',
  },
  legendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalForm: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  modalDayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDayButtonActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  modalDayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  modalDayButtonTextActive: {
    color: '#2563EB',
  },
  typeButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  typeButtonActive: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF4E6',
  },
  typeButtonActiveMed: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  typeButtonText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#EA580C',
  },
  typeButtonTextActiveMed: {
    color: '#3B82F6',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  createButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#3B82F6',
  },
});
