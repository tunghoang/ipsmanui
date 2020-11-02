import BaseModelRequest from './base/BaseModelRequest';

export default class UserRoleRelRequest extends BaseModelRequest {

  getModelName() {
    return 'userRoleRels'
  }
  getList(params) {
    return this.get('/userRoleRels/', params);
  }

  delete(userId) {
    return this.del(`/users/${userId}`);
  }
}
