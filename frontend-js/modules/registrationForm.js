import axios from "axios";

export default class RegistrationForm {
  constructor() {
    this._csrf = document.querySelector('[name="_csrf"]').value;
    this.form = document.querySelector("#registration-form");
    this.allFields = document.querySelectorAll(
      "#registration-form .form-control"
    );
    this.insertValidationElements();
    this.username = document.querySelector("#username-register");
    this.username.previousValue = "";
    this.email = document.querySelector("#email-register");
    this.email.previousValue = "";
    this.password = document.querySelector("#password-register");
    this.password.previousValue = "";
    this.username.isUnique = false;
    this.email.isUnique = false;
    this.events();
  }

  // events
  events() {
    this.form.addEventListener("submit", e => {
      e.preventDefault();
      this.formSubmitHandler();
    });
    this.username.addEventListener("keyup", () => {
      this.isChanged(this.username, this.usernameHandler);
    });
    this.email.addEventListener("keyup", () => {
      this.isChanged(this.email, this.emailHandler);
    });
    this.password.addEventListener("keyup", () => {
      this.isChanged(this.password, this.passwordHandler);
    });
    this.username.addEventListener("blur", () => {
      this.isChanged(this.username, this.usernameHandler);
    });
    this.email.addEventListener("blur", () => {
      this.isChanged(this.email, this.emailHandler);
    });
    this.password.addEventListener("blur", () => {
      this.isChanged(this.password, this.passwordHandler);
    });
  }

  // methods
  formSubmitHandler() {
    this.usernameNow();
    this.usernameAfterDelay();
    this.emailAfterDelay();
    this.passwordNow();
    this.passwordAfterDelay();
    if (
      this.username.isUnique &&
      !this.username.errors &&
      this.email.isUnique &&
      !this.email.errors &&
      !this.password.errors
    ) {
      this.form.submit();
    }
  }

  isChanged(el, handler) {
    if (el.previousValue != el.value) {
      handler.call(this);
    }
    el.previousValue = el.value;
  }

  usernameHandler() {
    this.username.errors = false;
    this.usernameNow();
    clearTimeout(this.username.timer);
    this.username.timer = setTimeout(() => this.usernameAfterDelay(), 800);
  }

  passwordHandler() {
    this.password.errors = false;
    this.passwordNow();
    clearTimeout(this.password.timer);
    this.password.timer = setTimeout(() => this.passwordAfterDelay(), 800);
  }

  passwordNow() {
    if (this.password.value.length > 50) {
      this.showValidationError(
        this.password,
        "Password can not exceed 50 characters"
      );
    }
    if (!this.password.errors) {
      this.hideValidationError(this.password);
    }
  }

  passwordAfterDelay() {
    if (this.password.value.length < 12) {
      this.showValidationError(
        this.password,
        "Password must be at least 12 characters long"
      );
    }
  }

  emailHandler() {
    this.email.errors = false;
    clearTimeout(this.email.timer);
    this.email.timer = setTimeout(() => this.emailAfterDelay(), 800);
  }

  emailAfterDelay() {
    if (
      !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        this.email.value
      )
    ) {
      this.showValidationError(
        this.email,
        "You must provide a valid email address"
      );
    }
    if (!this.email.errors) {
      axios
        .post("/doesEmailExist", { _csrf: this._csrf, email: this.email.value })
        .then(response => {
          if (response.data) {
            this.email.isUnique = false;
            this.showValidationError(this.email, "That email is already taken");
          } else {
            this.email.isUnique = true;
            this.hideValidationError(this.email);
          }
        })
        .catch(() => {
          console.log("There was an error");
        });
    }
  }

  usernameNow() {
    if (
      this.username.value != "" &&
      !/^([a-zA-Z0-9]+)$/.test(this.username.value)
    ) {
      this.showValidationError(
        this.username,
        "Username can only contain letters and numbers!"
      );
    }
    if (this.username.value.length > 30) {
      this.showValidationError(
        this.username,
        "Username can not be longer than 30 characters"
      );
    }
    if (!this.username.errors) {
      this.hideValidationError(this.username);
    }
  }

  hideValidationError(el) {
    el.nextElementSibling.classList.remove("liveValidateMessage--visible");
  }

  showValidationError(el, message) {
    el.nextElementSibling.innerHTML = message;
    el.nextElementSibling.classList.add("liveValidateMessage--visible");
    el.errors = true;
  }

  usernameAfterDelay() {
    if (this.username.value.length < 3) {
      this.showValidationError(
        this.username,
        "Username must be at least 3 characters long"
      );
    }
    if (!this.username.errors) {
      axios
        .post("/doesUsernameExist", {
          _csrf: this._csrf,
          username: this.username.value
        })
        .then(response => {
          if (response.data) {
            this.showValidationError(
              this.username,
              "That username is already taken"
            );
            this.username.isUnique = false;
          } else {
            this.username.isUnique = true;
          }
        })
        .catch(() => {
          console.log("please try again later");
        });
    }
  }

  insertValidationElements() {
    this.allFields.forEach(function(el) {
      el.insertAdjacentHTML(
        "afterend",
        '<div class="alert alert-danger small liveValidateMessage"></div>'
      );
    });
  }
}
