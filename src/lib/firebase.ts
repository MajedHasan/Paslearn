// firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Firebase file upload handler
export const handleFileUpload = async (
  file: File,
  fileType: string = "defaults/"
): Promise<string | null> => {
  if (!file) return null;

  const storageRef = ref(storage, fileType); // Reference to the banners folder
  const timestamp = Date.now(); // Get the current timestamp
  const baseFileName = file.name.split(".")[0]; // Get the original file name without extension
  const fileExtension = file.name.split(".").pop(); // Get the file extension

  let uniqueFileName = `${baseFileName}_${timestamp}.${fileExtension}`;
  let uploadTask;

  // Function to check for existing files and create a new unique file name
  const findUniqueFileName = async (name: string): Promise<string> => {
    const listRef = ref(storage, fileType); // Reference to the banners folder
    const fileList = await listAll(listRef); // List all files in the folder
    const existingFiles = fileList.items.map((item) => item.name); // Get existing file names

    // Check if the proposed unique file name already exists
    while (existingFiles.includes(name)) {
      const newTimestamp = Date.now(); // Update the timestamp
      name = `${baseFileName}_${newTimestamp}.${fileExtension}`; // Generate a new unique name
    }
    return name; // Return the unique file name
  };

  // Find a unique file name
  uniqueFileName = await findUniqueFileName(uniqueFileName);
  const uniqueStorageRef = ref(storage, `${fileType}${uniqueFileName}`); // Create a ref with the unique name
  uploadTask = uploadBytesResumable(uniqueStorageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error("Error uploading file:", error);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

// Firebase file delete handler
export const handleFileDelete = async (filePath: string): Promise<void> => {
  if (!filePath) return;

  const fileRef = ref(storage, filePath); // Create a reference to the file

  try {
    await deleteObject(fileRef); // Delete the file
    console.log(`Successfully deleted file: ${filePath}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error deleting file: ${error.message}`);
    } else {
      console.error("Unknown error occurred while deleting file");
    }
  }
};
