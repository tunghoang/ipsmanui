<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col" @click.native="$router.push({ name: 'UserList' })">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="peoples" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            {{ $t('route.user_list') }}
          </div>
          <span :start-val="0" :duration="2600" class="card-panel-num">{{ summary.users }}</span>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col" @click.native="$router.push({ name: 'EngineList' })">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-table">
          <svg-icon icon-class="server" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            {{ $t('route.engine_list') }}
          </div>
          <span :start-val="0" :duration="2600" class="card-panel-num">{{ summary.engines }}</span>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col" @click.native="$router.push({ name: 'EngineTypeList' })">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-form">
          <svg-icon icon-class="engine-type" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            {{ $t('route.engine_type_list') }}
          </div>
          <span :start-val="0" :duration="2600" class="card-panel-num">{{ summary.enginetypes }}</span>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col" @click.native="$router.push({ name: 'RoleList' })">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-example">
          <svg-icon icon-class="role" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            {{ $t('route.role_list') }}
          </div>
          <span :start-val="0" :duration="2600" class="card-panel-num">{{ summary.roles }}</span>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col" @click.native="$router.push({ name: 'IpsList', query: { idEnginetype: 2 } })">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-table">
          <svg-icon icon-class="host" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            {{ $t('route.host_ips') }}
          </div>
          <span :start-val="0" :duration="2600" class="card-panel-num">{{ summary.hostIps }}</span>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col" @click.native="$router.push({ name: 'IpsList', query: { idEnginetype: 1 } })">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-net">
          <svg-icon icon-class="netIPS" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            {{ $t('route.net_ips') }}
          </div>
          <span :start-val="0" :duration="2600" class="card-panel-num">{{ summary.netIps }}</span>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import rf from 'requestfactory'
import { Message } from 'element-ui'
  export default {
    data() {
      return {
        summary: {
          users: 0,
          roles: 0,
          engines: 0,
          enginetypes: 0,
          hostIps: 0,
          netIps: 0
        }
      }
    },
    created () {
      this.getUsers()
    },
    methods: {
      getUsers() {
        rf.getRequest('UserRequest').getList({})
        .then(async response => {
          this.summary.users = response.length
          this.getRoles()
        })
        .catch(error => {
          this.errors.add({field: 'error', msg: error.response.data.message});
          Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
        })
      },
      getRoles() {
        rf.getRequest('RoleRequest').getList({})
        .then(async response => {
          this.summary.roles = response.length
          this.getEngineTypes()
        })
        .catch(error => {
          this.errors.add({field: 'error', msg: error.response.data.message});
          Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
        })
      },
      getEngines() {
        rf.getRequest('EngineRequest').getList({})
        .then(async response => {
          this.getIps()
          this.summary.engines = response.length
        })
        .catch(error => {
          this.errors.add({field: 'error', msg: error.response.data.message});
          Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
        })
      },
      getIps() {
        rf.getRequest('ContainmentRelRequest').getIpsList({})
        .then(async response => {
          this.summary.hostIps = response.filter(item => item.idEnginetype === 2).length
          this.summary.netIps = response.filter(item => item.idEnginetype === 1).length
        })
        .catch(error => {
          this.errors.add({field: 'error', msg: error.response.data.message});
          Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
        })
      },
      getEngineTypes() {
        rf.getRequest('EngineTypeRequest').getList({})
        .then(async response => {
          this.summary.enginetypes = response.length
          this.getEngines()
        })
        .catch(error => {
          this.errors.add({field: 'error', msg: error.response.data.message});
          Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
        })
      },
    }
  }
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;
  .card-panel-col {
    margin-bottom: 32px;
  }
  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);
    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }
      .icon-people {
        background: #40c9c6;
      }
      .icon-table {
        background: #c2c940;
      }
      .icon-example {
        background: #36a3f7;
      }
      .icon-education {
        background: #f4516c;
      }
      .icon-form {
        background: #34bfa3
      }
    }
    .icon-people {
      color: #40c9c6;
    }
    .icon-table {
      color: #c2c940;
    }
    .icon-example {
      color: #36a3f7;
    }
    .icon-education {
      color: #f4516c;
    }
    .icon-form {
      color: #34bfa3
    }
    .icon-net {
      color: #34bfa3
    }
    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }
    .card-panel-icon {
      float: left;
      font-size: 48px;
    }
    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;
      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }
      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}
@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }
  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;
    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>