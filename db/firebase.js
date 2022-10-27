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
  setDoc,
  doc,
} from "firebase/firestore";

import firebaseConfig from "./firebase_config.js";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function firebase() {
  console.log(firebaseConfig);
}
// check if user exist and create user accordingly
async function checkUser(userData) {
  // convert fields to string before saving to db
  for (var key in userData) {
    userData[key] = userData[key].toString();
  }
  console.log(userData, userData.id);
  const userRef = doc(db, "user", userData.id);
  await setDoc(userRef, userData);
}

// after the tab is closed, save list of [Bill] amount as an entry with the userId
async function saveBill(billObj) {
  console.log("entered save bill, ");
  var docId = null;
  const billRef = collection(db, "bills");
  await addDoc(billRef, billObj)
    .then((docRef) => {
      // console.log("added bill ", docRef);
      // console.log(docRef.id);
      docId = docRef.id;
    })
    .then(() => {
      return docId;
    });
  return docId;
}

// also save the bill split [Summary] with id of Bill entry id
async function saveSummary(summaryObj) {
  console.log("entered save summary ");
  const summaryRef = collection(db, "summary");
  const docRef = await addDoc(summaryRef, summaryObj);
  console.log("added summary");
}

async function getSummary(chatId) {
  const data = [];
  const q = query(collection(db, "summary"), where("chatId", "==", chatId));
  const docSnapshot = await getDocs(q);
  const docs = docSnapshot.docs.map((doc) => {
    data.push(doc.data());
  });
  return data;
}
const userd = {
  id: 685948947,
  is_bot: false,
  first_name: "Yu Li",
  username: "icebearyyy",
  language_code: "en",
};
const billobj = { bills: [1, 2, 3], userId: "uid" };
// checkUser(userd);
// await saveBill(billobj);
// const d = await getSummary(-758461840);
// console.log(d);
export { checkUser, saveSummary, getSummary, firebase };
