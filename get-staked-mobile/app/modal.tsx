import { View, Text, StyleSheet } from 'react-native';
import { C } from '@/constants/theme';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Modal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bgPrimary,
  },
  text: { color: C.textPrimary, fontSize: 18 },
});
