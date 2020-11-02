import MasterdataRequest from './MasterdataRequest';
import DashBoardRequest from './DashBoardRequest';
import AuthRequest from './AuthRequest';
import UserRequest from './UserRequest';
import RoleRequest from './RoleRequest';
import StudentRequest from './StudentRequest';
import UniversityRequest from './UniversityRequest';
import UserRoleRelRequest from './UserRoleRelRequest';
import ContainmentRelRequest from './ContainmentRelRequest';
import EngineRequest from './EngineRequest';
import EngineTypeRequest from './EngineTypeRequest';

const requestMap = {
  MasterdataRequest,
  DashBoardRequest,
  AuthRequest,
  UserRequest,
  RoleRequest,
  StudentRequest,
  UniversityRequest,
  UserRoleRelRequest,
  ContainmentRelRequest,
  EngineTypeRequest,
  EngineRequest
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