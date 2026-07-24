import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function BarcodeScannerExample() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [scanned, setScanned] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState(null);
  const [barcodeType, setBarcodeType] = useState(null);

  function handleBarcodeScanned(result) {
    if (scanned) {
      return;
    }

    setScanned(true);
    setBarcodeValue(result.data);
    setBarcodeType(result.type);
  }

  function flipCamera() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  function scanAgain() {
    setScanned(false);
    setBarcodeValue(null);
    setBarcodeType(null);
  }

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera permission is needed to scan barcodes.
        </Text>
        <Button title="Grant camera permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
      />

      <View style={styles.resultPanel}>
        <Text style={styles.label}>Barcode value</Text>
        <Text style={styles.value}>{barcodeValue ?? 'Point camera at a barcode'}</Text>

        <Text style={styles.label}>Barcode type</Text>
        <Text style={styles.value}>{barcodeType ?? 'Not scanned yet'}</Text>

        <View style={styles.buttonRow}>
          <Button title="Flip camera" onPress={flipCamera} />
          {scanned && <Button title="Scan again" onPress={scanAgain} />}
        </View>
      </View>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  permissionText: {
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  resultPanel: {
    backgroundColor: '#fff',
    padding: 20,
    gap: 8,
  },
  label: {
    color: '#555',
    fontSize: 14,
  },
  value: {
    color: '#111',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});