
const list = document.querySelector('ul');
const form = document.querySelector('form');

const update_form = document.querySelector('.update_form');
const updateContent = document.querySelector('#updateDiv');

const createNote = document.querySelector('#create');
const createNoteDiv = document.querySelector('#createNote');

const searchNotesInput = document.querySelector('#searchValue');

const alertAdded = document.querySelector('#alert-added');
const alertRemoved = document.querySelector('#alert-removed');
const alertModified = document.querySelector('#alert-modified');

// Modal: Creating Note

createNote.addEventListener('click', e => {
    createNoteDiv.style.display = 'block';
    darkOverlay.style.display = 'block';
    document.body.style.overflowY = 'auto';
});

if(createNoteDiv.style.display != 'block') {

    const closeBtn = document.querySelector('#cancelNote');

    closeBtn.onclick = function(){
        darkOverlay.style.display = 'none';
        createNoteDiv.style.display = 'none';

        document.body.style.overflowY = 'auto';
    };
}


// Remove all alert messages

function removeAllmsg() {
    alertAdded.style.display = 'none';
    alertAdded.innerHTML = '';

    alertRemoved.style.display = 'none';
    alertRemoved.innerHTML = '';

    alertModified.style.display = 'none';
    alertModified.innerHTML = '';
}


// If pressing "close", hide update-div

if(updateContent.style.display != 'block') {
    const closeBtn = document.querySelector('#cancelUpdate');

    closeBtn.onclick = function(){
        darkOverlay.style.display = 'none';
        updateContent.style.display = 'none';

        document.body.style.overflowY = 'auto';
    };
}


// Creating Note

const addNote =  (note, id) => {

    const date = new Date(note.created_at.toMillis());
    const dateString = date.toLocaleString();

    let html = `
    <li data-id="${ id }">
        <i class="star fas fa-star"></i>
        <h2 class="d-inline">${ note.title }</h2>
        <p class="note-body">${ note.body }</p>
        <p><b>Created at:</b> <br /><span class="time">${ dateString }</span></p>
        <i class="fas fa-times" title="Delete Note"></i>
        <i class="fas fa-edit" title="Edit note"></i>
    </li>`;

    list.innerHTML += html;
}


// Removing the document

const deleteNote = (id) => {
    
    const notes = document.querySelectorAll('li');

    notes.forEach(note => {
        if(note.getAttribute('data-id') === id) {
            note.remove();
        }
    });
}


// Updating the document

const updateNote = (data, id) => {
    let card = document.querySelector(`li[data-id="${id}"]`);
    let star = card.querySelector('.star');
    let title = card.querySelector('h2');
    let body = card.querySelector('.note-body');

    title.innerText = data.title;
    body.innerText = data.body;

    if (data.important) {
        star.style.display = 'inline-block';
    }

    else {
        star.style.display = 'none';
    }
};


// Show "There are no notes" if DB is empty (no notes)

db.collection('notes').onSnapshot(snapshot => {

    size = snapshot.size;

    let noNotes = document.querySelector('#noNotes');

    if(size <= 0) {
        noNotes.style.display = 'block';
        noNotes.innerHTML = 'There are no notes';
    }

    else {
        noNotes.style.display = 'none';
        noNotes.innerHTML = '';
    }

    removeAllmsg();
});


// Get documents (notes)

db.collection('notes').onSnapshot(snapshot => {

    snapshot.docChanges().forEach(change => {

        const doc = change.doc;

        const title = document.querySelector('#title');
        const body = document.querySelector('#body');
        const importantNote = document.querySelector('#importantNote');

        if (change.type == 'added') {
            addNote(doc.data(), doc.id);

            // Resetting input fieldds

            title.value = '';
            body.value = '';
            importantNote.checked = false;

            createNoteDiv.style.display = 'none';
            darkOverlay.style.display = 'none';
            document.body.style.overflowY = 'auto';
        }

        else if (change.type == 'removed') {
            deleteNote(doc.id);

            return; // Because we delete the element and it doesn' exist in the DOM
        }

        else if (change.type == 'modified') {
            updateNote(doc.data(), doc.id);

            updateContent.style.display = 'none';
            darkOverlay.style.display = 'none';
            document.body.style.overflowY = 'auto';
        }

        // Showing a star if the note is important

        let card = document.querySelector(`li[data-id="${doc.id}"]`);
        let star = card.querySelector('.star');

        if(doc.get('important') === true) {
            star.style.display = 'inline-block';
        }

        else {
            star.style.display = 'none';
        }
    })
});


// Adding documents (Notes)

form.addEventListener('submit', e => {

    e.preventDefault();

    const dateNow = new Date();
    let importantMSGOutput = '';

    if(importantNote.checked) {
        importantMSGOutput = true;
    }

    else {
        importantMSGOutput = false;
    }

    const note = {
        title: form.title.value,
        body: form.body.value,
        important: importantMSGOutput,
        created_at: firebase.firestore.Timestamp.fromDate(dateNow)
    };

    $("html, body").animate({ scrollTop: 0 }, "fast");

    db.collection('notes').add(note).then(() => {
        console.log('Note added!');

        if(importantMSGOutput === true) {
            alertAdded.style.display = 'block';
            alertAdded.innerHTML = 'Important note added!';
        }
    
        else {
            alertAdded.style.display = 'block';
            alertAdded.innerHTML = 'Note added!';
        } 
    })
    .catch(err => {
        console.log(err)
    });
});


