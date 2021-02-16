const html = document.querySelector("html")
const checkbox = document.querySelector("input[name=theme]")

const Modal = {
  titleStatus: document.querySelector('.modal-title'),
  textStatus: document.querySelector('.modal-text'),
  modalStatus: document.querySelector('.show-result'),

  toggleTransaction() {
    document
      .querySelector('.modal-overlay')
      .classList.toggle('active')
  },
  toggleResult() {
    document
      .querySelector('.modal-result')
      .classList.toggle('active')
  },

  statusError() {
    Modal.modalStatus.classList.add('error')
    Modal.titleStatus.innerText = "Erro!"
    Modal.textStatus.innerText = error.message
  },
  
  statusSuccess() {
    Modal.modalStatus.classList.remove('error')
    Modal.modalStatus.classList.add('success')
    Modal.titleStatus.innerText = "Sucesso!"
    Modal.textStatus.innerText = "Parabéns, transação adicionada."
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [] 
  },

  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  }
}

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction)

    App.reload()
  },

  remove(index) {
    Transaction.all.splice(index, 1)

    App.reload()
  },

  incomes() {
    let income = 0;

    Transaction.all.forEach(transaction => {
      if( transaction.amount > 0 ) {
        income += transaction.amount;
      }
    })

    return income;
  },

  expenses() {
    let expense = 0;

    Transaction.all.forEach(transaction => {
      if( transaction.amount < 0 ) {
        expense += transaction.amount;
      }
    })

    return expense;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses();
  }
}

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),
  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr)
  },
  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense"

    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
      </td> 
    `

    return html
  },
  updateBalance() {
    document
      .getElementById('incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes())
    document
      .getElementById('expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses())
    document
      .getElementById('totalDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.total())
  },
  clearTransaction() {
    DOM.transactionsContainer.innerHTML = ""
  }
}

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : ""
    value = String(value).replace(/\D/g, "")
    value = Number(value) / 100
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })

    return signal + value
  },

  formatAmount(value) {
    value = Number(value) * 100
    return value
  },

  formatDate(date) {
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  getStyle(element, style) {
    return window.getComputedStyle(element).getPropertyValue(style)
  },

  transformKey(key) {
    return "--" + key.replace(/([A-Z])/, "-$1").toLowerCase()
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  checkField(input) {
    if(input.value == '') {
      input.classList.add('error')
    } else {
      input.classList.remove('error')
      input.classList.add('success')
    }
  },

  validateFields() {

    let inputs = [
      inputDescription = Form.description,
      inputAmount = Form.amount,
      inputDate = Form.date,
    ]

    for(let i=0; i<inputs.length; i++) {
      let input = inputs[i]
      Form.checkField(input)
    }

    const { description, amount, date } = Form.getValues()
    
    if( description.trim() === "" || amount.trim() === "" || date.trim() === "" ) {
      throw error = new Error("Por favor, preencha todos os campos")
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)
    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },

  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""

    Form.description.classList.remove('success')
    Form.amount.classList.remove('success')
    Form.date.classList.remove('success')
  },

  submit(event) {
    event.preventDefault()

    try {
      Form.validateFields()
      const transaction =Form.formatValues()
      Transaction.add(transaction)
      Form.clearFields()
      Modal.toggleTransaction()
      Modal.toggleResult()
      Modal.statusSuccess()

    } catch (error) {
      Modal.toggleResult()
      Modal.statusError()
    }
  }
}

const App = {
  init() {

    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index)
    })
    
    DOM.updateBalance()

    changeColors.change()

    Storage.set(Transaction.all)

  },

  reload() {
    DOM.clearTransaction()
    App.init()
  }
}

const initialColors = {
  bg: Utils.getStyle(html, "--bg"),
  bgHeader: Utils.getStyle(html, "--bg-header"),
  bgCard: Utils.getStyle(html, "--bg-card"),
  textCard: Utils.getStyle(html, "--text-card"),
  darkBlue: Utils.getStyle(html, "--dark-blue"),
  bgModal: Utils.getStyle(html, "--bg-modal"),
  inputModal: Utils.getStyle(html, "--input-modal"),
}

const darkMode = {
  bg: "#121214",
  bgHeader: "#121214",
  bgCard: "#202024",
  textCard: "rgb(225, 225, 230)",
  darkBlue: "#969cb3",
  bgModal: "#202024",
  inputModal: "rgb(18, 18, 20)",
}  

const changeColors = {
  set(colors) {
    Object.keys(colors).map(key =>
      html.style.setProperty(Utils.transformKey(key), colors[key])
    )
  },

  change() {
    checkbox.addEventListener("change", ({ target }) => {
      target.checked ? changeColors.set(darkMode) : changeColors.set(initialColors)
    })
  }
}

App.init()