import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, Button, Image, TextInput} from 'react-native';
import { useState, useEffect } from 'react';
import { CameraView, CameraType, BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// got a little done today, spent less time then usual on it
// tommorow work on debugging the nutriscore images and displaying them
// maybe add feature that shows 'standout' nutritional information, like high sodium or high fiber
// refine backend manual calculations function
export default function App() {
  const [nutri_data, setNutriScore] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [barcode, setBarcode] = useState<string | null>(null);
  const [barcode_type, setBarcodeType] = useState<string | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [nutri_img_url, setNutri_Img_Url] = useState<string | null>(null);
  const [upc, setUPC] = useState<string>('');
  const [SelectedInterface, setSelectedInterface] = useState<string | null>(null);
  const [permissionPending, setPermissionPending] = useState(false);

  async function process_upc(upc: string) {
        try {
          const response = await fetch(`http://nutrigrade-upc-system.onrender.com/upc?upc=${upc}`);
          console.log(`querying backend with the upc of: ${upc}`);
          if (!response.ok) {
            throw new Error(`Error Querying [HTTP(s) Error]: ${response.status}`);
          }

          const response_data = await response.json();
          console.log('Data successfully transmitted:', response_data);
          if (response_data.error) {
            throw new Error(response_data.error);
          }
          setNutriScore(response_data.nutri_score ?? 'No Nutri-Score found');
          setNutri_Img_Url(response_data.img_url ?? 'https://lightwidget.com/wp-content/uploads/localhost-file-not-found.jpg')
        } catch (error) {
          const message =
            typeof error === 'string'
              ? error
              : error instanceof Error
              ? error.message
              : 'Unknown error';
          console.log(`Error: ${message}`);
          setErrorMessage(message);
        }
      }
          useEffect(() => {
      if (!barcode) {
        return;
      }

       process_upc(barcode);
    }, [barcode]);
    
  if (!permission) {
    return <View style={styles.container} />;
  }


  if (permission.status !== 'granted' && SelectedInterface == "Mobile") {
    return (
      <View style={styles.container}>
        <Text style={styles.message}> Camera use is neccessary for this app to scan products! Please allow it. </Text>
        {permissionPending ? (
          <Text style={styles.message}>Requesting camera access…</Text>
        ) : (
          <Button onPress={() => void requestPermission()} title="Please Grant Camera Permission"/>
        )}
      </View>
    )
  }
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  function barcode_scanned(result: BarcodeScanningResult) {
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
    setErrorMessage(null);
    setNutriScore(null);
  }

      return (
      <View style={styles.container}>
        {SelectedInterface == null ? (
        <View style={styles.verticalButton}>
          <Button title="Computer Interface" onPress={() => setSelectedInterface("Computer")}/>
          <Button title="Mobile Interface (Do not use)" onPress={() => setSelectedInterface("Mobile")}/>
        </View>
        ) : (
          <View style={styles.container}>
            {SelectedInterface == "Computer" ? (
              <View style={{gap:12}}>
                <TextInput
                  style={styles.input}
                  placeholder='Enter UPC/Barcode Code Here'
                  placeholderTextColor={"#000"}
                  value={upc}
                  onChangeText={(userInput) => setUPC(userInput)}
                />

                <TouchableOpacity style={styles.normalButton} onPress={() => process_upc(upc)}>
                  <Text style={styles.buttonText}> Submit </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.normalButton} onPress={() => {setSelectedInterface(null); setScanned(false)}}>
                  <Text style={styles.buttonText}> Back </Text>
                </TouchableOpacity>
              
                <Image
                source={{uri: `${nutri_img_url}`}}
                style={styles.nutri_img}
                resizeMode='contain'
                />
              
              </View>
            ) : (
          scanned === false ? (
            <View style={styles.container}>
            <View style={styles.screen_mobile}>
              <CameraView
                style={styles.camera}
                facing={facing}
                onBarcodeScanned={scanned ? undefined : barcode_scanned}
                barcodeScannerSettings={{
                  barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e']
                }}
              />
            </View>

            <View style={styles.overlayButtonContainer}>
              <TouchableOpacity style={styles.overlayButton} onPress={toggleCameraFacing}>
                <Text style={styles.buttonText}> Flip Camera </Text>
              </TouchableOpacity>
                           
            </View>
            </View>

          ) : (
            <>
            
            <View style={styles.bottomBarContainer}>
            <TouchableOpacity style={styles.normalButton} onPress={restart_scan}>
              <Text style={styles.buttonText}> New Scan </Text>
            </TouchableOpacity>
            </View>
            <View style={styles.overlayTextBox}>
              <Text style={styles.text}>
                {errorMessage ? `An error has occured. Error ${errorMessage}`: !nutri_data ? "Loading..." : `NutriScore: ${nutri_data}`}
              </Text>
            <View style={styles.container}>
              <Image
              source={{uri: `${nutri_img_url}`}}
              style={styles.nutri_img}
              resizeMode='contain'
              />
            </View>
            </View>

          </>)
            )}
          </View>
        )}


      </View>
    )
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  screen_mobile: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },
  message: {
    textAlign: 'center',
    margin: 20,
    color: '#333',
  },
    bottomBarContainer: {
    position: 'absolute',
    bottom: 20,         
    left: 20,         
    right: 20,          
    flexDirection: 'row', 
    gap: 15,           
  },
  verticalButton : {
    gap: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  normalButton: {
    backgroundColor: '#033a14',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight : '600',
    fontSize : 20,
  },
  overlayButton: {
    position:'relative',
    backgroundColor: '#033a14',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  overlayButtonContainer: {
    position:'absolute',
    top:35,
    left:20,
    right:20,
    zIndex:20,
    alignItems:'center',
  },
  overlayTextBox: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 10,
  },
  nutri_img: {
    width:200,
    height:200,
  },
  input: {
    height:50,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    paddingHorizontal: 17,
    fontSize: 25,
    backgroundColor: "#fff"
  },
  text: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 20,

  },
});