// Deleting documents (Notes)

list.addEventListener('click', e => {

    if(e.target.className === 'fas fa-times') {

        const id = e.target.parentElement.getAttribute('data-id');

        $("html, body").animate({ scrollTop: 0 }, "fast");

        db.collection('notes').doc(id).delete().then(() => {
            console.log('Note deleted!');

            alertRemoved.style.display = 'block';
            alertRemoved.innerHTML = 'Note removed!';
        });
    }
});


// Displaying the data for the specified document (id)

list.addEventListener('click', async e => {

    if (e.target.className === 'fas fa-edit') {

      const id = e.target.parentElement.getAttribute('data-id');
  
      darkOverlay.style.display = 'block';
      updateContent.style.display = 'block';
      document.body.style.overflowY = 'hidden';
  
      const update_title = document.querySelector('#update_title');
      const update_body = document.querySelector('#update_body');
      let update_importantNote = document.querySelector('#update_importantNote');
  
      // Updating data to display
  
      const docRef = db.collection('notes').doc(id);
      const docSnapshot = await docRef.get();
      const note = docSnapshot.data();
  
      updateContent.setAttribute('data-selected-id', id);
      update_title.value = note.title;
      update_body.value = note.body;
      update_importantNote.checked = note.important;
    }
});


// Updating with the new data if changed

update_form.addEventListener('submit', e => {

    e.preventDefault();
  
    const update_dateNow = new Date();
    const id = updateContent.getAttribute('data-selected-id');
    let update_importantMSGOutput = '';
    let update_importantNote = document.querySelector('#update_importantNote');
  
    if (update_importantNote.checked) {
        update_importantNote = true;
    } 
    
    else {
        update_importantNote = false;
    }
  
    const updateNote = {
        title: update_form.update_title.value,
        body: update_form.update_body.value,
        important: update_importantNote,
        created_at: firebase.firestore.Timestamp.fromDate(update_dateNow),
    };

    $("html, body").animate({ scrollTop: 0 }, "fast");
  
    db.collection('notes').doc(id).update(updateNote).then(() => {
        console.log('Note updated!');
  
        if(update_importantMSGOutput === true) {
            alertModified.style.display = 'block';
            alertModified.innerHTML = 'Important note added!';
        }
  
        else {
            alertModified.style.display = 'block';
            alertModified.innerHTML = 'Note updated!';
        }
      })

    .catch(err => {
        console.log(err);
    });
});


// Modal for creating note

createNote.addEventListener('click', e => {
    createNoteDiv.style.display = 'block';
    darkOverlay.style.display = 'block';
    document.body.style.overflowY = 'auto';
});


// Filter by important or not important notes

function validateNotes() {

    if (document.getElementById('filter_IN').checked) {

        db.collection('notes').onSnapshot(snapshot => {
            snapshot.docs.forEach(doc => {

                const id = doc.id;
                const data = doc.data();
                const card = document.querySelector(`li[data-id="${id}"]`);
            
                if (data.important != true) {
                    card.style.display = 'none';
                }
            })  
        });
    }

    else {
        db.collection('notes').onSnapshot(snapshot => {
            snapshot.docs.forEach(doc => {

                const id = doc.id;
                const card = document.querySelector(`li[data-id="${id}"]`);
                const searchForinput = document.querySelector('#searchValue');
            
                card.style.display = 'inline-block';
                searchForinput.value = '';
            })  
        });
    }

    removeAllmsg();
}


// Button to show all notes

function showAll() {

    db.collection('notes').onSnapshot(snapshot => {
        snapshot.docs.forEach(doc => {

            const id = doc.id;
            const card = document.querySelector(`li[data-id="${id}"]`);
            const searchForinput = document.querySelector('#searchValue');
            const checkboxIPT = document.querySelector('#filter_IN');

            card.style.display = 'inline-block';
            searchForinput.value = '';
            checkboxIPT.checked = false;
        })
    });

    removeAllmsg();
}


// Search in all notes (Title + Body)

function searchNotes() {

    db.collection('notes').onSnapshot(snapshot => {
        snapshot.docs.forEach(doc => {

            const searchFor = document.querySelector('#searchValue').value;
            const docArray = Object.values(doc.data());
            const id = doc.id;
            const card = document.querySelector(`li[data-id="${id}"]`);
            const checkBox = document.getElementById('filter_IN');
            
            if(checkBox.checked) {
                checkBox.checked = false;
            }
        
            if (docArray.includes(searchFor)) {
                card.style.display = 'inline-block';
            }

            else if(searchFor === '') {
                card.style.display = 'inline-block';
            }

            else {
                card.style.display = 'none';
            }

        })
    });

    removeAllmsg();
}

searchNotesInput.addEventListener("keyup", searchNotes);

function searchClear() {
    const searchFor = document.querySelector('#searchValue');
    searchFor.value = '';

    db.collection('notes').onSnapshot(snapshot => {
        snapshot.docs.forEach(doc => {

            const id = doc.id;
            const card = document.querySelector(`li[data-id="${id}"]`);
            const searchForinput = document.querySelector('#searchValue');
            const checkboxIPT = document.querySelector('#filter_IN');

            card.style.display = 'inline-block';
            searchForinput.value = '';
            checkboxIPT.checked = false;
        })
    });

    removeAllmsg();
}