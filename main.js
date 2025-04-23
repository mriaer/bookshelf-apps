const books = [];
const RENDER_EVENT = 'render-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function saveData() {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBook() {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = parseInt(document.getElementById('inputBookYear').value);
    const bookIsComplete = document.getElementById('inputBookIsComplete').checked;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, bookIsComplete);
    books.push(bookObject);

    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    };
}

document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    incompleteBookshelfList.innerHTML = '';

    const completeBookshelfList = document.getElementById('completeBookshelfList');
    completeBookshelfList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete)
            incompleteBookshelfList.append(bookElement);
        else
            completeBookshelfList.append(bookElement);
    }
});

function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = `Penulis: ${bookObject.author}`;

    const numYear = document.createElement('p');
    numYear.innerText = `Tahun: ${bookObject.year}`;

    const container = document.createElement('article');
    container.classList.add('book_item');
    container.append(textTitle, textAuthor, numYear);
    container.setAttribute('data-bookid', bookObject.id);

    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action');

    if (bookObject.isComplete) {
        const bookItemIsCompleteButton = document.createElement('button');
        bookItemIsCompleteButton.classList.add('green');
        bookItemIsCompleteButton.innerText = 'Belum selesai dibaca';
        bookItemIsCompleteButton.addEventListener('click', function () {
            undoBookFromCompleted(bookObject.id);
        });

        const bookItemDeleteButton = document.createElement('button');
        bookItemDeleteButton.classList.add('red');
        bookItemDeleteButton.innerText = 'Hapus buku';
        bookItemDeleteButton.addEventListener('click', function () {
            removeBookFromCompleted(bookObject.id);
        });

        actionContainer.append(bookItemIsCompleteButton, bookItemDeleteButton);
    } else {
        const bookItemIsCompleteButton = document.createElement('button');
        bookItemIsCompleteButton.classList.add('green');
        bookItemIsCompleteButton.innerText = 'Selesai dibaca';
        bookItemIsCompleteButton.addEventListener('click', function () {
            addBookToCompleted(bookObject.id);
        });

        const bookItemDeleteButton = document.createElement('button');
        bookItemDeleteButton.classList.add('red');
        bookItemDeleteButton.innerText = 'Hapus buku';
        bookItemDeleteButton.addEventListener('click', function () {
            removeBookFromCompleted(bookObject.id);
        });

        actionContainer.append(bookItemIsCompleteButton, bookItemDeleteButton);
    }

    const bookItemEditButton = document.createElement('button');
    bookItemEditButton.classList.add('yellow');
    bookItemEditButton.innerText = 'Edit buku';
    bookItemEditButton.addEventListener('click', function () {
        editBookDetails(bookObject.id);
    });

    actionContainer.append(bookItemEditButton);

    container.append(actionContainer);

    return container;
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    saveData();
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    saveData();
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    saveData();
}

function editBookDetails(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    document.getElementById('inputBookTitle').value = bookTarget.title;
    document.getElementById('inputBookAuthor').value = bookTarget.author;
    document.getElementById('inputBookYear').value = bookTarget.year;
    document.getElementById('inputBookIsComplete').checked = bookTarget.isComplete;

    removeBookFromCompleted(bookId);
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function searchBook() {
    const searchBookTitle = document.getElementById('searchBookTitle').value.toLowerCase();
    
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    incompleteBookshelfList.innerHTML = '';

    const completeBookshelfList = document.getElementById('completeBookshelfList');
    completeBookshelfList.innerHTML = '';

    for (const bookItem of books) {
        if (bookItem.title.toLowerCase().includes(searchBookTitle)) {
            const bookElement = makeBook(bookItem);
            if (!bookItem.isComplete)
                incompleteBookshelfList.append(bookElement);
            else
                completeBookshelfList.append(bookElement);
        }
    }
}
