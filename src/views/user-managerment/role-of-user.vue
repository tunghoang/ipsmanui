<template>
  <div class="app-container student">
    <div class="filter-container">
      <el-autocomplete
                v-model="userSelect"
                class="filter-item"
                value="username"
                clearable
                @select="handleAutocomplete"
                :fetch-suggestions="querySearchAsync"
                @keyup.enter.native="handleAutocomplete"
                @clear="handleRefreshTable"
                :placeholder="$t('table.user')">
        <template slot-scope="{ item }">
          <span class="value">{{ item.username }}</span>
        </template>
      </el-autocomplete>
      <el-button v-waves class="filter-item ml-1" type="primary" icon="el-icon-search" @click="handleFindTable">
        {{ $t('table.search') }}
      </el-button>
      <el-button style="float: right;" class="filter-item float-right" type="primary" icon="el-icon-plus" @click="handleCreateSingle">
        {{ $t('table.add') }}
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      fit
      stripe
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column :label="$t('table.id')" prop="idUser" sortable align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.idUser }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" fixed="right" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="danger" size="mini" @click="handleDelete(row)">
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column> 
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="params.page" :limit.sync="params.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" @close="resetError()">
      <el-form ref="dataFormSingle" :model="temp" label-position="left" label-width="100px" style="width: 100%">
        <el-form-item :label="$t('table.username')" prop="username">
          <el-input v-model="temp.username"
                    tabindex="1"
                    @focus="resetError"
                    name="username"
                    :placeholder="$t('table.username')"
                    :class="{ error: errors.has('username') }"
                    data-vv-validate-on="none"
                    v-validate="'required|min:2|max:255'"  />
          <div class="el-form-item__error" v-if="errors.has('username')">
            {{ errors.first('username') }}
          </div>
        </el-form-item>
        <el-form-item :label="$t('table.change_password')" v-if="dialogStatus !== 'create'">
          <el-switch v-model="changePassword" />
        </el-form-item>
        <el-form-item :label="$t('table.password')" v-if="dialogStatus === 'create' || changePassword">
          <el-input v-model="temp.password"
                    tabindex="1"
                    show-password
                    @focus="resetError"
                    name="password"
                    :placeholder="$t('table.password')"
                    :class="{ error: errors.has('password') }"
                    data-vv-validate-on="none"
                    v-validate="'required|min:4|max:255'" />
          <div class="el-form-item__error" v-if="errors.has('password')">
            {{ errors.first('password') }}
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import rf from 'requestfactory'
import { Message } from 'element-ui'
import RemoveErrorsMixin from 'common/RemoveErrorsMixin'

export default {
  name: 'UserList',
  components: { Pagination },
  directives: { waves },
  mixins: [RemoveErrorsMixin],
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      params: {
        page: 1,
        limit: 20,
        idUser: undefined,
        sort: 'updated_at',
        order: 'desc'
      },
      changePassword: false,
      temp: {
        idRole: undefined,
        name: '',
        description: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: this.$t('table.edit'),
        create: this.$t('table.create'),
        upload: this.$t('upload.title')
      },
      fileList: [],
      users: [],
      userSelect: '',
      options: [],
      isSubmitting: false
    }
  },
  async mounted() {
    await this.loadUsers()
  },
  methods: {
    loadUsers() {
      let params = {}
      rf.getRequest('UserRequest').getList(params)
      .then(async response => {
        this.users = window._.map(response, user => {
          return {
            idUser: user.idUser,
            value: user.username,
            username: user.username
          }
        })
        await this.getList()
        this.options = window._.cloneDeep(this.users)
      })
      .catch(error => {
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
      });
    },
    querySearchAsync(queryString, cb) {
      var users = this.users;
      var results = queryString ? users.filter(this.createFilter(queryString)) : users;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 1000 * Math.random());
    },
    createFilter(queryString) {
      return (link) => {
        return (link.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
      };
    },
    getList() {
      rf.getRequest('UserRoleRelRequest').getList(this.params)
      .then(async response => {
        this.list = response
        this.total = response.length
      })
      .catch(error => {
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
      })
      .finally(() => this.listLoading = false)
    },
    find() {
      rf.getRequest('UserRoleRelRequest').find(this.params)
      .then(async response => {
        this.list = response
        this.total = response.length
      })
      .catch(error => {
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
      })
      .finally(() => this.listLoading = false)
    },
    handleAutocomplete (value) {
      this.params.idUser = value.idUser
      this.handleFindTable()
    },
    handleFindTable () {
      this.listLoading = true
      this.params.page = 1
      this.find()
    },
    handleRefreshTable() {
      this.listLoading = true
      this.params.page = 1
      this.params.idUser = undefined
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
        this.sortBy(prop, order)
    },
    getSortClass: function() {
      const order = this.params.order
      return order === `asc`
      ? 'ascending'
      : order === `desc`
      ? 'descending'
      : ''
    },
    sortBy(col, order) {
      this.params.sort = col
      if (order === 'ascending') {
        this.params.order = 'asc'
      } else {
        this.params.order = 'desc'
      }
      this.handleFilter()
    },
    handleFilter() {
      this.params.page = 1
      this.getList()
    },
    handleError(error) {
      this.convertRemoteErrors(error);
      if (this.errors.has('error')) {
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
      }
    },
    handleCreateSingle() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataFormSingle'].clearValidate()
      })
    },
    async createData() {
      this.resetError();
      if (this.isSubmitting) {
        return;
      }
      await this.$validator.validate('username');
      await this.$validator.validate('password');
      if (this.errors.any()) {
        return;
      }
      rf.getRequest('RoleRequest').create(this.temp)
      .then(() => {
        this.dialogFormVisible = false
        this.$notify({
          title: this.$t('notify.success.label'),
          message: this.$t('notify.success.createSuccess'),
          type: 'success',
          duration: 1000,
          showClose: false
        })
        this.handleRefreshTable()
      })
      .catch(error => {
        this.handleError(error)
      })

    },
    resetTemp() {
      this.temp = {
        idUser: undefined,
        username: '',
        description: ''
      }
    },
    handleDelete(row) {
      this.$confirm(this.$t('notify.text.delete'), 'Warning', {
        confirmButtonText: this.$t('action.ok'),
        cancelButtonText: this.$t('action.cancel'),
        type: 'warning',
        center: true
      }).then(() => {
        rf.getRequest('RoleRequest').delete(row.idUser)
          .then(() => {
            this.$message({
              type: 'success',
              message: this.$t('notify.success.deleteSuccess')
            })
            this.handleRefreshTable()
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('notify.info.cancel'),
        });
      });
    }
  },
}
</script>
<style lang="scss">
  .student {
    .el-dialog {
        max-width: 500px;
      }
    .upload-student {
      .el-upload.el-upload--text {
        width: 100%;
        .el-upload-dragger {
          width: 100%;
        }
      }
    }
  }
  @media screen and (max-width: 768px) {
    .student {
      .el-dialog {
        width: 80%;
      }
    }
  }
  @media screen and (max-width: 546px) {
    .student {
      .el-dialog {
        width: 96%;
      }
    }
  }
</style>
