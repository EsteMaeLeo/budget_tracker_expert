//  variable to hold db connection
let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  // save a reference to the database
  const db = event.target.result;
  // create an object store (table) called budget
  db.createObjectStore("budget", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;
  // check if app is online YES end all local db data to api
  if (navigator.onLine) {
    //send data
    uploadBudget();
  }
};

request.onerror = function (event) {
  // log error here
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["budget"], "readwrite");

  const budgetObjectStore = transaction.objectStore("budget");

  // add record to your store with add method
  budgetObjectStore.add(record);
}

function uploadBudget() {
  // open a transaction on your db
  const transaction = db.transaction(["budget"], "readwrite");

  // access your object store
  const budgetObjectStore = transaction.objectStore("budget");

  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function () {
    // if there was data in indexedDbs store send  to the api server
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open one more transaction
          const transaction = db.transaction(["budget"], "readwrite");

          const budgetObjectStore = transaction.objectStore("budget");
          // clear all items in your store
          budgetObjectStore.clear();

          alert("All saved transactions has been submitted!");
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
}

window.addEventListener("online", uploadBudget);
