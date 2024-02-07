// Initialize Firebase
var firebaseConfig = {
    apiKey: "AIzaSyBR94TUjhDccZB3jr2cPYvBoxw3et09yaU",
    authDomain: "warnings-abc56.firebaseapp.com",
    projectId: "warnings-abc56",
    storageBucket: "warnings-abc56.appspot.com",
    messagingSenderId: "47765529805",
    appId: "1:47765529805:web:152e149d71a621e798f584",
    measurementId: "G-QQH3679CPW"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('warningForm');
    const warningsDisplay = document.getElementById('warningsDisplay');
    let updateMode = false;
    let idToUpdate = '';

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const childName = document.getElementById('childName').value.trim();
        const yearGroup = document.getElementById('yearGroup').value;
        const warningReason = document.getElementById('warningReason').value;
        const otherReason = document.getElementById('otherText').value.trim();
        const warningMessage = warningReason === 'Other' ? otherReason : warningReason;

        if (!updateMode) {
            db.collection("warnings").add({
                name: childName,
                yearGroup: yearGroup,
                warning: warningMessage,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                console.log("Document successfully written!");
            }).catch((error) => {
                console.error("Error writing document: ", error);
            });
        } else {
            db.collection("warnings").doc(idToUpdate).update({
                name: childName,
                yearGroup: yearGroup,
                warning: warningMessage
            }).then(() => {
                console.log("Document successfully updated!");
                updateMode = false;
                idToUpdate = '';
                form.querySelector('button').textContent = 'Add Warning';
            }).catch((error) => {
                console.error("Error updating document: ", error);
            });
        }

        form.reset();
    });

    db.collection("warnings").orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
            warningsDisplay.innerHTML = '';
            snapshot.forEach((doc) => {
                const warning = doc.data();
                const childElement = document.createElement('div');
                childElement.innerHTML = `
                    <strong>${warning.name} (${warning.yearGroup})</strong>
                    <ul><li>${warning.warning}</li></ul>
                    <button class="update-warning" data-id="${doc.id}">Update</button>
                    <button class="delete-warning" data-id="${doc.id}">Delete</button>
                `;
                warningsDisplay.appendChild(childElement);
            });

            document.querySelectorAll('.delete-warning').forEach(button => {
                button.addEventListener('click', function() {
                    db.collection("warnings").doc(this.getAttribute('data-id')).delete().then(() => {
                        console.log("Document successfully deleted!");
                    }).catch((error) => {
                        console.error("Error removing document: ", error);
                    });
                });
            });

            document.querySelectorAll('.update-warning').forEach(button => {
                button.addEventListener('click', function() {
                    const docRef = db.collection("warnings").doc(this.getAttribute('data-id'));
                    docRef.get().then((doc) => {
                        if (doc.exists) {
                            const data = doc.data();
                            document.getElementById('childName').value = data.name;
                            document.getElementById('yearGroup').value = data.yearGroup;
                            if (data.warning !== 'Other') {
                                document.getElementById('warningReason').value = data.warning;
                            } else {
                                document.getElementById('warningReason').value = 'Other';
                                document.getElementById('otherText').value = data.warning;
                                document.getElementById('otherReason').style.display = 'block';
                            }
                            updateMode = true;
                            idToUpdate = docRef.id;
                            form.querySelector('button').textContent = 'Update Warning';
                        }
                    }).catch((error) => {
                        console.log("Error getting document:", error);
                    });
                });
            });
        });
});
