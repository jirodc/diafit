import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

const _layout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="test"
        options={{
          title: 'Test',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="meal"
        options={{
          title: 'Meal',
          headerShown: false,
        }}
      />
    </Tabs>
    
  )
}

export default _layout