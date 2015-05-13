import dispatcher from '../lib/dispatcher';

class LoginActions {
  updateApiKey (apiKey) {
    // check if valid
    const isValid = true;
    this.dispatch({ apiKey, isValid });
  }
}

export default dispatcher.createActions(LoginActions);
