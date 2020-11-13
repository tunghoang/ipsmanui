import BaseModelRequest from './base/BaseModelRequest';

export default class EngineRequest extends BaseModelRequest {

  getModelName() {
    return 'engines'
  }
  getList(params) {
    return this.get('/engines/', params);
  }

  find(params) {
    return this.put(`/engines/`, params);
  }

  update(engineId, params) {
    return this.put(`/engines/${engineId}`, params);
  }

  create(params) {
    return this.post('/engines/', params);
  }

  detail(engineId) {
    return this.get(`/engines/${engineId}`);
  }

  export(params) {
    return this.get('/engines/', params);
  }

  delete(engineId) {
    return this.del(`/engines/${engineId}`);
  }
}
