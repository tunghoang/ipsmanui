import BaseModelRequest from './base/BaseModelRequest';

export default class ContainmentRelRequest extends BaseModelRequest {

  getModelName() {
    return 'containmentRels'
  }
  allObjects(params) {
    return this.get('/objects/', params);
  }

  getList(params) {
    return this.get('/containmentRels/', params);
  }

  getChildNode(params) {
    return this.put(`/containmentRels/`, params);
  }

  addToGroup(params) {
    return this.post('/containmentRels/', params);
  }

  moveToGroup(params) {
    return this.post('/containmentRels/', params);
  }

  getIpsList(params) {
    return this.get('/objects/ips', params);
  }

  create(params) {
    return this.post('/objects/', params);
  }

  detail(objectId) {
    return this.get(`/objects/${objectId}`);
  }
  nodeDetails(objectId) {
    return this.get(`/objects/details/${objectId}`)
  }

  update(objectId, params) {
    return this.put(`/objects/${objectId}`, params);
  }

  delete(objectId) {
    return this.del(`/objects/${objectId}`);
  }

  checkHostStatus(objectId) {
    return this.get(`/control/status/${objectId}`);
  }

  startHost(objectId) {
    return this.get(`/control/start/${objectId}`);
  }

  stopHost(objectId) {
    return this.get(`/control/stop/${objectId}`);
  }

  startHost1(objectId) {
    return this.get(`/control/ansStart/${objectId}`);
  }

  stopHost1(objectId) {
    return this.get(`/control/ansStop/${objectId}`);
  }

  queryHost(objectId, idEnginetype) {
    //return this.get(`/control/query/modsec-rules/${objectId}`)
    return this.post(`/control/query/rules/${objectId}`, {idEnginetype})
  }

  addRuleset(objectId, params) {
    return this.post(`/control/ruleset/${objectId}`, params);
  }

  deleteRuleset(objectId, params) {
    return this.del(`/control/ruleset/${objectId}`, params);
  }

  monitorDirectories(objectId) {
    return this.get(`/control/watchList/${objectId}`);
    /*return Promise.resolve({
      status: 'ok',
      data: [ 'xxx', 'yuuuu']
    })*/
  }

  updateMonitorDirectories(objectId, params) {
    return this.put(`/control/watchList/${objectId}`, params);
  }
}
