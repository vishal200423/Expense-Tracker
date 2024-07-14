document.addEventListener("DOMContentLoaded", function() {
    const expenseForm = document.getElementById("expense-form");
    const expenseList = document.getElementById("expense-list").getElementsByTagName('tbody')[0];
    const deletedExpenseList = document.getElementById("deleted-expense-list").getElementsByTagName('tbody')[0];
    const totalAmount = document.getElementById("total-amount");
    const monthlyTotal = document.getElementById("monthly-total");
    const deleteAllButton = document.getElementById("delete-all");
    const todayButton = document.getElementById("today-button");
    const expenseDateInput = document.getElementById("expense-date");

    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let deletedExpenses = JSON.parse(localStorage.getItem("deletedExpenses")) || [];

    function updateTotals() {
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        totalAmount.textContent = total.toFixed(2);
        
        const currentMonth = new Date().getMonth();
        const monthlyTotalAmount = expenses
            .filter(expense => new Date(expense.date).getMonth() === currentMonth)
            .reduce((sum, expense) => sum + expense.amount, 0);
        monthlyTotal.textContent = monthlyTotalAmount.toFixed(2);
    }

    function renderExpenses() {
        expenseList.innerHTML = "";
        expenses.forEach((expense, index) => {
            const row = expenseList.insertRow();
            row.innerHTML = `
                <td>${expense.name}</td>
                <td>₹${expense.amount.toFixed(2)}</td>
                <td>${new Date(expense.date).toLocaleDateString()}</td>
                <td><button onclick="deleteExpense(${index})">×</button></td>
            `;
        });
        updateTotals();
    }

    function renderDeletedExpenses() {
        deletedExpenseList.innerHTML = "";
        deletedExpenses.forEach((expense, index) => {
            const row = deletedExpenseList.insertRow();
            row.innerHTML = `
                <td>${expense.name}</td>
                <td>₹${expense.amount.toFixed(2)}</td>
                <td>${new Date(expense.date).toLocaleDateString()}</td>
                <td>
                    <button onclick="restoreExpense(${index})">Restore</button>
                    <button onclick="deletePermanently(${index})">×</button>
                </td>
            `;
        });
    }

    window.deleteExpense = function(index) {
        const [deletedExpense] = expenses.splice(index, 1);
        deletedExpenses.push(deletedExpense);
        localStorage.setItem("expenses", JSON.stringify(expenses));
        localStorage.setItem("deletedExpenses", JSON.stringify(deletedExpenses));
        renderExpenses();
        renderDeletedExpenses();
    }

    window.restoreExpense = function(index) {
        const [restoredExpense] = deletedExpenses.splice(index, 1);
        expenses.push(restoredExpense);
        localStorage.setItem("expenses", JSON.stringify(expenses));
        localStorage.setItem("deletedExpenses", JSON.stringify(deletedExpenses));
        renderExpenses();
        renderDeletedExpenses();
    }

    window.deletePermanently = function(index) {
        deletedExpenses.splice(index, 1);
        localStorage.setItem("deletedExpenses", JSON.stringify(deletedExpenses));
        renderDeletedExpenses();
    }

    deleteAllButton.addEventListener("click", function() {
        deletedExpenses = deletedExpenses.concat(expenses);
        expenses = [];
        localStorage.setItem("expenses", JSON.stringify(expenses));
        localStorage.setItem("deletedExpenses", JSON.stringify(deletedExpenses));
        renderExpenses();
        renderDeletedExpenses();
    });

    expenseForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const expenseName = document.getElementById("expense-name").value;
        const expenseAmount = parseFloat(document.getElementById("expense-amount").value);
        let expenseDate = expenseDateInput.value;

        // Set today's date if the input is empty
        if (!expenseDate) {
            expenseDate = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
        }

        expenses.push({ name: expenseName, amount: expenseAmount, date: expenseDate });
        localStorage.setItem("expenses", JSON.stringify(expenses));

        renderExpenses();
        expenseForm.reset();
    });

    // Set today's date in the date input
    todayButton.addEventListener("click", function() {
        expenseDateInput.value = new Date().toISOString().split("T")[0];
    });

    renderExpenses();
    renderDeletedExpenses();
});
