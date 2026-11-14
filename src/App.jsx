import { useEffect, useMemo, useState } from "react";
import "./App.css";

function App() {
  // =====================================================
  // ACCOUNT / LOGIN
  // =====================================================

  const [loggedIn, setLoggedIn] = useState(
    Boolean(
      localStorage.getItem("expenseTracerCurrentUser")
    )
  );

  const [isCreatingAccount, setIsCreatingAccount] =
    useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [accountError, setAccountError] = useState("");

  // =====================================================
  // GET USERS
  // =====================================================

  const getUsers = () => {
    try {
      return JSON.parse(
        localStorage.getItem("expenseTracerUsers") || "[]"
      );
    } catch {
      return [];
    }
  };

  // =====================================================
  // SAVE USERS
  // =====================================================

  const saveUsers = (users) => {
    localStorage.setItem(
      "expenseTracerUsers",
      JSON.stringify(users)
    );
  };

  // =====================================================
  // CURRENT USER
  // =====================================================

  const getCurrentUserEmail = () => {
    return localStorage.getItem(
      "expenseTracerCurrentUser"
    );
  };

  // =====================================================
  // STORAGE KEYS
  // =====================================================

  const getTransactionKey = (userEmail) => {
    return `expenseTracer_transactions_${userEmail}`;
  };

  const getWishlistKey = (userEmail) => {
    return `expenseTracer_wishlist_${userEmail}`;
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateName = (value) => {
    if (!value.trim()) {
      return "Name is required.";
    }

    if (value.trim().length < 2) {
      return "Name must contain at least 2 characters.";
    }

    return "";
  };

  const validateEmail = (value) => {
    if (!value.trim()) {
      return "Email address is required.";
    }

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(value.trim())) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  const validatePassword = (value) => {
    if (!value) {
      return "Password is required.";
    }

    if (value.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (!/[A-Z]/.test(value)) {
      return "Password must contain an uppercase letter.";
    }

    if (!/[a-z]/.test(value)) {
      return "Password must contain a lowercase letter.";
    }

    if (!/[0-9]/.test(value)) {
      return "Password must contain a number.";
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]]/.test(value)) {
      return "Password must contain a special character.";
    }

    return "";
  };

  // =====================================================
  // LOAD CURRENT USER WHEN APP STARTS
  // =====================================================

  useEffect(() => {
    const currentEmail =
      localStorage.getItem(
        "expenseTracerCurrentUser"
      );

    if (!currentEmail) {
      return;
    }

    const users = getUsers();

    const currentUser = users.find(
      (user) =>
        user.email.toLowerCase() ===
        currentEmail.toLowerCase()
    );

    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setLoggedIn(true);
    } else {
      localStorage.removeItem(
        "expenseTracerCurrentUser"
      );
      setLoggedIn(false);
    }
  }, []);

  // =====================================================
  // TRANSACTIONS
  // =====================================================

  const [transactions, setTransactions] = useState([]);

  // =====================================================
  // WISHLIST
  // =====================================================

  const [wishlist, setWishlist] = useState([]);

  // =====================================================
  // LOAD USER HISTORY AFTER LOGIN
  // =====================================================

  const loadUserHistory = (userEmail) => {
    if (!userEmail) {
      setTransactions([]);
      setWishlist([]);
      return;
    }

    // -----------------------------
    // TRANSACTIONS
    // -----------------------------

    const transactionKey =
      getTransactionKey(userEmail);

    const savedTransactions =
      localStorage.getItem(transactionKey);

    if (savedTransactions) {
      try {
        setTransactions(
          JSON.parse(savedTransactions)
        );
      } catch {
        setTransactions([]);
      }
    } else {
      // Default transactions for a brand-new account
      const defaultTransactions = [
        {
          id: 1,
          title: "Salary",
          amount: 20000,
          type: "credit",
        },
        {
          id: 2,
          title: "Shopping",
          amount: 3000,
          type: "debit",
        },
        {
          id: 3,
          title: "Food",
          amount: 1500,
          type: "debit",
        },
        {
          id: 4,
          title: "Freelance",
          amount: 5000,
          type: "credit",
        },
      ];

      setTransactions(defaultTransactions);

      localStorage.setItem(
        transactionKey,
        JSON.stringify(defaultTransactions)
      );
    }

    // -----------------------------
    // WISHLIST
    // -----------------------------

    const wishlistKey =
      getWishlistKey(userEmail);

    const savedWishlist =
      localStorage.getItem(wishlistKey);

    if (savedWishlist) {
      try {
        setWishlist(
          JSON.parse(savedWishlist)
        );
      } catch {
        setWishlist([]);
      }
    } else {
      // Default wishlist for a brand-new account
      const defaultWishlist = [
        {
          id: 1,
          name: "New Shoes",
          amount: 4000,
        },
        {
          id: 2,
          name: "Headphones",
          amount: 2500,
        },
      ];

      setWishlist(defaultWishlist);

      localStorage.setItem(
        wishlistKey,
        JSON.stringify(defaultWishlist)
      );
    }
  };

  // =====================================================
  // SAVE TRANSACTIONS AUTOMATICALLY
  // =====================================================

  useEffect(() => {
    const currentEmail =
      localStorage.getItem(
        "expenseTracerCurrentUser"
      );

    if (!currentEmail || !loggedIn) {
      return;
    }

    localStorage.setItem(
      getTransactionKey(currentEmail),
      JSON.stringify(transactions)
    );
  }, [transactions, loggedIn]);

  // =====================================================
  // SAVE WISHLIST AUTOMATICALLY
  // =====================================================

  useEffect(() => {
    const currentEmail =
      localStorage.getItem(
        "expenseTracerCurrentUser"
      );

    if (!currentEmail || !loggedIn) {
      return;
    }

    localStorage.setItem(
      getWishlistKey(currentEmail),
      JSON.stringify(wishlist)
    );
  }, [wishlist, loggedIn]);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = (e) => {
    e.preventDefault();

    const nameValidation =
      validateName(name);

    const emailValidation =
      validateEmail(email);

    const passwordValidation =
      validatePassword(password);

    setNameError(nameValidation);
    setEmailError(emailValidation);
    setPasswordError(passwordValidation);
    setAccountError("");

    if (
      nameValidation ||
      emailValidation ||
      passwordValidation
    ) {
      return;
    }

    const users = getUsers();

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser = users.find(
      (user) =>
        user.email.toLowerCase() ===
        normalizedEmail
    );

    // ACCOUNT DOES NOT EXIST
    if (!existingUser) {
      setAccountError(
        "Account not found. Please create an account first."
      );
      return;
    }

    // NAME DOES NOT MATCH
    if (
      existingUser.name.trim().toLowerCase() !==
      name.trim().toLowerCase()
    ) {
      setAccountError(
        "Name does not match this account."
      );
      return;
    }

    // PASSWORD DOES NOT MATCH
    if (existingUser.password !== password) {
      setAccountError(
        "Incorrect password. Please try again."
      );
      return;
    }

    // SAVE CURRENT LOGIN
    localStorage.setItem(
      "expenseTracerCurrentUser",
      normalizedEmail
    );

    // SET USER INFORMATION
    setName(existingUser.name);
    setEmail(existingUser.email);

    // LOAD THIS USER'S HISTORY
    loadUserHistory(normalizedEmail);

    // LOGIN
    setLoggedIn(true);

    // CLEAR ERRORS
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setAccountError("");
  };

  // =====================================================
  // CREATE ACCOUNT
  // =====================================================

  const handleCreateAccount = (e) => {
    e.preventDefault();

    const nameValidation =
      validateName(name);

    const emailValidation =
      validateEmail(email);

    const passwordValidation =
      validatePassword(password);

    setNameError(nameValidation);
    setEmailError(emailValidation);
    setPasswordError(passwordValidation);
    setAccountError("");

    if (
      nameValidation ||
      emailValidation ||
      passwordValidation
    ) {
      return;
    }

    const users = getUsers();

    const normalizedEmail =
      email.trim().toLowerCase();

    // CHECK EXISTING ACCOUNT
    const accountAlreadyExists =
      users.some(
        (user) =>
          user.email.toLowerCase() ===
          normalizedEmail
      );

    if (accountAlreadyExists) {
      setAccountError(
        "An account with this email already exists. Please login."
      );
      return;
    }

    // CREATE ACCOUNT
    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      password: password,
    };

    const updatedUsers = [
      ...users,
      newUser,
    ];

    saveUsers(updatedUsers);

    // CREATE EMPTY HISTORY FOR NEW ACCOUNT
    localStorage.setItem(
      getTransactionKey(normalizedEmail),
      JSON.stringify([
        {
          id: Date.now() + 1,
          title: "Salary",
          amount: 20000,
          type: "credit",
        },
        {
          id: Date.now() + 2,
          title: "Shopping",
          amount: 3000,
          type: "debit",
        },
        {
          id: Date.now() + 3,
          title: "Food",
          amount: 1500,
          type: "debit",
        },
        {
          id: Date.now() + 4,
          title: "Freelance",
          amount: 5000,
          type: "credit",
        },
      ])
    );

    localStorage.setItem(
      getWishlistKey(normalizedEmail),
      JSON.stringify([
        {
          id: Date.now() + 5,
          name: "New Shoes",
          amount: 4000,
        },
        {
          id: Date.now() + 6,
          name: "Headphones",
          amount: 2500,
        },
      ])
    );

    // CLEAR FORM
    setName("");
    setEmail("");
    setPassword("");

    setNameError("");
    setEmailError("");
    setPasswordError("");
    setAccountError("");

    // BACK TO LOGIN
    setIsCreatingAccount(false);

    alert(
      "Account created successfully. Please login."
    );
  };

  // =====================================================
  // SWITCH TO CREATE ACCOUNT
  // =====================================================

  const switchToCreateAccount = () => {
    setIsCreatingAccount(true);

    setName("");
    setEmail("");
    setPassword("");

    setNameError("");
    setEmailError("");
    setPasswordError("");
    setAccountError("");
  };

  // =====================================================
  // SWITCH TO LOGIN
  // =====================================================

  const switchToLogin = () => {
    setIsCreatingAccount(false);

    setName("");
    setEmail("");
    setPassword("");

    setNameError("");
    setEmailError("");
    setPasswordError("");
    setAccountError("");
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    // IMPORTANT:
    // Remove ONLY current login session.
    // DO NOT remove transactions.
    // DO NOT remove wishlist.
    // DO NOT remove accounts.

    localStorage.removeItem(
      "expenseTracerCurrentUser"
    );

    setLoggedIn(false);

    setName("");
    setEmail("");
    setPassword("");

    setNameError("");
    setEmailError("");
    setPasswordError("");
    setAccountError("");

    setTransactions([]);
    setWishlist([]);

    setIsCreatingAccount(false);
  };

  // =====================================================
  // TRANSACTION FORM
  // =====================================================

  const [transactionTitle, setTransactionTitle] =
    useState("");

  const [transactionAmount, setTransactionAmount] =
    useState("");

  const [transactionType, setTransactionType] =
    useState("debit");

  const [showTransactionModal, setShowTransactionModal] =
    useState(false);

  // =====================================================
  // WISHLIST FORM
  // =====================================================

  const [wishlistName, setWishlistName] =
    useState("");

  const [wishlistAmount, setWishlistAmount] =
    useState("");

  // =====================================================
  // MONEY CALCULATION
  // =====================================================

  const totalCredit = useMemo(() => {
    return transactions
      .filter(
        (transaction) =>
          transaction.type === "credit"
      )
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0
      );
  }, [transactions]);

  const totalDebit = useMemo(() => {
    return transactions
      .filter(
        (transaction) =>
          transaction.type === "debit"
      )
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0
      );
  }, [transactions]);

  const balance =
    totalCredit - totalDebit;

  const creditPercent =
    totalCredit + totalDebit === 0
      ? 50
      : (totalCredit /
          (totalCredit + totalDebit)) *
        100;

  // =====================================================
  // ADD TRANSACTION
  // =====================================================

  const handleAddTransaction = (e) => {
    e.preventDefault();

    const amount =
      Number(transactionAmount);

    if (
      !transactionTitle.trim() ||
      amount <= 0
    ) {
      return;
    }

    const newTransaction = {
      id: Date.now(),
      title: transactionTitle.trim(),
      amount,
      type: transactionType,
    };

    setTransactions((prev) => [
      newTransaction,
      ...prev,
    ]);

    setTransactionTitle("");
    setTransactionAmount("");
    setTransactionType("debit");

    setShowTransactionModal(false);
  };

  // =====================================================
  // ADD WISHLIST
  // =====================================================

  const handleAddWishlist = (e) => {
    e.preventDefault();

    const amount =
      Number(wishlistAmount);

    if (
      !wishlistName.trim() ||
      amount <= 0
    ) {
      return;
    }

    const newWishlist = {
      id: Date.now(),
      name: wishlistName.trim(),
      amount,
    };

    setWishlist((prev) => [
      newWishlist,
      ...prev,
    ]);

    setWishlistName("");
    setWishlistAmount("");
  };

  // =====================================================
  // DELETE WISHLIST
  // =====================================================

  const deleteWishlist = (id) => {
    setWishlist((prev) =>
      prev.filter(
        (item) =>
          item.id !== id
      )
    );
  };

  // =====================================================
  // LOGIN FORM VALID
  // =====================================================

  const formValid =
    name.trim() !== "" &&
    email.trim() !== "" &&
    password !== "" &&
    !validateName(name) &&
    !validateEmail(email) &&
    !validatePassword(password);

  // =====================================================
  // LOGIN / CREATE ACCOUNT PAGE
  // =====================================================

  if (!loggedIn) {
    return (
      <main className="login-page">

        <div className="background-shape shape-one"></div>
        <div className="background-shape shape-two"></div>

        <section className="login-container">

          <header className="login-header">

            <div className="app-logo">
              ₹
            </div>

            <h1>
              Expense Tracer
            </h1>

            <p>
              Manage your expenses securely
            </p>

          </header>

          <div className="login-card">

            <div className="card-header">

              <h2>
                {isCreatingAccount
                  ? "Create Account"
                  : "Welcome Back"}
              </h2>

              <p>
                {isCreatingAccount
                  ? "Create your Expense Tracer account"
                  : "Sign in to continue to your account"}
              </p>

            </div>

            <form
              onSubmit={
                isCreatingAccount
                  ? handleCreateAccount
                  : handleLogin
              }
              noValidate
            >

              {/* NAME */}

              <div className="form-group">

                <label htmlFor="name">
                  Name
                  <span>*</span>
                </label>

                <div
                  className={`input-container ${
                    nameError
                      ? "has-error"
                      : ""
                  }`}
                >

                  <span className="input-icon">
                    👤
                  </span>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const value =
                        e.target.value;

                      setName(value);

                      if (value) {
                        setNameError(
                          validateName(value)
                        );
                      } else {
                        setNameError("");
                      }

                      setAccountError("");
                    }}
                    placeholder="Enter your name"
                    autoComplete="name"
                    required
                  />

                </div>

                {nameError && (
                  <p className="error-message">
                    {nameError}
                  </p>
                )}

              </div>

              {/* EMAIL */}

              <div className="form-group">

                <label htmlFor="email">
                  Email Address
                  <span>*</span>
                </label>

                <div
                  className={`input-container ${
                    emailError
                      ? "has-error"
                      : ""
                  }`}
                >

                  <span className="input-icon">
                    ✉
                  </span>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const value =
                        e.target.value;

                      setEmail(value);

                      if (value) {
                        setEmailError(
                          validateEmail(value)
                        );
                      } else {
                        setEmailError("");
                      }

                      setAccountError("");
                    }}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />

                </div>

                {emailError && (
                  <p className="error-message">
                    {emailError}
                  </p>
                )}

              </div>

              {/* PASSWORD */}

              <div className="form-group">

                <div className="label-row">

                  <label htmlFor="password">
                    Password
                    <span>*</span>
                  </label>

                  <button
                    type="button"
                    className="show-password"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

                <div
                  className={`input-container ${
                    passwordError
                      ? "has-error"
                      : ""
                  }`}
                >

                  <span className="input-icon">
                    🔒
                  </span>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) => {
                      const value =
                        e.target.value;

                      setPassword(value);

                      if (value) {
                        setPasswordError(
                          validatePassword(value)
                        );
                      } else {
                        setPasswordError("");
                      }

                      setAccountError("");
                    }}
                    placeholder="Enter your password"
                    autoComplete={
                      isCreatingAccount
                        ? "new-password"
                        : "current-password"
                    }
                    required
                  />

                </div>

                {passwordError && (
                  <p className="error-message">
                    {passwordError}
                  </p>
                )}

                {password && (
                  <div className="password-requirements">

                    <p
                      className={
                        password.length >= 8
                          ? "requirement valid"
                          : "requirement"
                      }
                    >
                      <span>
                        {password.length >= 8
                          ? "✓"
                          : "○"}
                      </span>
                      8 or more characters
                    </p>

                    <p
                      className={
                        /[A-Z]/.test(password)
                          ? "requirement valid"
                          : "requirement"
                      }
                    >
                      <span>
                        {/[A-Z]/.test(password)
                          ? "✓"
                          : "○"}
                      </span>
                      One uppercase letter
                    </p>

                    <p
                      className={
                        /[a-z]/.test(password)
                          ? "requirement valid"
                          : "requirement"
                      }
                    >
                      <span>
                        {/[a-z]/.test(password)
                          ? "✓"
                          : "○"}
                      </span>
                      One lowercase letter
                    </p>

                    <p
                      className={
                        /[0-9]/.test(password)
                          ? "requirement valid"
                          : "requirement"
                      }
                    >
                      <span>
                        {/[0-9]/.test(password)
                          ? "✓"
                          : "○"}
                      </span>
                      One number
                    </p>

                    <p
                      className={
                        /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]]/.test(
                          password
                        )
                          ? "requirement valid"
                          : "requirement"
                      }
                    >
                      <span>
                        {/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]]/.test(
                          password
                        )
                          ? "✓"
                          : "○"}
                      </span>
                      One special character
                    </p>

                  </div>
                )}

              </div>

              {/* ACCOUNT ERROR */}

              {accountError && (
                <p
                  className="error-message"
                  style={{
                    marginBottom: "15px",
                  }}
                >
                  {accountError}
                </p>
              )}

              {/* OPTIONS */}

              {!isCreatingAccount && (
                <div className="form-options">

                  <label className="remember-me">

                    <input
                      type="checkbox"
                    />

                    <span>
                      Remember me
                    </span>

                  </label>

                  <button
                    type="button"
                    className="forgot-button"
                    onClick={() =>
                      alert(
                        "Password recovery is not available in localStorage authentication."
                      )
                    }
                  >
                    Forgot password?
                  </button>

                </div>
              )}

              {/* LOGIN / CREATE BUTTON */}

              <button
                type="submit"
                className={`login-button ${
                  formValid
                    ? "active"
                    : ""
                }`}
                disabled={!formValid}
              >

                <span>
                  {isCreatingAccount
                    ? "Create Account"
                    : "Login"}
                </span>

                <span className="arrow">
                  →
                </span>

              </button>

            </form>

            {/* SWITCH */}

            <div className="create-account">

              {isCreatingAccount ? (
                <>
                  <span>
                    Already have an account?
                  </span>

                  <button
                    type="button"
                    onClick={
                      switchToLogin
                    }
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  <span>
                    Don't have an account?
                  </span>

                  <button
                    type="button"
                    onClick={
                      switchToCreateAccount
                    }
                  >
                    Create Account
                  </button>
                </>
              )}

            </div>

          </div>

          <footer className="login-footer">

            <span>
              🔒
            </span>

            Your information is securely protected

          </footer>

        </section>

      </main>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <main className="dashboard-page">

      <div className="background-shape dashboard-shape-one"></div>
      <div className="background-shape dashboard-shape-two"></div>

      <section className="dashboard-container">

        {/* HEADER */}

        <header className="dashboard-header">

          <div className="brand-section">

            <div className="dashboard-logo">
              ₹
            </div>

            <div>

              <h1>
                Expense Tracer
              </h1>

              <p>
                Personal Finance Dashboard
              </p>

            </div>

          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </header>

        {/* WELCOME */}

        <section className="welcome-section">

          <div>

            <p className="welcome-small">
              Welcome back, {name} 👋
            </p>

            <h2>
              Manage your money wisely
            </h2>

            <p>
              Track your income, expenses and
              plan your future purchases.
            </p>

          </div>

          <button
            className="add-transaction-button"
            onClick={() =>
              setShowTransactionModal(true)
            }
          >
            + Add Transaction
          </button>

        </section>

        {/* SUMMARY */}

        <section className="summary-grid">

          {/* BALANCE */}

          <div className="summary-card">

            <div className="summary-card-top">

              <div>

                <p className="summary-label">
                  Available Balance
                </p>

                <h3>
                  ₹
                  {balance.toLocaleString(
                    "en-IN"
                  )}
                </h3>

              </div>

              <div className="summary-icon balance-icon">
                ₹
              </div>

            </div>

            <p className="summary-description">
              Money available for spending
            </p>

          </div>

          {/* CREDIT */}

          <div className="summary-card">

            <div className="summary-card-top">

              <div>

                <p className="summary-label">
                  Total Credit
                </p>

                <h3 className="credit-text">
                  +₹
                  {totalCredit.toLocaleString(
                    "en-IN"
                  )}
                </h3>

              </div>

              <div className="summary-icon credit-icon">
                ↑
              </div>

            </div>

            <p className="summary-description">
              Total money received
            </p>

          </div>

          {/* DEBIT */}

          <div className="summary-card">

            <div className="summary-card-top">

              <div>

                <p className="summary-label">
                  Total Debit
                </p>

                <h3 className="debit-text">
                  -₹
                  {totalDebit.toLocaleString(
                    "en-IN"
                  )}
                </h3>

              </div>

              <div className="summary-icon debit-icon">
                ↓
              </div>

            </div>

            <p className="summary-description">
              Total money spent
            </p>

          </div>

        </section>

        {/* CHART + WISHLIST */}

        <section className="dashboard-main-grid">

          {/* CHART */}

          <div className="dashboard-card chart-card">

            <div className="section-heading">

              <div>

                <h3>
                  Expense Overview
                </h3>

                <p>
                  Credit and debit summary
                </p>

              </div>

            </div>

            <div className="chart-content">

              <div
                className="donut-chart"
                style={{
                  background: `conic-gradient(
                    #16a34a 0 ${creditPercent}%,
                    #dc2626 ${creditPercent}% 100%
                  )`,
                }}
              >

                <div className="donut-center">

                  <strong>
                    ₹
                    {Math.max(
                      balance,
                      0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                  <span>
                    Balance
                  </span>

                </div>

              </div>

              <div className="chart-details">

                <div className="chart-detail-item">

                  <span className="chart-dot credit-dot"></span>

                  <div>

                    <span>
                      Credit
                    </span>

                    <strong className="credit-text">
                      ₹
                      {totalCredit.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                </div>

                <div className="chart-detail-item">

                  <span className="chart-dot debit-dot"></span>

                  <div>

                    <span>
                      Debit
                    </span>

                    <strong className="debit-text">
                      ₹
                      {totalDebit.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* WISHLIST FORM */}

          <div className="dashboard-card wishlist-card">

            <div className="section-heading">

              <div>

                <h3>
                  🛍️ Wishlist
                </h3>

                <p>
                  Plan your future purchases
                </p>

              </div>

            </div>

            <form
              className="wishlist-form"
              onSubmit={handleAddWishlist}
            >

              <div className="wishlist-input-group">

                <label>
                  Product name
                </label>

                <input
                  type="text"
                  value={wishlistName}
                  onChange={(e) =>
                    setWishlistName(
                      e.target.value
                    )
                  }
                  placeholder="e.g. New Shoes"
                />

              </div>

              <div className="wishlist-input-group">

                <label>
                  Required amount
                </label>

                <input
                  type="number"
                  min="1"
                  value={wishlistAmount}
                  onChange={(e) =>
                    setWishlistAmount(
                      e.target.value
                    )
                  }
                  placeholder="₹ Amount"
                />

              </div>

              <button
                type="submit"
                className="wishlist-add-button"
              >
                + Add to Wishlist
              </button>

            </form>

          </div>

        </section>

        {/* WISHLIST HISTORY */}

        <section className="dashboard-card wishlist-list-card">

          <div className="section-heading">

            <div>

              <h3>
                Wishlist & Expense Control
              </h3>

              <p>
                Check whether you can afford
                your planned purchases.
              </p>

            </div>

          </div>

          <div className="wishlist-list">

            {wishlist.length === 0 ? (

              <div className="empty-wishlist">
                Your wishlist is empty.
              </div>

            ) : (

              wishlist.map((item) => {

                const requiredAmount =
                  item.amount;

                const availableMoney =
                  Math.max(
                    balance,
                    0
                  );

                const savedAmount =
                  Math.min(
                    availableMoney,
                    requiredAmount
                  );

                const progress =
                  requiredAmount > 0
                    ? Math.min(
                        (savedAmount /
                          requiredAmount) *
                          100,
                        100
                      )
                    : 0;

                const remaining =
                  Math.max(
                    requiredAmount -
                      availableMoney,
                    0
                  );

                const canAfford =
                  availableMoney >=
                  requiredAmount;

                return (
                  <div
                    className={`wishlist-item ${
                      canAfford
                        ? "wishlist-affordable"
                        : "wishlist-warning"
                    }`}
                    key={item.id}
                  >

                    <div className="wishlist-item-top">

                      <div className="wishlist-product">

                        <div className="wishlist-product-icon">
                          🛍️
                        </div>

                        <div>

                          <h4>
                            {item.name}
                          </h4>

                          <p>
                            Required: ₹
                            {requiredAmount.toLocaleString(
                              "en-IN"
                            )}
                          </p>

                        </div>

                      </div>

                      <button
                        className="wishlist-delete"
                        onClick={() =>
                          deleteWishlist(
                            item.id
                          )
                        }
                      >
                        ×
                      </button>

                    </div>

                    <div className="wishlist-progress-area">

                      <div className="wishlist-progress-info">

                        <span>
                          Available: ₹
                          {availableMoney.toLocaleString(
                            "en-IN"
                          )}
                        </span>

                        <strong>
                          {Math.round(
                            progress
                          )}
                          %
                        </strong>

                      </div>

                      <div className="wishlist-progress">

                        <div
                          className="wishlist-progress-fill"
                          style={{
                            width:
                              `${progress}%`,
                          }}
                        ></div>

                      </div>

                    </div>

                    {canAfford ? (

                      <div className="wishlist-message success-message">

                        <span>
                          ✓
                        </span>

                        <div>

                          <strong>
                            You can afford this!
                          </strong>

                          <p>
                            You have enough
                            money for this
                            purchase.
                          </p>

                        </div>

                      </div>

                    ) : (

                      <div className="wishlist-message warning-message">

                        <span>
                          ⚠️
                        </span>

                        <div>

                          <strong>
                            Control your expenses
                          </strong>

                          <p>
                            You need ₹
                            {remaining.toLocaleString(
                              "en-IN"
                            )}{" "}
                            more for this
                            purchase.
                          </p>

                        </div>

                      </div>

                    )}

                  </div>
                );
              })

            )}

          </div>

        </section>

        {/* TRANSACTION HISTORY */}

        <section className="dashboard-card transactions-card">

          <div className="transactions-header">

            <div>

              <h3>
                Recent Transactions
              </h3>

              <p>
                Your latest income and expenses
              </p>

            </div>

          </div>

          <div className="transactions-list">

            {transactions.length === 0 ? (

              <div className="empty-wishlist">
                No transactions available.
              </div>

            ) : (

              transactions.map(
                (transaction) => (

                  <div
                    className="transaction-item"
                    key={transaction.id}
                  >

                    <div className="transaction-left">

                      <div
                        className={`transaction-icon ${
                          transaction.type ===
                          "credit"
                            ? "transaction-credit"
                            : "transaction-debit"
                        }`}
                      >
                        {transaction.type ===
                        "credit"
                          ? "↑"
                          : "↓"}
                      </div>

                      <div className="transaction-info">

                        <strong>
                          {transaction.title}
                        </strong>

                        <span>
                          {transaction.type ===
                          "credit"
                            ? "Money received"
                            : "Money spent"}
                        </span>

                      </div>

                    </div>

                    <strong
                      className={
                        transaction.type ===
                        "credit"
                          ? "amount-credit"
                          : "amount-debit"
                      }
                    >
                      {transaction.type ===
                      "credit"
                        ? "+"
                        : "-"}
                      ₹
                      {transaction.amount.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                )
              )

            )}

          </div>

        </section>

        <footer className="dashboard-footer">
          💙 Spend wisely. Save for what matters.
        </footer>

      </section>

      {/* ADD TRANSACTION MODAL */}

      {showTransactionModal && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowTransactionModal(false)
          }
        >

          <div
            className="transaction-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <h3>
                  Add Transaction
                </h3>

                <p>
                  Record your credit or debit
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowTransactionModal(false)
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleAddTransaction
              }
            >

              <div className="modal-form-group">

                <label>
                  Transaction name
                </label>

                <input
                  type="text"
                  value={transactionTitle}
                  onChange={(e) =>
                    setTransactionTitle(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Salary, Food"
                />

              </div>

              <div className="modal-form-group">

                <label>
                  Amount
                </label>

                <input
                  type="number"
                  min="1"
                  value={transactionAmount}
                  onChange={(e) =>
                    setTransactionAmount(
                      e.target.value
                    )
                  }
                  placeholder="₹ Amount"
                />

              </div>

              <div className="modal-form-group">

                <label>
                  Transaction Type
                </label>

                <div className="transaction-type-selector">

                  <button
                    type="button"
                    className={
                      transactionType ===
                      "credit"
                        ? "type-option selected-credit"
                        : "type-option"
                    }
                    onClick={() =>
                      setTransactionType(
                        "credit"
                      )
                    }
                  >
                    ↑ Credit
                  </button>

                  <button
                    type="button"
                    className={
                      transactionType ===
                      "debit"
                        ? "type-option selected-debit"
                        : "type-option"
                    }
                    onClick={() =>
                      setTransactionType(
                        "debit"
                      )
                    }
                  >
                    ↓ Debit
                  </button>

                </div>

              </div>

              <button
                type="submit"
                className="modal-submit-button"
              >
                Add Transaction
              </button>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}

export default App;