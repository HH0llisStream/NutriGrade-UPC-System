import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useState, useEffect } from 'react';

export default function App() {
  const [foodData_a, setFoodData_a] = useState(null);
  const [foodData_b, setFoodData_b] = useState(null);
  const upc = "858089003159";
  useEffect(() => {
      async function process_upc(upc) {
        try {
      const response = await fetch(`http://127.0.0.1:8000/upc?upc=${upc}`);
      console.log(`querying backend with the upc of: ${upc}`);
      if (!response.ok)
        throw new Error(`Error Querying [HTTP(s) Error]: ${response.status}`);
      console.log(`Data Successfuly transmitted: ${response_data}`);
      return response_data

    } catch (error) {
      console.log(`Error: ${error}`);
    }
  }
  process_upc(upc);
  }, []);

    return (
    <View style={styles.container}>
      <Text style={styles.text}> Open Food Fact Nutri Grade: {foodData_a}</Text>
      <Text style={styles.text}> Open Food Fact Nutri Grade: {String(foodData_b)}</Text>
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
