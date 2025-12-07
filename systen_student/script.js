// LocalStorage arrays (initialize)
let books = JSON.parse(localStorage.getItem("books") || "[]");
let students = JSON.parse(localStorage.getItem("students") || "[]");
let issues = JSON.parse(localStorage.getItem("issues") || "[]");

// ---------------------- ADD BOOK ----------------------
function addBook() {
    const title = document.getElementById("b_title").value.trim();
    const author = document.getElementById("b_author").value.trim();
    const copies = Number(document.getElementById("b_copies").value) || 1;

    if (!title) { alert("Enter book title"); return; }

    const book = {
        id: books.length + 1,
        title,
        author,
        copies
    };

    books.push(book);
    localStorage.setItem("books", JSON.stringify(books));
    loadBooks();
    document.getElementById("b_title").value = "";
    document.getElementById("b_author").value = "";
    document.getElementById("b_copies").value = "";
    alert("Book Added!");
}

// ---------------------- ADD STUDENT ----------------------
function addStudent() {
    const name = document.getElementById("s_name").value.trim();
    const branch = document.getElementById("s_branch").value.trim();

    if (!name) { alert("Enter student name"); return; }

    const stu = {
        id: students.length + 1,
        name,
        branch
    };

    students.push(stu);
    localStorage.setItem("students", JSON.stringify(students));
    loadStudents();
    document.getElementById("s_name").value = "";
    document.getElementById("s_branch").value = "";
    alert("Student Added!");
}

// ---------------------- ISSUE BOOK ----------------------
function issueBook() {
    const bid = Number(document.getElementById("i_bookId").value);
    const sid = Number(document.getElementById("i_studentId").value);

    if (!bid || !sid) { alert("Enter Book ID and Student ID"); return; }

    const book = books.find(b => b.id === bid);
    const student = students.find(s => s.id === sid);

    if (!book) { alert("Book not found"); return; }
    if (!student) { alert("Student not found"); return; }
    if (book.copies <= 0) { alert("No copies available"); return; }

    // reduce copy count
    book.copies = book.copies - 1;
    localStorage.setItem("books", JSON.stringify(books));

    const issueDate = new Date();
    const dueDate = new Date(issueDate.getTime() + 14 * 24 * 60 * 60 * 1000);

    const issue = {
        id: issues.length + 1,
        book_id: bid,
        student_id: sid,
        issue_date: issueDate.toISOString().slice(0,10),
        due_date: dueDate.toISOString().slice(0,10),
        return_date: null,
        fine: 0
    };

    issues.push(issue);
    localStorage.setItem("issues", JSON.stringify(issues));
    loadIssues();
    loadBooks(); // update copies shown
    document.getElementById("i_bookId").value = "";
    document.getElementById("i_studentId").value = "";
    alert("Book Issued!");
}

// ---------------------- RETURN BOOK ----------------------
function returnBook() {
    const iid = Number(document.getElementById("r_issueId").value);
    if (!iid) { alert("Enter Issue ID"); return; }

    const issue = issues.find(i => i.id === iid);
    if (!issue) { alert("Issue record not found"); return; }
    if (issue.return_date) { alert("Already returned"); return; }

    const today = new Date();
    issue.return_date = today.toISOString().slice(0,10);

    // fine calculation: ₹5 per day overdue
    const due = new Date(issue.due_date);
    const diffMs = today - due;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    issue.fine = diffDays > 0 ? diffDays * 5 : 0;

    // increase book copies
    const book = books.find(b => b.id === issue.book_id);
    if (book) {
        book.copies = (book.copies || 0) + 1;
        localStorage.setItem("books", JSON.stringify(books));
    }

    localStorage.setItem("issues", JSON.stringify(issues));
    loadIssues();
    loadBooks();
    document.getElementById("r_issueId").value = "";
    alert("Book Returned! Fine: ₹" + issue.fine);
}

// ---------------------- LOAD TABLES ----------------------
function loadBooks() {
    let html = "<tr><th>ID</th><th>Title</th><th>Author</th><th>Copies</th></tr>";
    books.forEach(b => {
        html += `<tr>
                    <td>${b.id}</td>
                    <td>${escapeHtml(b.title)}</td>
                    <td>${escapeHtml(b.author || "")}</td>
                    <td>${b.copies}</td>
                 </tr>`;
    });
    document.getElementById("bookTable").innerHTML = html;
}

function loadStudents() {
    let html = "<tr><th>ID</th><th>Name</th><th>Branch</th></tr>";
    students.forEach(s => {
        html += `<tr>
                    <td>${s.id}</td>
                    <td>${escapeHtml(s.name)}</td>
                    <td>${escapeHtml(s.branch || "")}</td>
                 </tr>`;
    });
    document.getElementById("studentTable").innerHTML = html;
}

function loadIssues() {
    let html = "<tr><th>ID</th><th>Book ID</th><th>Student ID</th><th>Due</th><th>Return</th><th>Fine</th></tr>";
    issues.forEach(i => {
        html += `<tr>
                    <td>${i.id}</td>
                    <td>${i.book_id}</td>
                    <td>${i.student_id}</td>
                    <td>${i.due_date}</td>
                    <td>${i.return_date || '-'}</td>
                    <td>${i.fine}</td>
                 </tr>`;
    });
    document.getElementById("issueTable").innerHTML = html;
}

// simple escape to avoid broken HTML
function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
}

// Initialize view
loadBooks();
loadStudents();
loadIssues();
