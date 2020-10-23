import BaseModelRequest from './base/BaseModelRequest';

export default class UserRequest extends BaseModelRequest {

  getModelName() {
    return 'users'
  }

  login(username, password) {
    let params = {
      username: username,
      password: password,
    }
    return this.post('/login', params);
  }

  register({ email, password, passwordConfirmation, username, dob, sex}) {
    let params = {
      email: email,
      password: password,
      password_confirmation: passwordConfirmation,
      agree_term: 1,
      username:username,
      dob: dob,
      sex: sex
    }
    return this.post('/create-account', params);
  }
  resendCode({ email}) {
    let params = {
      email: email
    }
    return this.post('/resend-code', params);
  }
  verify({email, verify_code}) {
    let params = {
      email: email,
      verify_code: verify_code
    }
    return this.post('/verify-account', params);
  }

  confirm(code) {
    return this.post('/confirm-email', { code });
  }

  resetPassword(params) {
    return this.post('/reset-password', params);
  }

  executeResetPassword({ email, username, password, passwordConfirmation, token }) {
    let params = {
      email,
      username,
      token,
      password,
      password_confirmation: passwordConfirmation,
    }
    return this.post('/execute-reset-password', params);
  }

  getCurrentUser(params) {
    return new Promise((resolve, reject) => {
      let url = '/user/profile';
      var self = this;
      resolve({
        success: true,
        message: 'success',
        data: {
          name: 'khiem',
          role: 'admin'
        }
      });
      // this.get(url, params)
      //     .then(function (user) {
      //       self.user = user;
      //       resolve(user);
      //     })
      //     .catch(function (error) {
      //       reject(error);
      //     });
    });
  }

  updateCurrentUser(params) {
    return new Promise((resolve, reject) => {
      let url = '/user/update-profile';
      var self = this;
      this.put(url, params)
          .then(function (user) {
            self.user = user;
            resolve(user);
          })
          .catch(function (error) {
            reject(error);
          });
    });
  }

  changePassword(params) {
    let url = '/user/change-password';
    return this.put(url, params);
  }

  getUserProfile() {
    return this.get('/user/profile');
  }
}
