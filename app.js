/**
 * The function takes a list of users and creates a <ul> (unordered list) in HTML. For each user, it creates a <li> (list item) and adds it to that list.
 * @param {*} users - The function takes one argument called users, whose type can be anything
 */
function generateUserList(users, stocks) {
  const userList = document.querySelector(".user-list");
  userList.innerHTML = "";

  users.map(({ user, id }) => {
    const listItem = document.createElement("li");
    listItem.innerText = `${user.lastname}, ${user.firstname}`;
    listItem.setAttribute("id", id);
    userList.appendChild(listItem);
  });

  // Click handler for the generated list - forwards to selection logic
  userList.addEventListener("click", (event) =>
    handleUserListClick(event, users, stocks),
  );
}

/**
 * Handles the click event on the user list
 * @param {*} event
 * @param {*} users
 * @param {*} stocks
 */
function handleUserListClick(event, users, stocks) {
  const userId = event.target.id;
  const user = users.find((user) => user.id == userId);
  populateForm(user);
  renderPortfolio(user, stocks);
}

/**
 * Populates the form with the user's data
 * @param {*} user
 */
function populateForm(data) {
  const { user, id } = data;
  document.querySelector("#userID").value = id;
  document.querySelector("#firstname").value = user.firstname;
  document.querySelector("#lastname").value = user.lastname;
  document.querySelector("#address").value = user.address;
  document.querySelector("#city").value = user.city;
  document.querySelector("#email").value = user.email;
}

/**
 * This function checks whether the input contains ONLY alphabets (no numbers/symbols)
 * Returns true if valid, false if invalid
 */
function isAlphabetOnly(value) {
  return /^[A-Za-z\s]+$/.test(value);
}

/**
 * Email format check 
 * Returns true if looks like an email, false otherwise
 */
