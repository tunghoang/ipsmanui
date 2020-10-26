import BaseModelRequest from './base/BaseModelRequest';

export default class UserRequest extends BaseModelRequest {

  getModelName() {
    return 'users'
  }
  getList(params) {
    return this.get('/users/', params);
  }

  update(userId, params) {
    return this.put(`/users/${userId}`, params);
  }

  create(params) {
    return this.post('/users/', params);
  }

  export(params) {
    return this.get('/users/', params);
  }

  delete(userId) {
    return this.del(`/users/${userId}`);
  }
}
