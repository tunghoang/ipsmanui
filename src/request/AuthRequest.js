import BaseModelRequest from './base/BaseModelRequest';

export default class AuthRequest extends BaseModelRequest {

  getModelName() {
    return 'users'
  }

  login(username, password) {
    let params = {
      username: username,
      password: password,
    }
    return this.post('/login/', params);
  }

  logout() {
    return this.get('/logout/');
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

  resetPassword(params) {
    return this.post('/reset-password', params);
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
