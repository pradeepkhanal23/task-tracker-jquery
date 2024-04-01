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
  article.addClass("card task-card draggable my-3 ");
  article.attr("data-project-id", task.id);

  //create and append header
  let header = $("<h4></h4>").addClass("card-header").text(task.title);
  article.append(header);

  // Create and append the card body
  let cardBody = $("<div></div>").addClass("card-body");
  article.append(cardBody);

  // Create and append the paragraph elements
  let paragraph1 = $("<p></p>").addClass("card-text").text(task.description);
  let paragraph2 = $("<p></p>").addClass("card-text").text(task.dueDate);
  cardBody.append(paragraph1, paragraph2);

  // Create and append the delete button
  let deleteBtn = $("<button></button>")
    .addClass("btn btn-danger")
    .text("Delete");
  cardBody.append(deleteBtn);

  todoCardEl.append(article);

  /* 
  Sets the card background color based on due date. Only apply the styles if the dueDate exists and the status is not done.
  */
  if (task.dueDate && task.status !== "done") {
    //getting the present time using dayjs()
    const now = dayjs();

    //making sure the date input from the form is formatted in same format using dayjs for comparison
    const taskDueDate = dayjs(task.dueDate, "MM/DD/YYYY");

    // ? If the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(taskDueDate, "day")) {
      article.addClass("bg-warning text-white");
    } else if (now.isAfter(taskDueDate)) {
      article.addClass("bg-danger text-white");
      deleteBtn.addClass("border-light");
    }
  }

  $(".task-card").draggable({
    opacity: 0.7,
    zIndex: 100,
    // ? This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
    helper: function (e) {
      // ? Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
      const original = $(e.target).hasClass("ui-draggable")
        ? $(e.target)
        : $(e.target).closest(".ui-draggable");
      // ? Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });

  return article;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  //if local storage in empty i.e. null, we return empty array to prevent error in looping the array
  if (taskList === null) {
    return [];
  }

  //if there is tasks present in the local storage, we loop over and create card for each and post it in the DOM
  for (task of taskList) {
    let card = createTaskCard(task);
    todoCardEl.append(card);
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
      dueDate: taskDueDate.val(),
      description: taskDescription.val(),
      status: "to-do",
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
function handleDrop(event, ui) {
  console.log(event, ui);
  // ? Get the project id from the event
  const taskId = ui.draggable[0].dataset.projectId;

  // ? Get the id of the lane that the card was dropped into
  const newStatus = event.target.id;

  for (let task of taskList) {
    // ? Find the project card by the `id` and update the project status.
    if (task.id === taskId) {
      task.status = newStatus;
    }
  }
  // ? Save the updated projects array to localStorage (overwritting the previous one) and render the new project data to the screen.
  localStorage.setItem("tasks", JSON.stringify(taskList));
}

//fucntion to handle drag of the cards
function handleDrag(e) {
  // Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
  const original = $(e.target).hasClass("draggable")
    ? $(e.target)
    : $(e.target).closest(".draggable");
  console.log(original);

  return original.clone().css({
    width: original.outerWidth(),
  });
}

// Event handlers
form.on("submit", handleAddTask);

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  //rendering taskList on page load if there is any
  renderTaskList();

  //converting date input into jquery date picker ui widget
  $("#task-due-date").datepicker({
    changeMonth: true,
    changeYear: true,
  });

  //making lanes droppable
  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });
});
