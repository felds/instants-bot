import * as admin from "firebase-admin";
// import "firebase/firestore";
import { format } from "util";
import { client } from "../discord";
import { doorbells } from "../events/doorbell";

admin.initializeApp();

// const fs = admin.firestore();
// fs.collection("doorbells")
//   .doc("cleito")
//   .set({ olha: "a pedra" }, { merge: true })
//   .then((...x) => {
//     console.log("x", x);
//   });

// const firebaseConfig = {
//   credential: admin.credential.applicationDefault(),
//   apiKey: "AIzaSyDXwnsu-ujQIJZku1ApL7BFs4lPqVus0M4",
//   authDomain: "cleiton-bot.firebaseapp.com",
//   projectId: "cleiton-bot",
//   storageBucket: "cleiton-bot.appspot.com",
//   messagingSenderId: "163051923372",
//   appId: "1:163051923372:web:7de9c6eecf12c28caefc09",
// };
// firebase.initializeApp(firebaseConfig);

// const fs = firebase.firestore();
// // fs.collection("doorbells").doc("teste").
// const x = fs.doc("doorbells/atacante").set({ olha: "lá" }, { merge: true });
// console.log("X", x);

client.on("message", (msg) => {
  if (msg.channel.type !== "dm") return;

  const cleanContent = msg.cleanContent;
  const userId = msg.author.id;

  doorbells[userId] = {
    url: "https://www.myinstants.com/media/sounds/ps_1.mp3",
    title: "FELDS entrou na sala",
  };

  msg.author.send(
    "Olha essa parada: (userId) " +
      format(cleanContent) +
      format(userId) +
      format(doorbells),
  );
});
