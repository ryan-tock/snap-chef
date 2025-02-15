import { useRouter } from 'expo-router';

// ... existing camera imports and setup ...

const CameraScreen = () => {
  const router = useRouter();

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        // Navigate back to API test screen with the photo URI
        router.push({
          pathname: '/api-test',
          params: { imageUri: photo.uri }
        });
      } catch (error) {
        console.error('Failed to take picture:', error);
      }
    }
  };

  // ... rest of your camera screen code ...
}; 