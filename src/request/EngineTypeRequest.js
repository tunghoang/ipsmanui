import BaseModelRequest from './base/BaseModelRequest';

export default class EngineTypeRequest extends BaseModelRequest {

  getModelName() {
    return 'enginetype'
  }
  getList(params) {
    return this.get('/enginetypes/', params);
  }

  find(params) {
    return this.put(`/enginetypes/`, params);
  }

  update(enginetypeId, params) {
    return this.put(`/enginetypes/${enginetypeId}`, params);
  }

  create(params) {
    return this.post('/enginetypes/', params);
  }

  export(params) {
    return this.get('/enginetypes/', params);
  }

  delete(enginetypeId) {
    return this.del(`/enginetypes/${enginetypeId}`);
  }
}
