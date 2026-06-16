import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

let upc = "858089003159";

async function process_upc(upc) {
  try {
    const response = await fetch(`http://127.0.0.1:8000/upc?upc=${upc}`);
    console.log(`querying backend with the upc of: ${upc}`);
    if (!response.ok)
      throw new Error(`Error Querying [HTTP(s) Error]: ${response.status}`);
    const response_data = await response.json();
    console.log(`Data Successfuly transmitted: ${response_data}`);
    return response_data

  } catch (error) {
    console.log(`Error: ${error}`);
  }
}

process_upc(upc);

export default function App() {
    return (
    <View style={styles.container}>
      <Text>{process_upc()}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});