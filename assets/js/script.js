// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

//getting form element from the DOM
const form = $("#task-form");
const taskTitle = $("#task-title");
const taskDueDate = $("#task-due-date");
const taskDescription = $("#task-description");
const submitBtn = $("button[type='submit']");
const myModal = $("#formModal");

//getting cards elements
const todoCardEl = $("#todo-cards");
const inProgressCardEl = $("#in-progress-cards");
const doneCardsEl = $("#done-cards");

// Todo: create a function to generate a unique task id
function generateTaskId() {
  //if we have nextId in the localStorage we add "1" for other created task else we assign "1" for the id

  nextId = nextId === null ? 1 : nextId + 1;

  localStorage.setItem("nextId", JSON.stringify(nextId));

  return nextId;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
  //create the article element
  let article = $("<article></article");

  //add classes and data attribute to the article
  article.addClass("card task-card draggable my-3");
  article.attr("data-project-id", task.id);

  //create and append header
  let header = $("<h4></h4>").addClass("card-header").text(task.title);
  article.append(header);

  // Create and append the card body
  let cardBody = $("<div></div>").addClass("card-body");
  article.append(cardBody);

  // Create and append the paragraph elements
  let paragraph1 = $("<p></p>").addClass("card-text").text(task.description);
  let paragraph2 = $("<p></p>").addClass("card-text").text(task.date);
  cardBody.append(paragraph1, paragraph2);

  // Create and append the delete button
  let deleteBtn = $("<button></button>")
    .addClass("btn btn-danger")
    .text("Delete");
  cardBody.append(deleteBtn);

  //append the article to the appropriate container in the DOM
  todoCardEl.append(article);
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  for (task of taskList) {
    createTaskCard(task);
  }
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  if (taskTitle.val() && taskDueDate.val() && taskDescription.val()) {
    //getting the id for the task to be assigned
    let id = generateTaskId();

    //creating a task object with all the values taken from the form
    let newTask = {
      id,
      title: taskTitle.val(),
      date: taskDueDate.val(),
      description: taskDescription.val(),
    };

    createTaskCard(newTask);

    //if there is nothing initially in the local storage, we assign an empty array to the task list
    if (taskList === null) {
      taskList = [];
    }

    //then we push the newly created task in the local storage
    taskList.push(newTask);

    //finally pushing the latest array in the local storage by stringifying it
    localStorage.setItem("tasks", JSON.stringify(taskList));

    //resetting the input field after we add a task
    taskTitle.val("");
    taskDueDate.val("");
    taskDescription.val("");
  } else {
    alert("Please enter all values");
  }
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  //rendering taskList on page load
  renderTaskList();
  //converting date input into jquery date picker ui widget
  $("#task-due-date").datepicker();

  //attaching event listener in the form for "submit"
  form.on("submit", handleAddTask);
});
