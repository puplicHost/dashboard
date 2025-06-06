// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAORMLE7sGA4IeNJaJcW5b3FwbTu3zSa1Y",
  authDomain: "my-blog-b7f4c.firebaseapp.com",
  projectId: "my-blog-b7f4c",
  storageBucket: "my-blog-b7f4c.appspot.com",
  messagingSenderId: "892215633277",
  appId: "1:892215633277:web:4b08c32f2436345c4dd814",
  measurementId: "G-B0H86ZQSYK"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            window.location.href = 'index.html';
        })
        .catch((error) => {
            alert('فشل تسجيل الدخول: ' + error.message);
        });
});