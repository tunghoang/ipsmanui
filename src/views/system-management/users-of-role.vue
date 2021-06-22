<template>
  <div class="app-container">
    <div class="filter-container">
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
      <el-table-column :label="$t('table.id')" prop="idUserrolerel" sortable align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.idUserrolerel }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.username')" prop="username" sortable align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" fixed="right" align="center" width="100" class-name="small-padding fixed-width">
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
        <el-form-item :label="$t('table.username')" prop="idUser">
          <el-select
            data-vv-validate-on="none"
            v-validate="'required'"
            :class="{ error: errors.has('username') }"
            v-model="temp.idUser"
            tabindex="1"
            @focus="resetError"
            name="role"
            :placeholder="$t('table.username')">
            <el-option
              v-for="item in users"
              :key="item.idUser"
              :label="item.username"
              :value="item.idUser">
              <!-- :disabled="idRoleAssigned.includes(item.idRole)" -->
            </el-option>
          </el-select>
          <div class="el-form-item__error" v-if="errors.has('username')">
            {{ errors.first('username') }}
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="createData()" :loading="isSubmitting">
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
import { map } from 'lodash'

export default {
  name: 'UserOfRole',
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
        idRole: undefined,
        sort: 'updated_at',
        order: 'desc'
      },
      changePassword: false,
      temp: {
        idRole: undefined,
        idUser: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: this.$t('table.edit'),
        create: this.$t('table.create'),
        upload: this.$t('upload.title')
      },
      users: [],
      isSubmitting: false
    }
  },
  created () {
    this.params.idRole = this.$route.params.id
    this.temp.idRole = this.$route.params.id
  },
  async mounted() {
    await this.loadUsers()
  },
  methods: {
    loadUsers() {
      let params = {}
      rf.getRequest('UserRequest').getList(params)
      .then(async response => {
        this.users = map(response, user => {
          return {
            idUser: user.idUser,
            value: user.idUser,
            username: user.username
          }
        })
        await this.getList()
      })
      .catch(error => {
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
      })
    },
    getList() {
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
    handleRefreshTable() {
      this.listLoading = true
      this.params.page = 1
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
      await this.$validator.validate('role');
      if (this.errors.any()) {
        return;
      }
      this.isSubmitting = true
      rf.getRequest('UserRoleRelRequest').create(this.temp)
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
      .finally(() => {
        this.isSubmitting = false
      })
    },
    resetTemp() {
      this.temp = {
        ...this.temp,
        idUser: undefined
      }
    },
    handleDelete(row) {
      this.$confirm(this.$t('notify.text.delete'), 'Warning', {
        confirmButtonText: this.$t('action.ok'),
        cancelButtonText: this.$t('action.cancel'),
        type: 'warning',
        center: true
      }).then(() => {
        rf.getRequest('UserRoleRelRequest').delete(row.idUserrolerel)
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
