    
    const STORAGE_KEY = "djcStudentsLRN";
    
    let students = loadStudents();
    let editingLRN = null;
    
    // LOAD STUDENTS
    function loadStudents() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("Loading error:", error);
            return [];
        }
    }
    
    // SAVE STUDENTS
    function saveStudents() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    }
    
    // ESCAPE HTML
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }
    
    // NAVIGATION
    function showPage(page) {
        document.querySelectorAll(".page").forEach(section => {
            section.classList.toggle("hidden", section.id !== page);
        });
    
        document.querySelectorAll("[data-page]").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.page === page
            );
        });
    
        if (page === "dashboard") renderDashboard();
        if (page === "records") renderRecords();
    
        if (page === "add" && editingLRN === null) {
            resetForm();
        }
    }
    
    // RESET FORM
    function resetForm() {
        const form = document.getElementById("studentForm");
    
        if (form) form.reset();
    
        const lrnInput = document.getElementById("lrn");
        if (lrnInput) lrnInput.disabled = false;
    
        const title = document.getElementById("formTitle");
        if (title) title.textContent = "Add Student";
    
        const saveBtn = document.getElementById("saveBtn");
        if (saveBtn) saveBtn.textContent = "Save Student";
    
        editingLRN = null;
    }
    
    // DASHBOARD
    function renderDashboard() {
        const total = document.getElementById("total");
        const grade11 = document.getElementById("grade11");
        const grade12 = document.getElementById("grade12");
        const recent = document.getElementById("recent");
    
        if (total) total.textContent = students.length;
    
        if (grade11) {
            grade11.textContent = students.filter(
                student => student.gradeLevel === "Grade 11"
            ).length;
        }
    
        if (grade12) {
            grade12.textContent = students.filter(
                student => student.gradeLevel === "Grade 12"
            ).length;
        }
    
        if (!recent) return;
    
        const latest = [...students].reverse().slice(0, 5);
    
        if (latest.length === 0) {
            recent.innerHTML =
                '<tr><td colspan="5">No student records yet.</td></tr>';
            return;
        }
    
        recent.innerHTML = latest.map(student => `
            <tr>
                <td>${escapeHTML(student.lrn)}</td>
                <td>${escapeHTML(student.fullName)}</td>
                <td>${escapeHTML(student.gradeLevel)}</td>
                <td>${escapeHTML(student.section)}</td>
                <td>${escapeHTML(student.status)}</td>
            </tr>
        `).join("");
    }
    
    // STUDENT RECORDS
    function renderRecords() {
        const tbody = document.getElementById("studentTable");
        const searchInput = document.getElementById("search");
        const count = document.getElementById("recordCount");
    
        if (!tbody) return;
    
        const search = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";
    
        const filtered = students.filter(student =>
            [
                student.lrn,
                student.fullName,
                student.gradeLevel,
                student.strand,
                student.section,
                student.contact,
                student.email,
                student.status
            ].some(value =>
                String(value || "").toLowerCase().includes(search)
            )
        );
    
        if (count) {
            count.textContent =
                `${filtered.length} record${filtered.length === 1 ? "" : "s"}`;
        }
    
        if (filtered.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="7">No student records found.</td></tr>';
            return;
        }
    
        tbody.innerHTML = filtered.map(student => `
            <tr>
                <td>${escapeHTML(student.lrn)}</td>
                <td>${escapeHTML(student.fullName)}</td>
                <td>${escapeHTML(student.gradeLevel)}</td>
                <td>${escapeHTML(student.strand)}</td>
                <td>${escapeHTML(student.section)}</td>
                <td>${escapeHTML(student.status)}</td>
                <td>
                    <button
                        type="button"
                        class="action-btn edit-btn"
                        data-action="edit"
                        data-lrn="${escapeHTML(student.lrn)}">
                        Edit
                    </button>
    
                    <button
                        type="button"
                        class="action-btn delete-btn"
                        data-action="delete"
                        data-lrn="${escapeHTML(student.lrn)}">
                        Delete
                    </button>
                </td>
            </tr>
        `).join("");
    }
    
    // REFRESH ALL
    function renderAll() {
        renderDashboard();
        renderRecords();
    }
    
    // ADD OR UPDATE STUDENT
    const studentForm = document.getElementById("studentForm");
    
    if (studentForm) {
        studentForm.addEventListener("submit", function(event) {
            event.preventDefault();
    
            const student = {
                lrn: document.getElementById("lrn").value.trim(),
                fullName: document.getElementById("fullName").value.trim(),
                gradeLevel: document.getElementById("gradeLevel").value,
                strand: document.getElementById("strand").value.trim(),
                section: document.getElementById("section").value.trim(),
                contact: document.getElementById("contact").value.trim(),
                email: document.getElementById("email").value.trim(),
                status: document.getElementById("status").value
            };
    
            if (!/^\d{12}$/.test(student.lrn)) {
                alert("Please enter a valid 12-digit LRN.");
                return;
            }
    
            if (!student.fullName || !student.gradeLevel ||
                !student.strand || !student.section) {
                alert("Please complete all required fields.");
                return;
            }
    
            if (
                editingLRN === null &&
                students.some(item => String(item.lrn) === student.lrn)
            ) {
                alert("This LRN already exists!");
                return;
            }
    
            const backup = [...students];
    
            if (editingLRN !== null) {
                const index = students.findIndex(
                    item => String(item.lrn) === String(editingLRN)
                );
    
                if (index === -1) {
                    alert("Student record not found.");
                    return;
                }
    
                students[index] = student;
            } else {
                students.push(student);
            }
    
            try {
                saveStudents();
            } catch (error) {
                students = backup;
                alert("Unable to save student record.");
                console.error(error);
                return;
            }
    
            resetForm();
            renderAll();
            showPage("records");
    
            alert("Student record saved successfully!");
        });
    }
    
    // EDIT STUDENT
    function editStudent(lrn) {
        const student = students.find(
            item => String(item.lrn) === String(lrn)
        );
    
        if (!student) {
            alert("Student record not found!");
            return;
        }
    
        editingLRN = student.lrn;
    
        document.getElementById("lrn").value = student.lrn;
        document.getElementById("lrn").disabled = true;
        document.getElementById("fullName").value = student.fullName;
        document.getElementById("gradeLevel").value = student.gradeLevel;
        document.getElementById("strand").value = student.strand;
        document.getElementById("section").value = student.section;
        document.getElementById("contact").value = student.contact || "";
        document.getElementById("email").value = student.email || "";
        document.getElementById("status").value = student.status || "Active";
    
        document.getElementById("formTitle").textContent = "Edit Student";
        document.getElementById("saveBtn").textContent = "Update Student";
    
        showPage("add");
    }
    
    // DELETE STUDENT — FIXED
    function deleteStudent(lrn) {
        const index = students.findIndex(
            student => String(student.lrn) === String(lrn)
        );
    
        if (index === -1) {
            alert("Student record not found!");
            return;
        }
    
        const name = students[index].fullName;
    
        if (!confirm(`Are you sure you want to delete ${name}?`)) {
            return;
        }
    
        const backup = [...students];
    
        students.splice(index, 1);
    
        try {
            saveStudents();
            renderAll();
    
            alert("Student deleted successfully!");
        } catch (error) {
            students = backup;
            renderAll();
    
            alert("Unable to delete student. Please try again.");
            console.error(error);
        }
    }
    
    // CLICK HANDLER — EDIT, DELETE, NAVIGATION
    document.addEventListener("click", function(event) {
        const target = event.target;
    
        if (!(target instanceof Element)) return;
    
        // DELETE BUTTON
        const deleteButton = target.closest(
            '#studentTable button[data-action="delete"]'
        );
    
        if (deleteButton) {
            event.preventDefault();
    
            deleteStudent(deleteButton.getAttribute("data-lrn"));
            return;
        }
    
        // EDIT BUTTON
        const editButton = target.closest(
            '#studentTable button[data-action="edit"]'
        );
    
        if (editButton) {
            event.preventDefault();
    
            editStudent(editButton.getAttribute("data-lrn"));
            return;
        }
    
        // NAVIGATION BUTTONS
        const navigation = target.closest("[data-page]");
    
        if (navigation) {
            event.preventDefault();
            showPage(navigation.dataset.page);
        }
    });
    
    // SEARCH
    const searchInput = document.getElementById("search");
    
    if (searchInput) {
        searchInput.addEventListener("input", renderRecords);
    }
    
    // CANCEL BUTTON
    const cancelBtn = document.getElementById("cancelBtn");
    
    if (cancelBtn) {
        cancelBtn.addEventListener("click", function() {
            resetForm();
            showPage("records");
        });
    }
    
    // INITIAL DISPLAY
    renderAll();
