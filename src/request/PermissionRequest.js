import BaseModelRequest from './base/BaseModelRequest';

export default class PermissionRequest extends BaseModelRequest {

  getModelName() {
    return 'permissions'
  }
  getList(params) {
    return this.get('/permissions/', params);
  }

  find(params) {
    return this.put(`/permissions/`, params);
  }

  create(params) {
    return this.post('/permissions/', params);
  }

  delete(permissionId) {
    return this.del(`/permissions/${permissionId}`);
  }
}
