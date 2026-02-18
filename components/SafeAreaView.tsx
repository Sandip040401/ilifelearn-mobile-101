import { View, Text, ViewProps, ViewStyle } from 'react-native'
import React from 'react'
import { useSafeAreaSpacing } from '@/hooks/useSafeAreaSpacing';


const SafeAreaView = ({className, style, children}: ViewProps & {style?: ViewStyle}) => {
    const { top, right, bottom, left } = useSafeAreaSpacing();
  return (
    <View className={className} style={[style, { paddingTop: top, paddingRight: right, paddingBottom: bottom, paddingLeft: left }]}>
        {children}
    </View>
  )
}

export default SafeAreaView