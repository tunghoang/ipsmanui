import MasterdataRequest from './MasterdataRequest';
import AuthRequest from './AuthRequest';
import UserRequest from './UserRequest';
import RoleRequest from './RoleRequest';
import UserRoleRelRequest from './UserRoleRelRequest';
import ContainmentRelRequest from './ContainmentRelRequest';
import EngineRequest from './EngineRequest';
import EngineTypeRequest from './EngineTypeRequest';
import PermissionRequest from './PermissionRequest';

const requestMap = {
  MasterdataRequest,
  AuthRequest,
  UserRequest,
  RoleRequest,
  UserRoleRelRequest,
  ContainmentRelRequest,
  EngineTypeRequest,
  EngineRequest,
  PermissionRequest
};

const instances = {};

export default class RequestFactory {

  static getRequest(classname) {
    let RequestClass = requestMap[classname];
    if (!RequestClass) {
      throw new Error('Invalid request class name: ' + classname);
    }

    let requestInstance = instances[classname];
    if (!requestInstance) {
        requestInstance = new RequestClass();
        instances[classname] = requestInstance;
    }

    return requestInstance;
  }

}