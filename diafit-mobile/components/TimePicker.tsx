import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions, Pressable } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

interface TimePickerProps {
  value: string; // Format: "8:00 AM" or "14:30"
  onChange: (time: string) => void;
}

export default function TimePicker({ value, onChange }: TimePickerProps) {
  // Store 12-hour format (1-12) for display
  const [selectedHour12, setSelectedHour12] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [isAM, setIsAM] = useState(true);
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (value) {
      const parsed = parseTime(value);
      // Convert 24-hour to 12-hour for display
      let hour12 = parsed.hour;
      if (hour12 === 0) hour12 = 12;
      else if (hour12 > 12) hour12 = hour12 - 12;
      setSelectedHour12(hour12);
      setSelectedMinute(parsed.minute);
      setIsAM(parsed.isAM);
    }
  }, [value]);

  const parseTime = (timeStr: string): { hour: number; minute: number; isAM: boolean } => {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const pm = (match[3] || '').toLowerCase() === 'pm';
      if (pm && h < 12) h += 12;
      if (!pm && h === 12) h = 0;
      return { hour: h, minute: m, isAM: !pm && h !== 12 };
    }
    return { hour: 8, minute: 0, isAM: true };
  };

  const formatTime = (hour12: number, minute: number, isAMValue: boolean): string => {
    const amPm = isAMValue ? 'AM' : 'PM';
    return `${hour12}:${minute.toString().padStart(2, '0')} ${amPm}`;
  };

  const handleHourChange = (hour12: number) => {
    setSelectedHour12(hour12);
    const formatted = formatTime(hour12, selectedMinute, isAM);
    onChange(formatted);
  };

  const handleMinuteChange = (minute: number) => {
    setSelectedMinute(minute);
    const formatted = formatTime(selectedHour12, minute, isAM);
    onChange(formatted);
  };

  const handleAmPmChange = (newIsAM: boolean) => {
    setIsAM(newIsAM);
    const formatted = formatTime(selectedHour12, selectedMinute, newIsAM);
    onChange(formatted);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const paddingItems = Math.floor(VISIBLE_ITEMS / 2); // 2
  const centerOffset = paddingItems * ITEM_HEIGHT; // center row offset in viewport
  const contentPaddingTop = ITEM_HEIGHT * 2; // matches pickerContent paddingVertical

  const scrollToHour = (hour12: number) => {
    const indexInList = paddingItems + (hour12 - 1);
    const y = contentPaddingTop + indexInList * ITEM_HEIGHT - centerOffset;
    hourScrollRef.current?.scrollTo({
      y: Math.max(0, y),
      animated: true,
    });
  };

  const scrollToMinute = (minute: number) => {
    const indexInList = paddingItems + minute;
    const y = contentPaddingTop + indexInList * ITEM_HEIGHT - centerOffset;
    minuteScrollRef.current?.scrollTo({
      y: Math.max(0, y),
      animated: true,
    });
  };

  useEffect(() => {
    const t = setTimeout(() => {
      scrollToHour(selectedHour12);
      scrollToMinute(selectedMinute);
    }, 150);
    return () => clearTimeout(t);
  }, []);

  const renderPickerColumn = (
    items: number[],
    selected: number,
    onSelect: (value: number) => void,
    format: (val: number) => string,
    ref: React.RefObject<ScrollView>
  ) => {
    const paddedItems = [
      ...Array(paddingItems).fill(-1),
      ...items,
      ...Array(paddingItems).fill(-1),
    ];

    return (
      <ScrollView
        ref={ref}
        style={[styles.pickerColumn, { height: ITEM_HEIGHT * VISIBLE_ITEMS }]}
        contentContainerStyle={styles.pickerContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        bounces={true}
        overScrollMode="always"
        onMomentumScrollEnd={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          const rowIndex = Math.round((y + centerOffset - contentPaddingTop) / ITEM_HEIGHT);
          const itemIndex = rowIndex - paddingItems;
          const value = items[Math.max(0, Math.min(itemIndex, items.length - 1))];
          if (value !== undefined) onSelect(value);
        }}
        onScrollEndDrag={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          const rowIndex = Math.round((y + centerOffset - contentPaddingTop) / ITEM_HEIGHT);
          const itemIndex = rowIndex - paddingItems;
          const value = items[Math.max(0, Math.min(itemIndex, items.length - 1))];
          if (value !== undefined) onSelect(value);
        }}
      >
        {paddedItems.map((item, index) => {
          const isSelected = item === selected && item !== -1;
          const displayValue = item === -1 ? '' : format(item);
          return (
            <View key={index} style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}>
              <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected]}>
                {displayValue}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const formatHour = (h: number): string => String(h);

  const formatMinute = (m: number): string => m.toString().padStart(2, '0');

  return (
    <View style={styles.container}>
      {/* Selection highlight behind the scroll areas so it doesn't block touches */}
      <View style={styles.selectionIndicator} pointerEvents="none" />
      <View style={styles.pickerWrapper}>
        {renderPickerColumn(
          hours,
          selectedHour12,
          handleHourChange,
          formatHour,
          hourScrollRef
        )}
        <Text style={styles.separator}>:</Text>
        {renderPickerColumn(
          minutes,
          selectedMinute,
          handleMinuteChange,
          formatMinute,
          minuteScrollRef
        )}
        <View style={styles.amPmContainer}>
          <Pressable
            style={[styles.amPmButton, isAM && styles.amPmButtonActive]}
            onPress={() => handleAmPmChange(true)}
          >
            <Text style={[styles.amPmText, isAM && styles.amPmTextActive]}>AM</Text>
          </Pressable>
          <Pressable
            style={[styles.amPmButton, !isAM && styles.amPmButtonActive]}
            onPress={() => handleAmPmChange(false)}
          >
            <Text style={[styles.amPmText, !isAM && styles.amPmTextActive]}>PM</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: 'relative',
    marginVertical: 8,
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  pickerColumn: {
    flex: 1,
    maxWidth: 80,
  },
  pickerContent: {
    paddingVertical: ITEM_HEIGHT * 2,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: 'transparent',
  },
  pickerItemText: {
    fontSize: 24,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  pickerItemTextSelected: {
    fontSize: 28,
    color: '#111827',
    fontWeight: '600',
  },
  separator: {
    fontSize: 28,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 8,
  },
  amPmContainer: {
    flexDirection: 'column',
    marginLeft: 16,
    gap: 8,
  },
  amPmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    minWidth: 60,
    alignItems: 'center',
  },
  amPmButtonActive: {
    backgroundColor: '#3B82F6',
  },
  amPmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  amPmTextActive: {
    color: '#FFFFFF',
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    pointerEvents: 'none',
  },
});
