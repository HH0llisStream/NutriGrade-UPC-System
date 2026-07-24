import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Touchable, TouchableOpacity, View, Button } from 'react-native';
import { useState, useEffect } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

export default function App() {
  const [nutri_data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [barcode, setBarcode] = useState(null);
  const [barcode_type, setBarcodeType] = useState(null);
  const [scanned, setScanned] = useState(false);
  if (!permission) {
    return <View />;
  }
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}> Camera use is neccessary for this app to scan products! Please allow it. </Text>
        <Button onPress={requestPermission} title="Please Grant Camera Permission"/>
      </View>
    )
  }
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  function barcode_scanned(result) {
    if (scanned) {
      return;
    }
    setScanned(true);
    setBarcode(result.data);
    setBarcodeType(result.type);
  }

  function restart_scan() {
    setBarcode(null);
    setBarcodeType(null);
    setScanned(false);
  }
  
  useEffect(() => {
      async function process_upc(barcode) {
        try {
      const response = await fetch(`http://127.0.0.1:8000/upc?upc=${barcode}`);
      console.log(`querying backend with the upc of: ${barcode}`);
      if (!response.ok)
        throw new Error(`Error Querying [HTTP(s) Error]: ${response.status}`);
      const response_data = await response.json();
      console.log("Data Successfuly transmitted:", response_data);
      if (response_data.error) {
        throw new Error(response_data.error);
      }
      setData(response_data.nutri_score ?? "No Nutri-Score found");
      return response_data;

    } catch (error) {
      console.log(`Error: ${error}`);
      setErrorMessage(error.message);
    }
  }process_upc(barcode)
  },[barcode]);

    return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}
        onBarcodeScanned={scanned ? undefined : barcode_scanned}
        barcodeScannerSettings={{
           barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e']
        }}

      />
        
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}> Flip Camera </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.text}>
        opff Nutri Grade: {errorMessage ?? nutri_data ?? "Loading..."}
      </Text>
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
  camera: {
    flex: 1
  }
});