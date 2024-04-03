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
  // Create the article element
  const article = $("<article>").addClass("card task-card draggable my-3");

  article.attr("data-project-id", `${task.id}`);

  // Create the header element and append it to the article
  const header = $("<h4>").addClass("card-header").text(`${task.title}`);
  article.append(header);

  // Create the div element for card body and append it to the article
  const cardBody = $("<div>").addClass("card-body");

  // Create and append the card text paragraphs
  cardBody.append($("<p>").addClass("card-text").text(`${task.description}`));
  cardBody.append($("<p>").addClass("card-text").text(`${task.dueDate}`));

  // Create and append the delete button
  const deleteBtn = $("<button>").addClass("btn btn-danger").text("Delete");
  cardBody.append(deleteBtn);

  // Append the card body to the article
  article.append(cardBody);

  // Sets the card background color based on due date. Only apply the styles if the dueDate exists and the status is not done.
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

  return article;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  // ? Empty existing project cards out of the lanes

  todoCardEl.empty();
  inProgressCardEl.empty();
  doneCardsEl.empty();

  //if local storage in empty i.e. null, we return empty array to prevent error in looping the array which is not there
  if (taskList === null) {
    return [];
  }

  let dataFromStorage = JSON.parse(localStorage.getItem("tasks"));

  //if there is tasks present in the local storage, we loop over and create card for each and post it in the DOM
  for (data of dataFromStorage) {
    if (data.status === "in-progress") {
      let progressCard = createTaskCard(data);
      inProgressCardEl.append(progressCard);
    } else if (data.status === "done") {
      let doneCard = createTaskCard(data);
      doneCardsEl.append(doneCard);
    } else {
      let todoCard = createTaskCard(data);
      todoCardEl.append(todoCard);
    }
  }

  //making each card draggable using jquery UI draggable widget
  $(".draggable").draggable({
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
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  if (taskTitle.val() && taskDueDate.val() && taskDescription.val()) {
    //getting the id for the task to be assigned
    let id = generateTaskId();

    //creating a task object with all the values taken from the form
    let newTodo = {
      id,
      title: taskTitle.val(),
      dueDate: taskDueDate.val(),
      description: taskDescription.val(),
      status: "to-do",
    };

    //if there is nothing initially in the local storage, we assign an empty array to the task list
    if (taskList === null) {
      taskList = [];
    }

    //then we push the newly created todo in the array taken from local storage
    taskList.push(newTodo);

    localStorage.setItem("tasks", JSON.stringify(taskList));

    let card = createTaskCard(newTodo);
    todoCardEl.append(card);

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
  for (const task of taskList) {
    let laneId = event.target.id;
    let activeCardId = Number(ui.draggable[0].dataset.projectId);

    if (task.id === activeCardId) {
      task.status = laneId;
    }
  }

  localStorage.setItem("tasks", JSON.stringify(taskList));
}

//fucntion to handle drag of the cards
function handleDrag(e) {
  // Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
  const original = $(e.target).hasClass("draggable")
    ? $(e.target)
    : $(e.target).closest(".draggable");

  return original.clone().css({
    width: original.outerWidth(),
  });
}

// Event handlers
function eventHandlers() {
  form.on("submit", handleAddTask);
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker

$(document).ready(function () {
  //rendering taskList on page load if there is any
  renderTaskList();

  //function that has event handlers
  eventHandlers();

  //converting date input into jquery date picker ui widget
  $("#task-due-date").datepicker({
    changeMonth: true,
    changeYear: true,
  });

  // making lanes droppable
  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });
});