function isEmailFormat(value) {
  // Basic RFC-like check: something@something.something (keeps it simple for client-side validation)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 *  mark an input invalid 
 
 */
function markInvalid(el, focus = false) {
  if (!el) return;
  el.style.border = "2px solid red";
  if (focus) el.focus();
}

/**
 *  clear invalid styling on an element
 */
function clearInvalid(el) {
  if (!el) return;
  el.style.border = "";
}

/**
 * This function validates the firstname and lastname fields whenever the user leaves the input box
 * If invalid, alert is shown and the field becomes blank 
 */
function attachNameValidation() {
  const firstnameField = document.querySelector("#firstname");
  const lastnameField = document.querySelector("#lastname");

  [firstnameField, lastnameField].forEach((field) => {
    if (!field) return;
    field.addEventListener("blur", () => {
      if (field.value && !isAlphabetOnly(field.value)) {
        alert("Please use alphabets only for the name field.");
        field.value = ""; // Clear invalid input
      }
    });
  });
}

/**
 * Render the editable portfolio area for a user.
 * @param {*} user 
 * @param {*} stocks 
 */
function renderPortfolio(user, stocks) {
  const { portfolio } = user;
  const portfolioDetails = document.querySelector(".portfolio-list");
  portfolioDetails.innerHTML = "";

  // Addig Stock editible features
  const addContainer = document.createElement("div");
  addContainer.className = "add-stock-container";


  addContainer.style.display = "flex";
  addContainer.style.flexDirection = "column";
  addContainer.style.gap = "6px";
  addContainer.style.marginBottom = "12px";

  const stockSelect = document.createElement("select");
  stockSelect.setAttribute("aria-label", "Select stock to add");
  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.innerText = "-- Select stock --";
  stockSelect.appendChild(defaultOpt);

  stocks.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.symbol;
    opt.innerText = `${s.symbol} — ${s.name}`;
    stockSelect.appendChild(opt);
  });

  const sharesInputNew = document.createElement("input");
  sharesInputNew.type = "number";
  
  sharesInputNew.placeholder = "Shares";
  sharesInputNew.style.width = "100px";

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.innerText = "Add Stock";

  addContainer.appendChild(stockSelect);
  addContainer.appendChild(sharesInputNew);
  addContainer.appendChild(addBtn);

  portfolioDetails.appendChild(addContainer);

  addBtn.addEventListener("click", () => {
    const chosenSymbol = stockSelect.value;
    const sharesVal = sharesInputNew.value ? parseInt(sharesInputNew.value, 10) : 0;

    if (!chosenSymbol) {
      alert("Please select a stock symbol to add.");
      return;
    }

    const existingSymbols = Array.from(
      portfolioDetails.querySelectorAll(".portfolio-row .symbol-text")
    ).map((el) => el.innerText);

    if (existingSymbols.includes(chosenSymbol)) {
      alert("This stock is already in the portfolio.");
      return;
    }

    const row = createPortfolioRow(chosenSymbol, sharesVal, stocks, portfolioDetails);
    portfolioDetails.appendChild(row);

    stockSelect.value = "";
    sharesInputNew.value = "";
  });

  portfolio.forEach(({ symbol, owned }) => {
    const row = createPortfolioRow(symbol, owned, stocks, portfolioDetails);
    portfolioDetails.appendChild(row);
  });

  function createPortfolioRow(symbol, shares, stocksRef, container) {
    const row = document.createElement("div");
    row.className = "portfolio-row";

 
    row.style.display = "flex";
    row.style.flexDirection = "column";
    row.style.gap = "4px";
    row.style.padding = "6px 0";

    const symbolEl = document.createElement("span");
    symbolEl.className = "symbol-text";
    symbolEl.innerText = symbol;
    symbolEl.style.fontWeight = "600";

    const sharesEl = document.createElement("input");
    sharesEl.type = "number";
    sharesEl.min = "0";
    sharesEl.className = "shares-input";
    sharesEl.value = shares;
    sharesEl.style.width = "100px";

    const btnRow = document.createElement("div");
    btnRow.style.display = "flex";
    btnRow.style.gap = "6px";

    const viewBtn = document.createElement("button");
    viewBtn.type = "button";
    viewBtn.innerText = "View";
    viewBtn.addEventListener("click", () => {
      viewStock(symbol, stocksRef);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.innerText = "Delete";
    deleteBtn.addEventListener("click", () => row.remove());

    btnRow.appendChild(viewBtn);
    btnRow.appendChild(deleteBtn);

    row.appendChild(symbolEl);
    row.appendChild(sharesEl);
    row.appendChild(btnRow);

    return row;
  }
}

/**
 * This function will take in a symbol and render the stock information for that symbol
 * @param {*} symbol
 * @param {*} stocks
 */
function viewStock(symbol, stocks) {
  const stockArea = document.querySelector(".stock-form");
  if (stockArea) {
    const stock = stocks.find((s) => s.symbol == symbol);
    if (!stock) return;
    document.querySelector("#stockName").textContent = stock.name;
    document.querySelector("#stockSector").textContent = stock.sector;
    document.querySelector("#stockIndustry").textContent = stock.subIndustry;
    document.querySelector("#stockAddress").textContent = stock.address;
    document.querySelector("#logo").src = `logos/${symbol}.svg`;
  }
}

// ---------------- MAIN INITIALIZATION -----------------
document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "is5600_lab02_userData";
  const STOCKS_KEY = "is5600_lab02_stocksData";

  const storage = window.sessionStorage;
  storage.removeItem(STORAGE_KEY);
  storage.removeItem(STOCKS_KEY);

  let userData = null;
  let stocksData = null;

  userData = JSON.parse(userContent);
  stocksData = JSON.parse(stockContent);

  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", (e) => e.preventDefault());
  }

  function findButton(selectorCandidates, textFallbackRegex) {
    for (const s of selectorCandidates) {
      const el = document.querySelector(s);
      if (el) return el;
    }
    if (textFallbackRegex) {
      const btns = Array.from(document.querySelectorAll("button"));
      return btns.find((b) => textFallbackRegex.test(b.textContent.trim()));
    }
    return null;
  }

  const saveButton = findButton(
    ["#save", "button[name='save']", "button.save", "input#save[type='button']"],
    /^save$/i
  );
  const deleteButton = findButton(
    ["#delete", "button[name='delete']", "button.delete", "input#delete[type='button']"],
    /^delete$/i
  );

  generateUserList(userData, stocksData);
  attachNameValidation();

  //Add a "New User" button above user list
  
  const userListContainer = document.querySelector(".user-list").parentElement;
  const newUserBtn = document.createElement("button");
  newUserBtn.innerText = "+ Add New User";
  newUserBtn.style.marginBottom = "8px";
  newUserBtn.style.display = "block";
  newUserBtn.style.width = "100%";
  newUserBtn.style.background = "#007bff";
  newUserBtn.style.color = "white";
  newUserBtn.style.padding = "6px";
  newUserBtn.style.border = "none";
  newUserBtn.style.cursor = "pointer";


  userListContainer.prepend(newUserBtn);

  newUserBtn.addEventListener("click", () => {
    const fields = ["#userID", "#firstname", "#lastname", "#address", "#city", "#email"];
    fields.forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.value = "";
        clearInvalid(el);
      }
    });

    const portfolioList = document.querySelector(".portfolio-list");
    if (portfolioList) portfolioList.innerHTML = "";

   
  });



  if (deleteButton) {
    deleteButton.addEventListener("click", (event) => {
      event.preventDefault();

      const userId = document.querySelector("#userID")?.value;
      if (!userId) return;

      const idx = userData.findIndex((u) => u.id == userId);
      if (idx === -1) return;

      userData.splice(idx, 1);
      storage.setItem(STORAGE_KEY, JSON.stringify(userData));
      generateUserList(userData, stocksData);

      const clear = (sel) => {
        const el = document.querySelector(sel);
        if (el) el.value = "";
      };
      clear("#userID");
      clear("#firstname");
      clear("#lastname");
      clear("#address");
      clear("#city");
      clear("#email");

      const portfolioList = document.querySelector(".portfolio-list");
      if (portfolioList) portfolioList.innerHTML = "";
    });
  }

  if (saveButton) {
    saveButton.addEventListener("click", (event) => {
      event.preventDefault();

      const getEl = (sel) => document.querySelector(sel);
      const getVal = (sel) => getEl(sel)?.value || "";

      ["#firstname", "#lastname", "#address", "#city", "#email"].forEach((sel) => {
        clearInvalid(getEl(sel));
      });

      const idField = getEl("#userID");
      const idVal = idField?.value || "";
      const firstname = getVal("#firstname").trim();
      const lastname = getVal("#lastname").trim();
      const address = getVal("#address").trim();
      const city = getVal("#city").trim();
      const email = getVal("#email").trim();

      if (!firstname) {
        alert("First Name cannot be empty");
        markInvalid(getEl("#firstname"), true);
        return;
      }
      if (!lastname) {
        alert("Last Name cannot be empty");
        markInvalid(getEl("#lastname"), true);
        return;
      }
      if (!email) {
        alert("Email cannot be empty");
        markInvalid(getEl("#email"), true);
        return;
      }

      if (firstname.length > 20) {
        alert("First Name must be 20 characters or fewer.");
        markInvalid(getEl("#firstname"), true);
        return;
      }
      if (lastname.length > 20) {
        alert("Last Name must be 20 characters or fewer.");
        markInvalid(getEl("#lastname"), true);
        return;
      }
      if (address.length > 50) {
        alert("Address must be 50 characters or fewer.");
        markInvalid(getEl("#address"), true);
        return;
      }
      if (city.length > 25) {
        alert("City must be 25 characters or fewer.");
        markInvalid(getEl("#city"), true);
        return;
      }
      if (email.length > 40) {
        alert("Email must be 40 characters or fewer.");
        markInvalid(getEl("#email"), true);
        return;
      }

      if (!isAlphabetOnly(firstname)) {
        alert("First Name must contain alphabets only.");
        markInvalid(getEl("#firstname"), true);
        return;
      }
      if (!isAlphabetOnly(lastname)) {
        alert("Last Name must contain alphabets only.");
        markInvalid(getEl("#lastname"), true);
        return;
      }

      if (!isEmailFormat(email)) {
        alert("Please enter a valid email address (e.g., user@example.com).");
        markInvalid(getEl("#email"), true);
        return;
      }

      const portfolioDetails = document.querySelector(".portfolio-list");
      const portfolioRows = portfolioDetails
        ? Array.from(portfolioDetails.querySelectorAll(".portfolio-row"))
        : [];
      const builtPortfolio = [];

      for (const row of portfolioRows) {
        const symbolEl = row.querySelector(".symbol-text");
        const sharesInput = row.querySelector(".shares-input");

        if (!symbolEl || !sharesInput) continue;

        const symbol = symbolEl.innerText;
        const sharesRaw = sharesInput.value;
        const sharesNum =
          sharesRaw === "" ? 0 : parseInt(sharesRaw, 10);

        if (sharesRaw !== "" && (isNaN(sharesNum) || sharesNum < 0)) {
          alert(`Invalid shares for ${symbol}. Please enter a non-negative integer.`);
          sharesInput.focus();
          markInvalid(sharesInput, true);
          return;
        }

        builtPortfolio.push({ symbol: symbol, owned: sharesNum });
      }

      if (!idVal) {
        const existingIds = userData
          .map((u) => parseInt(u.id, 10))
          .filter((v) => !isNaN(v));
        const maxId = existingIds.length ? Math.max(...existingIds) : 0;
        const newId = String(maxId + 1);

        const newUser = {
          id: newId,
          user: {
            firstname: firstname,
            lastname: lastname,
            address: address,
            city: city,
            email: email,
          },
          portfolio: builtPortfolio,
        };

        userData.push(newUser);
        storage.setItem(STORAGE_KEY, JSON.stringify(userData));
        generateUserList(userData, stocksData);
        populateForm(newUser);
        renderPortfolio(newUser, stocksData);
      } else {
        const idx = userData.findIndex((u) => u.id == idVal);
        if (idx === -1) {
          alert("Selected user not found.");
          return;
        }

        userData[idx].user.firstname = firstname;
        userData[idx].user.lastname = lastname;
        userData[idx].user.address = address;
        userData[idx].user.city = city;
        userData[idx].user.email = email;
        userData[idx].portfolio = builtPortfolio;

        storage.setItem(STORAGE_KEY, JSON.stringify(userData));

        generateUserList(userData, stocksData);
        populateForm(userData[idx]);
        renderPortfolio(userData[idx], stocksData);
      }
    });
  }
});

