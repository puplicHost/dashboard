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
const db = firebase.firestore();
const auth = firebase.auth();
document.addEventListener('DOMContentLoaded', () => {
    // زر الوضع الداكن للوحة التحكم
    const darkBtn = document.getElementById('toggle-dark-admin');
    if (darkBtn) {
        darkBtn.onclick = function() {
            document.body.classList.toggle('dark');
            localStorage.setItem('admin-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        };
        // تفعيل الوضع المحفوظ
        if (localStorage.getItem('admin-theme') === 'dark') {
            document.body.classList.add('dark');
        }
    }

    // جلب وعرض عداد الزيارات
    const visitsTodayCount = document.getElementById('visits-today-count');
    const visitsHistoryList = document.getElementById('visits-history-list');
    const visitsRef = db.collection('visits');
    visitsRef.orderBy(firebase.firestore.FieldPath.documentId(), 'desc').limit(10).onSnapshot(snapshot => {
        let today = new Date().toISOString().slice(0, 10);
        let foundToday = false;
        let historyHtml = '';
        snapshot.forEach(doc => {
            const date = doc.id;
            const count = doc.data().count || 0;
            if (date === today) {
                foundToday = true;
                if (visitsTodayCount) visitsTodayCount.textContent = count;
            } else {
                historyHtml += `<li><span class="date">${date}</span> <span>${count}</span></li>`;
            }
        });
        if (!foundToday && visitsTodayCount) visitsTodayCount.textContent = 0;
        if (visitsHistoryList) visitsHistoryList.innerHTML = historyHtml;
    });

    
    const addArticleForm = document.getElementById('add-article-form');
    const articlesList = document.getElementById('articles-list');
    const logoutButton = document.getElementById('logout-button');

    if (addArticleForm) {
        addArticleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('title').value;
            const category = document.getElementById('category').value;
            const content = document.getElementById('content').value;
            const imageUrlInput = document.getElementById('imageUrl').value;
            const imageFileInput = document.getElementById('imageFile');
            const link = document.getElementById('link').value;
            const linkTitle = document.getElementById('linkTitle').value;
            const submitButton = addArticleForm.querySelector('button[type="submit"]');

            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإضافة...';

            let finalImageUrl = imageUrlInput;
            const imageFile = imageFileInput && imageFileInput.files && imageFileInput.files[0];

            if (imageFile) {
                try {
                    // رفع الصورة إلى Firebase Storage
                    const storageRef = firebase.storage().ref();
                    const fileRef = storageRef.child('article-images/' + Date.now() + '_' + imageFile.name);
                    await fileRef.put(imageFile);
                    finalImageUrl = await fileRef.getDownloadURL();
                } catch (err) {
                    alert('حدث خطأ أثناء رفع الصورة: ' + err.message);
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> إضافة المقال';
                    return;
                }
            }

            db.collection('articles').add({
                title: title,
                content: content,
                category: category,
                imageUrl: finalImageUrl,
                link: link,
                linkTitle: linkTitle,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                addArticleForm.reset();
                alert('تمت إضافة المقال بنجاح');
                fetchArticles();
            }).catch((error) => {
                console.error("Error adding document: ", error);
                alert('حدث خطأ أثناء إضافة المقال: ' + error.message);
            }).finally(() => {
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> إضافة المقال';
            });
        });
    }

    function fetchArticles() {
        if (!articlesList) return;
        articlesList.innerHTML = '';
        db.collection("articles").orderBy("createdAt", "desc").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const article = doc.data();
                const articleElement = document.createElement('div');
                articleElement.classList.add('article');
                articleElement.innerHTML = `
                    <span>${article.title}</span>
                    <div>
                        <button class="edit-btn" data-id="${doc.id}"><i class="fas fa-edit"></i> تعديل</button>
                        <button class="delete-btn" data-id="${doc.id}"><i class="fas fa-trash-alt"></i> حذف</button>
                    </div>
                `;
                articlesList.appendChild(articleElement);
            });
        });
    }

    if (articlesList) {
        articlesList.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            const id = target.dataset.id;

            if (target.classList.contains('delete-btn')) {
                if (confirm('هل أنت متأكد من حذف هذا المقال؟')) {
                    db.collection('articles').doc(id).delete().then(() => {
                        alert('تم حذف المقال بنجاح');
                        fetchArticles();
                    }).catch((error) => {
                        console.error("Error removing document: ", error);
                        alert('حدث خطأ أثناء حذف المقال: ' + error.message);
                    });
                }
            } else if (target.classList.contains('edit-btn')) {
                window.location.href = `edit.html?id=${id}`;
            }
        });
    }

    if(logoutButton) {
        logoutButton.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = 'login.html';
            });
        });
    }

    auth.onAuthStateChanged((user) => {
        if (user) {
            fetchArticles();
        } else {
            window.location.href = 'login.html';
        }
    });
});