import axios from 'axios'

const API = {
    CPUINFO: "monitor/cpuinfo",
    CPUPERCENT: "monitor/cpupercentage",
    RUNTIMEOS: "monitor/runtimeos",
    MEMSTAT: "monitor/memstat",
    DISKSTAT: "monitor/diskstat",
    HOSTSTAT: "monitor/hoststat",
    INTERFACES: "monitor/interfaces"
}

export const rules = async (params) => {
  return await axios({
    method: 'get',
    url: 'https://ipsmanagerapi.uetis.com/netips/rules',
    params,
    headers: {
      authorization: localStorage.getItem('token')
    }
  })
}

export const cpuInfo = async (params) => {
  return await axios({
    method: 'get',
    url: `https://ipsmanagerapi.uetis.com/${API.CPUINFO}`,
    params,
    headers: {
      authorization: localStorage.getItem('token')
    }
  })
}

export const cpuPercentage = async (params) => {
  return await axios({
    method: 'get',
    url: `https://ipsmanagerapi.uetis.com/${API.CPUPERCENT}`,
    params,
    headers: {
      authorization: localStorage.getItem('token')
    }
  })
}

export const runtimeOs = async (params) => {
  return await axios({
    method: 'get',
    url: `https://ipsmanagerapi.uetis.com/${API.RUNTIMEOS}`,
    params,
    headers: {
      authorization: localStorage.getItem('token')
    }
  })
}

export const memStat = async (params) => {
  return await axios({
    method: 'get',
    url: `https://ipsmanagerapi.uetis.com/${API.MEMSTAT}`,
    params,
    headers: {
      authorization: localStorage.getItem('token')
    }
  })
}

export const diskStat = async (params) => {
  return await axios({
    method: 'get',
    url: `https://ipsmanagerapi.uetis.com/${API.DISKSTAT}`,
    params,
    headers: {
      authorization: localStorage.getItem('token')
    }
  })
}

export const hostStat = async (params) => {
  return await axios({
    method: 'get',
    url: `https://ipsmanagerapi.uetis.com/${API.HOSTSTAT}`,
    params,
    headers: {
      authorization: localStorage.getItem('token')
    }
  })
}

export const getInterfaces = async (params) => {
  return await axios({
    method: 'get',
    url: `https://ipsmanagerapi.uetis.com/${API.INTERFACES}`,
    params,
    headers: {
      authorization: localStorage.getItem('token')
    }
  })
}

export const models = async (params) => {
  return await axios({
    method: 'get',
    url: 'https://ipsmanagerapi.uetis.com/templates',
    params,
    headers: {
      authorization: localStorage.getItem('token')
    }
  })
}