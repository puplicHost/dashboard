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
    const editArticleForm = document.getElementById('edit-article-form');
    const articleIdField = document.getElementById('articleId');
    const titleField = document.getElementById('title');
    const categoryField = document.getElementById('category');
    const contentField = document.getElementById('content');
    const imageUrlField = document.getElementById('imageUrl');
    const currentImageContainer = document.getElementById('current-image-container');
    const linkField = document.getElementById('link');
    const linkTitleField = document.getElementById('linkTitle');

    let currentArticleId = null;

    // Get article ID from URL
    const params = new URLSearchParams(window.location.search);
    currentArticleId = params.get('id');

    if (!currentArticleId) {
        alert('لم يتم تحديد مقال!');
        window.location.href = 'index.html';
        return;
    }

    articleIdField.value = currentArticleId;

    // Fetch article data
    db.collection('articles').doc(currentArticleId).get().then((doc) => {
        if (doc.exists) {
            const article = doc.data();
            titleField.value = article.title;
            contentField.value = article.content;
            categoryField.value = article.category || '';
            linkField.value = article.link || '';
            linkTitleField.value = article.linkTitle || '';
            imageUrlField.value = article.imageUrl || '';
            if (article.imageUrl) {
                currentImageContainer.innerHTML = `<p>الصورة الحالية:</p><img src="${article.imageUrl}" alt="Current Image" style="max-width: 200px; border-radius: 8px;">`;
            }
        } else {
            alert('المقال غير موجود.');
            window.location.href = 'index.html';
        }
    }).catch(error => {
        console.error("Error getting document:", error);
        alert('حدث خطأ أثناء جلب بيانات المقال.');
    });

    // Handle form submission
    editArticleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitButton = editArticleForm.querySelector('button[type="submit"]');

        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';

        const updatedData = {
            title: titleField.value,
            content: contentField.value,
            category: categoryField.value,
            link: linkField.value,
            linkTitle: linkTitleField.value,
            imageUrl: imageUrlField.value,
        };

        db.collection('articles').doc(currentArticleId).update(updatedData).then(() => {
            alert('تم تحديث المقال بنجاح!');
            window.location.href = 'index.html';
        }).catch(error => {
            console.error("Error updating document: ", error);
            alert('حدث خطأ أثناء تحديث المقال: ' + error.message);
        }).finally(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-save"></i> حفظ التعديلات';
        });
    });

    // Auth check
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'login.html';
        }
    });
});