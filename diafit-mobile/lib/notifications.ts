import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface ScheduledTask {
  id: string;
  name: string;
  time: string; // Format: "8:00 AM"
  repeatDays: boolean[]; // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
  enabled: boolean;
  taskType: 'meal' | 'medication';
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('task-reminders', {
        name: 'Task Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
        sound: 'default',
      });
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Parse time string to hour and minute
 */
function parseTime(timeStr: string): { hour: number; minute: number } {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const pm = (match[3] || '').toLowerCase() === 'pm';
    if (pm && h < 12) h += 12;
    if (!pm && h === 12) h = 0;
    return { hour: h, minute: m };
  }
  return { hour: 8, minute: 0 };
}

/**
 * Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 */
function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/**
 * Schedule notifications for a task
 */
export async function scheduleTaskNotifications(task: ScheduledTask): Promise<void> {
  if (!task.enabled) {
    // Cancel existing notifications for this task
    await cancelTaskNotifications(task.id);
    return;
  }

  const { hour, minute } = parseTime(task.time);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);

  // Cancel existing notifications first
  await cancelTaskNotifications(task.id);

  // Schedule notifications for each selected day
  // repeatDays array: [Sun, Mon, Tue, Wed, Thu, Fri, Sat] (0-indexed)
  // expo-notifications weekday: 1 = Sunday, 2 = Monday, ..., 7 = Saturday
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    if (!task.repeatDays[dayIndex]) continue;

    // Create recurring trigger for weekly notifications (must include type and optional channelId)
    // dayIndex 0 = Sunday -> weekday 1, etc.
    const trigger: Notifications.WeeklyTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: dayIndex + 1, // 1 = Sunday, 2 = Monday, ..., 7 = Saturday
      hour,
      minute,
      ...(Platform.OS === 'android' && { channelId: 'task-reminders' }),
    };

    const notificationId = `${task.id}-${dayIndex}`;

    await Notifications.scheduleNotificationAsync({
      identifier: notificationId,
      content: {
        title: task.taskType === 'meal' ? '🍽️ Meal Reminder' : '💊 Medication Reminder',
        body: `Time to ${task.name.toLowerCase()}`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          taskId: task.id,
          taskType: task.taskType,
        },
      },
      trigger,
    });
  }
}

/**
 * Cancel all notifications for a task
 */
export async function cancelTaskNotifications(taskId: string): Promise<void> {
  try {
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const taskNotifications = allNotifications.filter((n) =>
      n.identifier.startsWith(`${taskId}-`)
    );
    
    for (const notification of taskNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    console.error('Error canceling task notifications:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  return await Notifications.getAllScheduledNotificationsAsync();
}
