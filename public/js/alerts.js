/* eslint-disable */

export const hideAlert = () => {
  //if there is a alert element then removing the aler element from the page by this
  const el = document.querySelector('.alert');
  if (el) {
    el.parentElement.removeChild(el); //indirect method
  }
};

// type is 'success' or 'error'
export const showAlert = (type, msg) => {
  //first removing all existing alertboxes
  hideAlert();
  //createing alert box
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  //mounting alert element on starting of body elment(top of page)
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  //removing the alert after 1.5secs
  window.setTimeout(hideAlert, 3500);
};
