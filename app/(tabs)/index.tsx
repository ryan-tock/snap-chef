import { SafeAreaView, ScrollView, StyleSheet, Platform, View, Image, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { CameraView, CameraType, useCameraPermissions, Camera } from 'expo-camera';
import { useState, useEffect, useRef } from 'react';

export default function HomeScreen() {

  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission) {
        requestPermission();
    }
}, [permission]);

  if (!permission) {
    return <View />
  }
  if (!permission.granted) {
    return <View />
  }

  const takePicture = async () => {
    
    
    if (cameraRef.current) {
      const photoData = await cameraRef.current.takePictureAsync(); // Capture the photo
      if (photoData == undefined) {
        return;
      }
      setPhoto(photoData.uri); // Save photo URI
    } else {
      console.log("no camera ref")
    }
  };

  const resetPicture = async () => {
    setPhoto(null);
  }


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraContainer}>
        <ThemedText style={styles.titleContainer} type="title">Camera</ThemedText>
        {photo ? (
          <Image source={{ uri : photo}} style={styles.camera} />
        ) : (
          <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
        )}
        {photo ? (
          <TouchableOpacity style={styles.captureButton} onPress={resetPicture}>
            <ThemedText type="default" darkColor='black'>🗑 Clear Photo</ThemedText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <ThemedText type="default" darkColor='black'>📸 Take Photo</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  captureButton: {
    backgroundColor: '#fff',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    alignSelf: 'center',
    borderRadius: 50,
  },
});
