import { initializeApp } from "firebase/app";

import {
  GoogleAuthProvider,
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  addDoc,
} from "firebase/firestore";

import firebaseConfig from "./firebase_config.js";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function firebase() {
  console.log(firebaseConfig);
}
// check if user exist and create user accordingly
async function checkUser(userData) {
  console.log(userData, userData.id);
  // query user
  const queries = query(
    collection(db, "user"),
    where("uid", "==", userData.id)
  );
  const docSnapshot = await getDocs(queries);
  const splitbillRef = collection(db, "user");
  if (docSnapshot.docs.length == 0) {
    console.log("user doesnt exist");
    //create user
    const docRef = await addDoc(splitbillRef, userData);
    console.log("created user");
  }
}

// store state in telegrambot when add more bill before closing the tab

// after the tab is closed, save list of [Bill] amount as an entry with the userId

// also save the bill split [Summary] with id of Bill entry id

const userd = {
  id: 685948947,
  is_bot: false,
  first_name: "Yu Li",
  username: "icebearyyy",
  language_code: "en",
};
// checkUser(userd);
export { checkUser, firebase };
